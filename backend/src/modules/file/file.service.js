import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import prisma from "../../config/prisma.js";

import { storageClient, STORAGE_BUCKET } from "../../config/storage.js";
import {
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  generateObjectKey,
  validateOwnedFolder,
  findOwnedFile,
  getMimeFilter
} from "./file.helper.js";

import { AppError } from "../../utils/AppError.js";

const UPLOAD_EXPIRY_MS = 15 * 60 * 1000;

const PRESIGNED_URL_EXPIRY_SECONDS = 15 * 60;

export const cleanupExpiredReservations = async (userId) => {
  const expired = await prisma.uploadReservation.findMany({
    where: {
      userId,
      status: "PENDING",

      expiresAt: {
        lt: new Date(),
      },
    },

    select: {
      id: true,
      size: true,
      objectKey: true,
    },
  });

  for (const reservation of expired) {
    const released = await prisma.$transaction(async (tx) => {
      const updated = await tx.uploadReservation.updateMany({
        where: {
          id: reservation.id,
          userId,
          status: "PENDING",
        },

        data: {
          status: "EXPIRED",
        },
      });

      if (updated.count !== 1) {
        return false;
      }

      await tx.user.update({
        where: {
          id: userId,
        },

        data: {
          storageReserved: {
            decrement: reservation.size,
          },
        },
      });

      return true;
    });

    if (!released) {
      continue;
    }

    // Clean object in case user uploaded it
    // but never called /confirm.
    try {
      await storageClient.send(
        new DeleteObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: reservation.objectKey,
        }),
      );
    } catch (error) {
      console.error(
        `Failed cleaning expired object ${reservation.objectKey}:`,
        error,
      );
    }
  }
};

export const initiateUpload = async ({
  userId,
  fileName,
  mimeType,
  size,
  folderId,
}) => {
  const fileSize = BigInt(size);

  await cleanupExpiredReservations(userId);

  await validateOwnedFolder({
    folderId,
    userId,
  });

  const objectKey = generateObjectKey({
    userId,
    fileName,
  });

  const reservation = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        storageUsed: true,
        storageReserved: true,
        storageLimit: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const requiredStorage = user.storageUsed + user.storageReserved + fileSize;

    if (requiredStorage > user.storageLimit) {
      throw new AppError("Storage limit exceeded", 413);
    }

    await tx.user.update({
      where: {
        id: userId,
      },

      data: {
        storageReserved: {
          increment: fileSize,
        },
      },
    });

    return tx.uploadReservation.create({
      data: {
        userId,
        folderId: folderId || null,

        fileName,
        mimeType,
        size: fileSize,
        objectKey,

        expiresAt: new Date(Date.now() + UPLOAD_EXPIRY_MS),
      },

      select: {
        id: true,
        objectKey: true,
        expiresAt: true,
      },
    });
  });

  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET,

    Key: objectKey,

    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(storageClient, command, {
    expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
  });

  return {
    reservationId: reservation.id,

    uploadUrl,

    objectKey: reservation.objectKey,

    expiresAt: reservation.expiresAt,
  };
};

export const cancelUpload = async ({ userId, reservationId }) => {
  const reservation = await prisma.$transaction(async (tx) => {
    const current = await tx.uploadReservation.findFirst({
      where: {
        id: reservationId,
        userId,
        status: "PENDING",
      },
    });

    if (!current) {
      throw new AppError("Active upload reservation not found", 404);
    }

    // Claim the reservation.
    // Only a PENDING reservation can become CANCELLED.
    const updated = await tx.uploadReservation.updateMany({
      where: {
        id: current.id,
        userId,
        status: "PENDING",
      },

      data: {
        status: "CANCELLED",
      },
    });

    if (updated.count !== 1) {
      throw new AppError("Upload reservation already processed", 409);
    }

    await tx.user.update({
      where: {
        id: userId,
      },

      data: {
        storageReserved: {
          decrement: current.size,
        },
      },
    });

    return current;
  });

  // There might already be an object if upload started
  // before the user cancelled.
  try {
    await storageClient.send(
      new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: reservation.objectKey,
      }),
    );
  } catch (error) {
    console.error("Unable to remove cancelled B2 object:", error);
  }

  return {
    reservationId,
  };
};

