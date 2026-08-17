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

// ==================== ACTIVE FOLDER CHECK ====================

function buildActiveFolderSet(folders) {
  const folderMap = new Map();

  for (const folder of folders) {
    folderMap.set(folder.id, folder);
  }

  const memo = new Map();

  function isActive(folderId) {
    if (!folderId) {
      return true;
    }

    if (memo.has(folderId)) {
      return memo.get(folderId);
    }

    const folder = folderMap.get(folderId);

    if (!folder) {
      memo.set(folderId, false);

      return false;
    }

    // Folder itself is trashed
    if (folder.isTrashed) {
      memo.set(folderId, false);

      return false;
    }

    // Root folder and not trashed
    if (!folder.parentId) {
      memo.set(folderId, true);

      return true;
    }

    // Folder is active only if its parent chain is active
    const active = isActive(folder.parentId);

    memo.set(folderId, active);

    return active;
  }

  const activeFolderIds = new Set();

  for (const folder of folders) {
    if (isActive(folder.id)) {
      activeFolderIds.add(folder.id);
    }
  }

  return activeFolderIds;
}

// ==================== DASHBOARD ====================

export async function getDashboard(userId) {
  const [user, folders, files] = await prisma.$transaction([
    // ==================== USER ====================

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

    // ==================== ALL FOLDERS ====================

    prisma.folder.findMany({
      where: {
        userId,
      },

      select: {
        id: true,
        parentId: true,
        isTrashed: true,
      },
    }),

    // ==================== ALL FILES ====================

    prisma.file.findMany({
      where: {
        userId,
      },

      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        folderId: true,
        isTrashed: true,
        trashedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // ==================== EFFECTIVE FOLDER STATE ====================

  const activeFolderIds = buildActiveFolderSet(folders);

  /*
    Important:

    Folder may have:
    isTrashed = false

    but still be effectively hidden because
    one of its ancestors is trashed.
  */

  const activeFolders = folders.filter((folder) =>
    activeFolderIds.has(folder.id),
  );

  // ==================== EFFECTIVE ACTIVE FILES ====================

  const activeFiles = files.filter((file) => {
    // File explicitly trashed
    if (file.isTrashed) {
      return false;
    }

    // Root-level active file
    if (!file.folderId) {
      return true;
    }

    // File inside folder is active only if
    // entire ancestor chain is active.
    return activeFolderIds.has(file.folderId);
  });

  // ==================== TRASH COUNTS ====================

  /*
    Count explicitly trashed resources.

    Descendants hidden because an ancestor
    is trashed are not separate Trash entries.
  */

  const trashedFileCount = files.filter((file) => file.isTrashed).length;

  const trashedFolderCount = folders.filter(
    (folder) => folder.isTrashed,
  ).length;

  // ==================== STORAGE BREAKDOWN ====================

  const breakdown = {
    images: 0n,
    videos: 0n,
    audio: 0n,
    documents: 0n,
    archives: 0n,
    other: 0n,
  };

  /*
    Intentionally use ALL files here,
    including files in Trash.

    Trash still consumes physical storage,
    so storage analytics should match storageUsed.
  */

  for (const file of files) {
    const category = getFileCategory(file.mimeType);

    breakdown[category] += file.size;
  }

  // ==================== RECENT FILES ====================

  const recentFiles = [...activeFiles]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  // ==================== STORAGE ====================

  const storageUsed = Number(user.storageUsed);

  const storageReserved = Number(user.storageReserved);

  const storageLimit = Number(user.storageLimit);

  const percentage =
    storageLimit === 0
      ? 0
      : Number(((storageUsed / storageLimit) * 100).toFixed(2));

  // ==================== RESPONSE ====================

  return {
    user: {
      id: user.id,

      name: user.name,

      email: user.email,

      isVerified: user.isVerified,

      createdAt: user.createdAt,
    },

    storage: {
      used: storageUsed,

      reserved: storageReserved,

      limit: storageLimit,

      available: Math.max(storageLimit - storageUsed - storageReserved, 0),

      percentage,
    },

    counts: {
      files: activeFiles.length,

      folders: activeFolders.length,

      trashed: trashedFileCount + trashedFolderCount,
    },

    breakdown: {
      images: Number(breakdown.images),

      videos: Number(breakdown.videos),

      audio: Number(breakdown.audio),

      documents: Number(breakdown.documents),

      archives: Number(breakdown.archives),

      other: Number(breakdown.other),
    },

    recentFiles: recentFiles.map((file) => ({
      id: file.id,

      name: file.name,

      mimeType: file.mimeType,

      size: Number(file.size),

      folderId: file.folderId,

      createdAt: file.createdAt,

      updatedAt: file.updatedAt,
    })),
  };
}
