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
import { publishStorageDeletion } from "./file.publisher.js";
import { getValidRestoreParent } from "../folder/folder.helper.js";
import { invalidateDashboardCache } from "../dashboard/dashboard.cache.js";
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

  let dashboardChanged = false;

  for (const reservation of expired) {
    const deletionJob = await prisma.$transaction(async (tx) => {
      /*
        Atomically claim reservation.

        Only one process can change:
        PENDING → EXPIRED
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
        return null;
      }

      // Release reserved quota
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

      /*
        The object may or may not exist in B2.

        That's okay — deletion worker handles
        deleting this object idempotently.
      */

      const job = await tx.storageDeletionJob.create({
        data: {
          userId: reservation.ownerId,

          fileId: null,

          objectKey: reservation.objectKey,

          size: reservation.size,

          status: "PENDING",
        },

        select: {
          id: true,
        },
      });

      return job;
    });

    if (!deletionJob) {
      continue;
    }

    dashboardChanged = true;

    try {
      publishStorageDeletion(deletionJob.id);
    } catch (error) {
      /*
        Don't worry if RabbitMQ publish fails.

        StorageDeletionJob remains PENDING
        and recovery job will republish it.
      */

      console.error(
        `Failed to publish expired-upload deletion job ${deletionJob.id}:`,
        error,
      );
    }
  }

  // storageReserved changed, so cached storage
  // information is no longer valid.
  if (dashboardChanged) {
    await invalidateDashboardCache(ownerId);
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

  // ==================== DESTINATION FOLDER ====================

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

    // Files inside a shared folder belong
    // to the folder/storage owner.
    ownerId = folder.userId;
  }

  // ==================== CLEAN EXPIRED RESERVATIONS ====================

  await cleanupExpiredReservations(ownerId);

  // ==================== OBJECT KEY ====================

  const objectKey = generateObjectKey({
    userId: ownerId,
    fileName,
  });

  // ==================== ATOMIC QUOTA RESERVATION ====================

  const reservation = await prisma.$transaction(async (tx) => {
    /*
      Atomically reserve storage ONLY if:

      storageUsed
      + storageReserved
      + newFileSize
      <= storageLimit

      PostgreSQL handles concurrent UPDATEs
      safely on the same user row.
    */

    const updatedRows = await tx.$executeRaw`
      UPDATE "User"
      SET "storageReserved" = "storageReserved" + ${fileSize}
      WHERE "id" = ${ownerId}
      AND (
        "storageUsed"
        + "storageReserved"
        + ${fileSize}
      ) <= "storageLimit"
    `;

    if (updatedRows !== 1) {
      const ownerExists = await tx.user.findUnique({
        where: {
          id: ownerId,
        },

        select: {
          id: true,
        },
      });

      if (!ownerExists) {
        throw new AppError("Storage owner not found", 404);
      }

      throw new AppError("Storage limit exceeded", 413);
    }

    /*
      Because this is the SAME DB transaction,
      if reservation creation fails,
      storageReserved increment also rolls back.
    */

    return tx.uploadReservation.create({
      data: {
        ownerId,

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

  // storageReserved changed.
  await invalidateDashboardCache(ownerId);

  // ==================== PRESIGNED B2 URL ====================

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
  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.uploadReservation.findFirst({
      where: {
        id: reservationId,

        initiatedById: userId,

        status: "PENDING",
      },
    });

    if (!current) {
      throw new AppError("Active upload reservation not found", 404);
    }

    // ==================== CLAIM RESERVATION ====================

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

    // ==================== RELEASE QUOTA ====================

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

    // ==================== DELETION JOB ====================

    const deletionJob = await tx.storageDeletionJob.create({
      data: {
        userId: current.ownerId,

        fileId: null,

        objectKey: current.objectKey,

        size: current.size,

        status: "PENDING",
      },

      select: {
        id: true,
      },
    });

    return {
      reservation: current,
      deletionJob,
    };
  });

  // Transaction committed.
  // storageReserved has changed.
  await invalidateDashboardCache(result.reservation.ownerId);

  // ==================== PUBLISH ====================

  try {
    publishStorageDeletion(result.deletionJob.id);
  } catch (error) {
    console.error(
      `Failed to publish cancelled-upload deletion job ${result.deletionJob.id}:`,
      error,
    );
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

        // File belongs to storage/folder owner.
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

    // Quota belongs to owner.
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

  // Important:
  // reservation.ownerId is the actual
  // storage owner, not necessarily userId.
  await invalidateDashboardCache(reservation.ownerId);

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
      throw new AppError("Folder not found", 404);
    }

    /*
      If user is browsing somebody else's
      shared folder, query resources belonging
      to that folder's owner.
    */
    resourceOwnerId = folder.userId;
  }

  // ==================== MIME FILTER ====================

  const mimeFilter = type ? getMimeFilter(type) : {};

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

    ...mimeFilter,
  };

  const skip = (page - 1) * limit;

  const [files, total] = await prisma.$transaction([
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

      totalPages: Math.ceil(total / limit),

      hasNextPage: page * limit < total,

      hasPreviousPage: page > 1,
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

      // Needed for cache invalidation
      userId: true,

      name: true,
      mimeType: true,
      size: true,
      folderId: true,
      updatedAt: true,
    },
  });

  await invalidateDashboardCache(file.userId);

  return {
    ...file,
    size: Number(file.size),
  };
}

