
import prisma from "../../config/prisma.js";

import { AppError } from "../../utils/AppError.js";
import { generateApiKey } from "../../utils/apiKey.js";

import {
  initiateUpload,
  confirmUpload,
  getFileDownloadUrl,
  permanentlyDeleteFile,
} from "../file/file.service.js";

// ======================================================
// CONSTANTS
// ======================================================

const DEVELOPER_FOLDER_NAME = "uploads";

// ======================================================
// DEVELOPER ROOT FOLDER
// ======================================================

export async function getDeveloperFolder(userId) {
  let folder = await prisma.folder.findFirst({
    where: {
      userId,
      parentId: null,
      name: DEVELOPER_FOLDER_NAME,
      isTrashed: false,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (folder) return folder;

  folder = await prisma.folder.create({
    data: {
      userId,
      name: DEVELOPER_FOLDER_NAME,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return folder;
}

// ======================================================
// API KEYS
// ======================================================

export async function createDeveloperApiKey({
  userId,
  name,
}) {
  const count = await prisma.apiKey.count({
    where: {
      userId,
      revokedAt: null,
    },
  });

  // Free plan: one active API key.
  if (count >= 1) {
    throw new AppError(
      "Free plan allows only one active developer API key.",
      400,
    );
  }

  const { apiKey, keyHash, keyPrefix } =
    generateApiKey();

  const key = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPrefix,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  return {
    ...key,

    /*
      The raw key is returned ONLY here.
      It can never be recovered later.
    */
    apiKey,
  };
}

export async function listDeveloperApiKeys(userId) {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });
}

export async function revokeDeveloperApiKey({
  userId,
  keyId,
}) {
  const result = await prisma.apiKey.updateMany({
    where: {
      id: keyId,
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  if (!result.count) {
    throw new AppError(
      "API key not found or already revoked.",
      404,
    );
  }
}

// ======================================================
// LIST DEVELOPER FILES
// ======================================================

export async function listDeveloperFiles({
  userId,
  page = 1,
  limit = 20,
}) {
  const folder = await getDeveloperFolder(userId);

  const where = {
    userId,
    folderId: folder.id,
    isTrashed: false,
  };

  const skip = (page - 1) * limit;

  const [files, total] = await prisma.$transaction([
    prisma.file.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.file.count({ where }),
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
    },
  };
}

// ======================================================
// INITIATE DEVELOPER UPLOAD
// ======================================================

export async function initiateDeveloperUpload({
  userId,
  fileName,
  mimeType,
  size,
}) {
  const folder =
    await getDeveloperFolder(userId);

  /*
    Reuse the SAME quota reservation,
    B2 presigned upload and reservation
    logic used by normal Orivox uploads.
  */
  return initiateUpload({
    userId,
    folderId: folder.id,
    fileName,
    mimeType,
    size,
  });
}

// ======================================================
// CONFIRM DEVELOPER UPLOAD
// ======================================================

export async function confirmDeveloperUpload({
  userId,
  reservationId,
}) {
  const folder =
    await getDeveloperFolder(userId);

  const reservation =
    await prisma.uploadReservation.findFirst({
      where: {
        id: reservationId,
        ownerId: userId,
        initiatedById: userId,
        folderId: folder.id,
      },
      select: {
        id: true,
      },
    });

  if (!reservation) {
    throw new AppError(
      "Developer upload reservation not found.",
      404,
    );
  }

  return confirmUpload({
    userId,
    reservationId,
  });
}

// ======================================================
// DOWNLOAD
// ======================================================

export async function getDeveloperFileDownload({
  userId,
  fileId,
}) {
  await requireDeveloperFile({
    userId,
    fileId,
  });

  return getFileDownloadUrl({
    userId,
    fileId,
  });
}

// ======================================================
// DELETE
// ======================================================

export async function deleteDeveloperFile({
  userId,
  fileId,
}) {
  await requireDeveloperFile({
    userId,
    fileId,
  });

  /*
    Developer DELETE means actual API-object deletion,
    not moving the item into the normal user's Trash.
  */
  return permanentlyDeleteFile({
    userId,
    fileId,
  });
}

// ======================================================
// VERIFY FILE BELONGS TO /uploads
// ======================================================

async function requireDeveloperFile({
  userId,
  fileId,
}) {
  const folder =
    await getDeveloperFolder(userId);

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
      folderId: folder.id,
      isTrashed: false,
    },
    select: {
      id: true,
    },
  });

  if (!file) {
    throw new AppError(
      "Developer file not found.",
      404,
    );
  }

  return file;
}