export const confirmUpload = async ({
  userId,
  reservationId,
}) => {
  const reservation =
    await prisma.uploadReservation.findFirst({
      where: {
        id: reservationId,
        userId,
        status: "PENDING",
      },
    });

  if (!reservation) {
    throw new AppError(
      "Upload reservation not found",
      404
    );
  }

  if (reservation.expiresAt < new Date()) {
    throw new AppError(
      "Upload reservation expired",
      400
    );
  }

  // ==================== CHECK DESTINATION FOLDER ====================

  if (reservation.folderId) {
    try {
      await validateOwnedFolder({
        folderId: reservation.folderId,
        userId,
      });
    } catch {
      /*
        Folder may have been trashed/moved into a
        trashed ancestor after upload was initiated.

        Release quota + remove possible B2 object.
      */
      await cancelUpload({
        userId,
        reservationId,
      });

      throw new AppError(
        "Destination folder is no longer available",
        409
      );
    }
  }

  // ==================== VERIFY OBJECT EXISTS ====================

  let head;

  try {
    head = await storageClient.send(
      new HeadObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: reservation.objectKey,
      })
    );
  } catch {
    throw new AppError(
      "Uploaded file not found in storage",
      400
    );
  }

  // ==================== VERIFY FILE SIZE ====================

  const actualSize =
    BigInt(head.ContentLength ?? 0);

  if (actualSize !== reservation.size) {
    // Delete wrong/incomplete object
    try {
      await storageClient.send(
        new DeleteObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: reservation.objectKey,
        })
      );
    } catch (error) {
      console.error(
        "Failed to delete invalid uploaded object:",
        error
      );
    }

    /*
      Release reservation too,
      otherwise storageReserved would remain locked.
    */
    await cancelUpload({
      userId,
      reservationId,
    });

    throw new AppError(
      "Uploaded file size does not match reservation",
      400
    );
  }

  // ==================== FINALIZE UPLOAD ====================

  const file = await prisma.$transaction(
    async (tx) => {
      /*
        Re-fetch inside transaction.

        This protects against:
        confirm being called twice
        cancel happening at the same time
        cleanup expiring the reservation
      */
      const latestReservation =
        await tx.uploadReservation.findFirst({
          where: {
            id: reservationId,
            userId,
            status: "PENDING",
          },
        });

      if (!latestReservation) {
        throw new AppError(
          "Upload already processed",
          409
        );
      }

      const createdFile =
        await tx.file.create({
          data: {
            name:
              latestReservation.fileName,

            objectKey:
              latestReservation.objectKey,

            mimeType:
              latestReservation.mimeType,

            size:
              latestReservation.size,

            userId,

            folderId:
              latestReservation.folderId,
          },

          select: {
            id: true,
            name: true,
            mimeType: true,
            size: true,
            folderId: true,
            createdAt: true,
          },
        });

      await tx.user.update({
        where: {
          id: userId,
        },

        data: {
          storageReserved: {
            decrement:
              latestReservation.size,
          },

          storageUsed: {
            increment:
              latestReservation.size,
          },
        },
      });

      await tx.uploadReservation.update({
        where: {
          id: latestReservation.id,
        },

        data: {
          status: "COMPLETED",
        },
      });

      return createdFile;
    }
  );

  return {
    ...file,
    size: Number(file.size),
  };
};