export async function moveFile({ fileId, userId, folderId }) {
  await requireFilePermission({
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
      Only actual owner can move a file
      to their root directory.

      A shared EDITOR cannot take someone
      else's file out of the owner's tree.
    */

    if (existingFile.userId !== userId) {
      throw new AppError("Shared files cannot be moved to your root", 403);
    }
  }

  // ==================== MOVE INTO FOLDER ====================

  if (folderId) {
    await requireFolderPermission({
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
      File and destination must belong
      to the same storage owner.
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

  await invalidateDashboardCache(existingFile.userId);

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
  await invalidateDashboardCache(userId);

  return file;
}
export async function restoreFile({ fileId, userId }) {
  await requireFilePermission({
    fileId,
    userId,
    minimum: PERMISSION.OWNER,
    allowTrashed: true,
  });

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (!file.isTrashed) {
    throw new AppError("File is not in trash", 400);
  }

  // Check the entire folder ancestor chain.
  //
  // If original folder or ANY ancestor is
  // unavailable/trashed, restore file to root.
  const folderId = await getValidRestoreParent({
    parentId: file.folderId,
    userId,
  });

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
  await invalidateDashboardCache(userId);

  return {
    ...restored,
    size: Number(restored.size),
  };
}

export async function permanentlyDeleteFile({ fileId, userId }) {
  // ==================== OWNER PERMISSION ====================

  await requireFilePermission({
    fileId,
    userId,
    minimum: PERMISSION.OWNER,
    allowTrashed: true,
  });

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },

    select: {
      id: true,
      userId: true,
      name: true,
      objectKey: true,
      size: true,
      isTrashed: true,
    },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (!file.isTrashed) {
    throw new AppError("File must be in trash before permanent deletion", 400);
  }

  // ==================== DATABASE TRANSACTION ====================

  const deletionJob = await prisma.$transaction(async (tx) => {
    /*
        Create deletion job FIRST.

        Durable record saying:
        "this B2 object must eventually
        be deleted."
      */

    const job = await tx.storageDeletionJob.create({
      data: {
        userId: file.userId,

        fileId: file.id,

        objectKey: file.objectKey,

        size: file.size,

        status: "PENDING",
      },

      select: {
        id: true,
      },
    });

    // Remove logical file metadata.

    await tx.file.delete({
      where: {
        id: file.id,
      },
    });

    /*
        Release used storage.

        Physical object cleanup can happen
        asynchronously afterward.
      */

    await tx.user.update({
      where: {
        id: file.userId,
      },

      data: {
        storageUsed: {
          decrement: file.size,
        },
      },
    });

    return job;
  });

  // PostgreSQL transaction has committed.
  // Redis is external infrastructure.
  await invalidateDashboardCache(file.userId);

  // ==================== PUBLISH DELETION JOB ====================

  try {
    publishStorageDeletion(deletionJob.id);
  } catch (error) {
    /*
      Don't undo logical deletion.

      StorageDeletionJob remains PENDING
      and recovery can republish it.
    */

    console.error(
      `Failed to publish storage deletion job ${deletionJob.id}:`,
      error,
    );
  }

  return {
    deletionJobId: deletionJob.id,

    message: "File scheduled for permanent deletion",
  };
}
// ==================== GLOBAL EXPIRED RESERVATION CLEANUP ====================
export async function cleanupAllExpiredReservations() {
  const expiredReservations = await prisma.uploadReservation.findMany({
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

    take: 100,
  });

  let cleaned = 0;

  // Avoid invalidating the same user's cache
  // repeatedly if they have multiple expired uploads.
  const affectedOwnerIds = new Set();

  for (const reservation of expiredReservations) {
    const deletionJob = await prisma.$transaction(async (tx) => {
      // ==================== CLAIM RESERVATION ====================

      const updated = await tx.uploadReservation.updateMany({
        where: {
          id: reservation.id,
          status: "PENDING",
        },

        data: {
          status: "EXPIRED",
        },
      });

      if (updated.count !== 1) {
        return null;
      }

      // ==================== RELEASE QUOTA ====================

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

      // ==================== CREATE DELETION JOB ====================

      return tx.storageDeletionJob.create({
        data: {
          userId: reservation.ownerId,

          fileId: null,

          objectKey: reservation.objectKey,

          size: reservation.size,

          status: "PENDING",
        },

        select: {
          id: true,
        },
      });
    });

    if (!deletionJob) {
      continue;
    }

    cleaned++;

    affectedOwnerIds.add(reservation.ownerId);

    // ==================== PUBLISH ====================

    try {
      publishStorageDeletion(deletionJob.id);
    } catch (error) {
      console.error(
        `Failed to publish expired-upload deletion job ${deletionJob.id}:`,
        error,
      );
    }
  }

  // Invalidate once per affected owner,
  // not once per expired reservation.
  await Promise.all(
    [...affectedOwnerIds].map((ownerId) => invalidateDashboardCache(ownerId)),
  );

  return cleaned;
}

export async function listTrashedFiles({ userId, page, limit }) {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    isTrashed: true,
  };

  const [files, total] = await prisma.$transaction([
    prisma.file.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        trashedAt: "desc",
      },

      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        folderId: true,
        trashedAt: true,
        createdAt: true,
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
      totalPages: Math.ceil(total / limit),

      hasNextPage: page * limit < total,

      hasPreviousPage: page > 1,
    },
  };
}
