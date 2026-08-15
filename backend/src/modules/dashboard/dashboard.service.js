import prisma from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";

// ==================== FILE CATEGORY ====================

function getFileCategory(mimeType) {
  if (mimeType.startsWith("image/")) {
    return "images";
  }

  if (mimeType.startsWith("video/")) {
    return "videos";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  const documentTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ]);

  if (documentTypes.has(mimeType)) {
    return "documents";
  }

  const archiveTypes = new Set([
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
  ]);

  if (archiveTypes.has(mimeType)) {
    return "archives";
  }

  return "other";
}

// ==================== DASHBOARD ====================

export async function getDashboard(userId) {
  const [
    user,
    fileCount,
    folderCount,
    trashedFileCount,
    trashedFolderCount,
    files,
    recentFiles,
  ] = await prisma.$transaction([
    // USER + STORAGE
    prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,

        storageUsed: true,
        storageReserved: true,
        storageLimit: true,

        createdAt: true,
      },
    }),

    // ACTIVE FILE COUNT
    prisma.file.count({
      where: {
        userId,
        isTrashed: false,
      },
    }),

    // ACTIVE FOLDER COUNT
    prisma.folder.count({
      where: {
        userId,
        isTrashed: false,
      },
    }),

    // TRASHED FILE COUNT
    prisma.file.count({
      where: {
        userId,
        isTrashed: true,
      },
    }),

    // TRASHED FOLDER COUNT
    prisma.folder.count({
      where: {
        userId,
        isTrashed: true,
      },
    }),

    // FILE DATA FOR STORAGE BREAKDOWN
    prisma.file.findMany({
      where: {
        userId,
      },

      select: {
        mimeType: true,
        size: true,
      },
    }),

    // RECENT FILES
    prisma.file.findMany({
      where: {
        userId,
        isTrashed: false,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 8,

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
  ]);

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  // ==================== STORAGE BREAKDOWN ====================

  const breakdown = {
    images: 0n,
    videos: 0n,
    audio: 0n,
    documents: 0n,
    archives: 0n,
    other: 0n,
  };

  for (const file of files) {
    const category =
      getFileCategory(file.mimeType);

    breakdown[category] +=
      file.size;
  }

  // ==================== STORAGE ====================

  const storageUsed =
    Number(user.storageUsed);

  const storageReserved =
    Number(user.storageReserved);

  const storageLimit =
    Number(user.storageLimit);

  const percentage =
    storageLimit === 0
      ? 0
      : Number(
          (
            (storageUsed /
              storageLimit) *
            100
          ).toFixed(2)
        );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified:
        user.isVerified,
      createdAt:
        user.createdAt,
    },

    storage: {
      used:
        storageUsed,

      reserved:
        storageReserved,

      limit:
        storageLimit,

      available:
        Math.max(
          storageLimit -
            storageUsed -
            storageReserved,
          0
        ),

      percentage,
    },

    counts: {
      files:
        fileCount,

      folders:
        folderCount,

      trashed:
        trashedFileCount +
        trashedFolderCount,
    },

    breakdown: {
      images:
        Number(breakdown.images),

      videos:
        Number(breakdown.videos),

      audio:
        Number(breakdown.audio),

      documents:
        Number(breakdown.documents),

      archives:
        Number(breakdown.archives),

      other:
        Number(breakdown.other),
    },

    recentFiles:
      recentFiles.map(
        (file) => ({
          ...file,
          size:
            Number(file.size),
        })
      ),
  };
}