export async function listFiles({
  userId,
  folderId,
  search,
  type,
  sortBy,
  order,
  page,
  limit,
}) {
  if (folderId) {
    await validateOwnedFolder({
      folderId,
      userId,
    });
  }

  const mimeFilter =
    type && type !== "other"
      ? getMimeFilter(type)
      : null;

  const where = {
    userId,
    isTrashed: false,
    folderId: folderId || null,

    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {}),

    ...(mimeFilter
      ? {
          mimeType: mimeFilter,
        }
      : {}),
  };

  const skip =
    (page - 1) * limit;

  const [files, total] =
    await prisma.$transaction([
      prisma.file.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          [sortBy]: order,
        },

        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          folderId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.file.count({
        where,
      }),
    ]);

  return {
    files: files.map((file) => ({
      ...file,
      size: Number(file.size),
    })),

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(total / limit),

      hasNextPage:
        page * limit < total,

      hasPreviousPage:
        page > 1,
    },
  };
}
export const renameFile = async ({ fileId, userId, name }) => {
  await findOwnedFile(fileId, userId);

  const file = await prisma.file.update({
    where: {
      id: fileId,
    },

    data: {
      name,
    },

    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      folderId: true,
      updatedAt: true,
    },
  });

  return {
    ...file,
    size: Number(file.size),
  };
};

export const moveFile = async ({ fileId, userId, folderId }) => {
  await findOwnedFile(fileId, userId);

  if (folderId) {
    await validateOwnedFolder({
      folderId,
      userId,
    });
  }

  const file = await prisma.file.update({
    where: {
      id: fileId,
    },

    data: {
      folderId: folderId || null,
    },

    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      folderId: true,
      updatedAt: true,
    },
  });

  return {
    ...file,
    size: Number(file.size),
  };
};

export const getFileDownloadUrl = async ({ fileId, userId }) => {
  const file = await findOwnedFile(fileId, userId);

  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,

    Key: file.objectKey,

    ResponseContentType: file.mimeType,

    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
      file.name,
    )}"`,
  });

  const downloadUrl = await getSignedUrl(storageClient, command, {
    expiresIn: 5 * 60,
  });

  return {
    downloadUrl,
    expiresIn: 300,
  };
};

export const trashFile = async ({ fileId, userId }) => {
  await findOwnedFile(fileId, userId);

  const file = await prisma.file.update({
    where: {
      id: fileId,
    },

    data: {
      isTrashed: true,
      trashedAt: new Date(),
    },

    select: {
      id: true,
      name: true,
      isTrashed: true,
      trashedAt: true,
    },
  });

  return file;
};

export const restoreFile = async ({ fileId, userId }) => {
  const file = await findOwnedFile(fileId, userId, {
    allowTrashed: true,
  });

  if (!file.isTrashed) {
    throw new AppError("File is not in trash", 400);
  }

  let folderId = file.folderId;

  /*
    Original folder may itself have
    been moved to trash.

    In that case restore file to root.
  */

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },

      select: {
        id: true,
        isTrashed: true,
      },
    });

    if (!folder || folder.isTrashed) {
      folderId = null;
    }
  }

  const restored = await prisma.file.update({
    where: {
      id: fileId,
    },

    data: {
      isTrashed: false,
      trashedAt: null,
      folderId,
    },

    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      folderId: true,
      isTrashed: true,
    },
  });

  return {
    ...restored,
    size: Number(restored.size),
  };
};


export async function permanentlyDeleteFile({
  fileId,
  userId,
}) {
  const file = await findOwnedFile(
    fileId,
    userId,
    {
      allowTrashed: true,
    }
  );

  if (!file.isTrashed) {
    throw new AppError(
      "File must be in trash before permanent deletion",
      400
    );
  }

  // Delete actual object from B2 first
  try {
    await storageClient.send(
      new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: file.objectKey,
      })
    );
  } catch (error) {
    console.error(
      `B2 deletion failed for ${file.objectKey}:`,
      error
    );

    throw new AppError(
      "Unable to delete file from storage",
      502
    );
  }

  // Only update DB after storage deletion succeeds
  await prisma.$transaction([
    prisma.file.delete({
      where: {
        id: file.id,
      },
    }),

    prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        storageUsed: {
          decrement: file.size,
        },
      },
    }),
  ]);

  return true;
}