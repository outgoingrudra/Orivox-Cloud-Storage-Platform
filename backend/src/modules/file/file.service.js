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
  getMimeFilter,
} from "./file.helper.js";
import {
  requireFilePermission,
  requireFolderPermission,
  PERMISSION,
} from "../share/share.permission.js";
import { AppError } from "../../utils/AppError.js";

const UPLOAD_EXPIRY_MS = 15 * 60 * 1000;

const PRESIGNED_URL_EXPIRY_SECONDS = 15 * 60;
export async function cleanupExpiredReservations(ownerId) {
  const expired = await prisma.uploadReservation.findMany({
    where: {
      ownerId,
      status: "PENDING",

      expiresAt: {
        lt: new Date(),
      },
    },

    select: {
      id: true,
      size: true,
      objectKey: true,
      ownerId: true,
    },
  });

  for (const reservation of expired) {
    const released = await prisma.$transaction(async (tx) => {
      /*
            Claim the reservation only if
            it is still PENDING.

            This prevents double quota release
            if multiple cleanup processes run.
          */
      const updated = await tx.uploadReservation.updateMany({
        where: {
          id: reservation.id,
          ownerId: reservation.ownerId,
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
          id: reservation.ownerId,
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

    // Remove possible orphaned B2 object
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
}
export async function initiateUpload({
  userId,
  fileName,
  mimeType,
  size,
  folderId,
}) {
  const fileSize = BigInt(size);

  let ownerId = userId;

  // ==================== DESTINATION ====================

  if (folderId) {
    await requireFolderPermission({
      folderId,
      userId,
      minimum: PERMISSION.EDITOR,
    });

    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },

      select: {
        id: true,
        userId: true,
      },
    });

    if (!folder) {
      throw new AppError("Destination folder not found", 404);
    }

    /*
      File uploaded inside a folder belongs
      to that folder's owner.

      Example:
      Rudra owns folder.
      John is editor.
      John uploads.
      File still belongs to Rudra.
    */
    ownerId = folder.userId;
  }

  // Clean reservations belonging to the storage owner
  await cleanupExpiredReservations(ownerId);

  // ==================== OBJECT KEY ====================

  const objectKey = generateObjectKey({
    userId: ownerId,
    fileName,
  });

  // ==================== RESERVE OWNER STORAGE ====================

  const reservation = await prisma.$transaction(async (tx) => {
    const owner = await tx.user.findUnique({
      where: {
        id: ownerId,
      },

      select: {
        storageUsed: true,
        storageReserved: true,
        storageLimit: true,
      },
    });

    if (!owner) {
      throw new AppError("Storage owner not found", 404);
    }

    const requiredStorage =
      owner.storageUsed + owner.storageReserved + fileSize;

    if (requiredStorage > owner.storageLimit) {
      throw new AppError("Storage limit exceeded", 413);
    }

    await tx.user.update({
      where: {
        id: ownerId,
      },

      data: {
        storageReserved: {
          increment: fileSize,
        },
      },
    });

    return tx.uploadReservation.create({
      data: {
        ownerId,

        // Person actually making request
        initiatedById: userId,

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

  // ==================== PRESIGNED URL ====================

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
}

export async function cancelUpload({ userId, reservationId }) {
  const reservation = await prisma.$transaction(async (tx) => {
    const current = await tx.uploadReservation.findFirst({
      where: {
        id: reservationId,

        // Caller must be the original initiator
        initiatedById: userId,

        status: "PENDING",
      },
    });

    if (!current) {
      throw new AppError("Active upload reservation not found", 404);
    }

    // Claim reservation atomically
    const updated = await tx.uploadReservation.updateMany({
      where: {
        id: current.id,

        initiatedById: userId,

        status: "PENDING",
      },

      data: {
        status: "CANCELLED",
      },
    });

    if (updated.count !== 1) {
      throw new AppError("Upload reservation already processed", 409);
    }

    /*
          IMPORTANT:
          reserved quota belongs to owner,
          NOT necessarily uploader.
        */
    await tx.user.update({
      where: {
        id: current.ownerId,
      },

      data: {
        storageReserved: {
          decrement: current.size,
        },
      },
    });

    return current;
  });

  // Delete possible uploaded/orphan object
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
}
export async function confirmUpload({ userId, reservationId }) {
  const reservation = await prisma.uploadReservation.findFirst({
    where: {
      id: reservationId,
      initiatedById: userId,
      status: "PENDING",
    },
  });

  if (!reservation) {
    throw new AppError("Upload reservation not found", 404);
  }

  if (reservation.expiresAt < new Date()) {
    throw new AppError("Upload reservation expired", 400);
  }

  // ==================== CHECK DESTINATION FOLDER ====================

  if (reservation.folderId) {
    try {
      await requireFolderPermission({
        folderId: reservation.folderId,
        userId,
        minimum: PERMISSION.EDITOR,
      });
    } catch {
      await cancelUpload({
        userId,
        reservationId,
      });

      throw new AppError("Destination folder is no longer available", 409);
    }
  }

  // ==================== VERIFY OBJECT EXISTS ====================

  let head;

  try {
    head = await storageClient.send(
      new HeadObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: reservation.objectKey,
      }),
    );
  } catch {
    throw new AppError("Uploaded file not found in storage", 400);
  }

  // ==================== VERIFY FILE SIZE ====================

  const actualSize = BigInt(head.ContentLength ?? 0);

  if (actualSize !== reservation.size) {
    try {
      await storageClient.send(
        new DeleteObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: reservation.objectKey,
        }),
      );
    } catch (error) {
      console.error("Failed to delete invalid uploaded object:", error);
    }

    await cancelUpload({
      userId,
      reservationId,
    });

    throw new AppError("Uploaded file size does not match reservation", 400);
  }

  // ==================== FINALIZE UPLOAD ====================

  const file = await prisma.$transaction(async (tx) => {
    const latestReservation = await tx.uploadReservation.findFirst({
      where: {
        id: reservationId,

        // The caller must be the one who initiated it
        initiatedById: userId,

        status: "PENDING",
      },
    });

    if (!latestReservation) {
      throw new AppError("Upload already processed", 409);
    }

    const createdFile = await tx.file.create({
      data: {
        name: latestReservation.fileName,

        objectKey: latestReservation.objectKey,

        mimeType: latestReservation.mimeType,

        size: latestReservation.size,

        // IMPORTANT:
        // file belongs to storage/folder owner
        userId: latestReservation.ownerId,

        folderId: latestReservation.folderId,
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

    // Quota also belongs to owner
    await tx.user.update({
      where: {
        id: latestReservation.ownerId,
      },

      data: {
        storageReserved: {
          decrement: latestReservation.size,
        },

        storageUsed: {
          increment: latestReservation.size,
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
  });

  return {
    ...file,
    size: Number(file.size),
  };
}

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
  // By default, user is browsing their own root
  let resourceOwnerId = userId;

  // ==================== SHARED FOLDER ACCESS ====================

  if (folderId) {
    await requireFolderPermission({
      folderId,
      userId,
      minimum: PERMISSION.VIEWER,
    });

    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },

      select: {
        userId: true,
      },
    });

    if (!folder) {
      throw new AppError(
        "Folder not found",
        404
      );
    }

    /*
      Important:

      If user is browsing somebody else's
      shared folder, files belong to the
      folder owner, not necessarily req.user.
    */
    resourceOwnerId = folder.userId;
  }

  // ==================== MIME FILTER ====================

  const mimeFilter =
    type && type !== "other"
      ? getMimeFilter(type)
      : null;

  // ==================== QUERY ====================

  const where = {
    userId: resourceOwnerId,

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
export async function renameFile({ fileId, userId, name }) {
  await requireFilePermission({
    fileId,
    userId,
    minimum: PERMISSION.EDITOR,
  });

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
}

export async function moveFile({ fileId, userId, folderId }) {
  const permission = await requireFilePermission({
    fileId,
    userId,
    minimum: PERMISSION.EDITOR,
  });

  const existingFile = await prisma.file.findUnique({
    where: {
      id: fileId,
    },

    select: {
      id: true,
      userId: true,
      folderId: true,
    },
  });

  if (!existingFile) {
    throw new AppError("File not found", 404);
  }

  // ==================== MOVE TO ROOT ====================

  if (!folderId) {
    /*
      Only the actual owner can move a file
      to their root directory.

      A shared EDITOR cannot take someone
      else's file out of the owner's folder tree.
    */
    if (existingFile.userId !== userId) {
      throw new AppError("Shared files cannot be moved to your root", 403);
    }
  }

  // ==================== MOVE INTO FOLDER ====================

  if (folderId) {
    const destinationPermission = await requireFolderPermission({
      folderId,
      userId,
      minimum: PERMISSION.EDITOR,
    });

    const destination = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },

      select: {
        id: true,
        userId: true,
      },
    });

    if (!destination) {
      throw new AppError("Destination folder not found", 404);
    }

    /*
      Prevent moving somebody else's shared file
      into a folder owned by a completely different user.

      Example:

      John owns file A
      Rudra has EDITOR access to file A
      Rudra owns folder B

      Rudra should NOT move John's file into
      Rudra's own folder B.
    */
    if (existingFile.userId !== destination.userId) {
      throw new AppError(
        "File and destination folder must belong to the same owner",
        403,
      );
    }
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
}
export async function getFileDownloadUrl({ fileId, userId }) {
  await requireFilePermission({
    fileId,
    userId,
    minimum: PERMISSION.VIEWER,
  });

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: file.objectKey,
    ResponseContentType: file.mimeType,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
  });

  const downloadUrl = await getSignedUrl(storageClient, command, {
    expiresIn: 5 * 60,
  });

  return {
    downloadUrl,
    expiresIn: 300,
  };
}

export async function trashFile({ fileId, userId }) {
  const permission = await requireFilePermission({
    fileId,
    userId,
    minimum: PERMISSION.OWNER,
  });

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
}
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

export async function permanentlyDeleteFile({ fileId, userId }) {
  const file = await findOwnedFile(fileId, userId, {
    allowTrashed: true,
  });

  if (!file.isTrashed) {
    throw new AppError("File must be in trash before permanent deletion", 400);
  }

  // Delete actual object from B2 first
  try {
    await storageClient.send(
      new DeleteObjectCommand({
        Bucket: STORAGE_BUCKET,
        Key: file.objectKey,
      }),
    );
  } catch (error) {
    console.error(`B2 deletion failed for ${file.objectKey}:`, error);

    throw new AppError("Unable to delete file from storage", 502);
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


// ==================== GLOBAL EXPIRED RESERVATION CLEANUP ====================

export async function cleanupAllExpiredReservations() {
  const expiredReservations =
    await prisma.uploadReservation.findMany({
      where: {
        status: "PENDING",

        expiresAt: {
          lt: new Date(),
        },
      },

      select: {
        id: true,
        ownerId: true,
        size: true,
        objectKey: true,
      },

      // Don't process unlimited rows in one run
      take: 100,
    });

  let cleaned = 0;

  for (const reservation of expiredReservations) {
    const released =
      await prisma.$transaction(async (tx) => {
        /*
          Atomically claim this reservation.

          If another server/worker already processed it,
          updated.count will be 0.
        */
        const updated =
          await tx.uploadReservation.updateMany({
            where: {
              id: reservation.id,
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
            id: reservation.ownerId,
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

    /*
      The file may already have reached B2,
      but /confirm was never called.

      Delete possible orphan object.
    */
    try {
      await storageClient.send(
        new DeleteObjectCommand({
          Bucket: STORAGE_BUCKET,
          Key: reservation.objectKey,
        })
      );
    } catch (error) {
      console.error(
        `Failed deleting expired upload object ${reservation.objectKey}:`,
        error
      );
    }

    cleaned++;
  }

  return cleaned;
}