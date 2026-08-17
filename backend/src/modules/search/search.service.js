import prisma from "../../config/prisma.js";

// ==================== ACTIVE FOLDER SET ====================

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

    if (folder.isTrashed) {
      memo.set(folderId, false);
      return false;
    }

    if (!folder.parentId) {
      memo.set(folderId, true);
      return true;
    }

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

// ==================== GLOBAL SEARCH ====================

export async function globalSearch({
  userId,
  q,
  limit,
}) {
  /*
    Fetch matching files/folders.

    We also fetch the user's folder hierarchy
    so we can exclude resources hidden beneath
    a trashed ancestor.
  */

  const [
    folders,
    matchingFolders,
    matchingFiles,
  ] = await prisma.$transaction([
    // Full hierarchy for effective trash state
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

    // Matching folders
    prisma.folder.findMany({
      where: {
        userId,

        name: {
          contains: q,
          mode: "insensitive",
        },
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: limit,

      select: {
        id: true,
        name: true,
        parentId: true,
        isTrashed: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    // Matching files
    prisma.file.findMany({
      where: {
        userId,

        name: {
          contains: q,
          mode: "insensitive",
        },
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: limit,

      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        folderId: true,
        isTrashed: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const activeFolderIds =
    buildActiveFolderSet(folders);

  // ==================== FILTER FOLDERS ====================

  const visibleFolders =
    matchingFolders
      .filter((folder) =>
        activeFolderIds.has(folder.id)
      )
      .slice(0, limit);

  // ==================== FILTER FILES ====================

  const visibleFiles =
    matchingFiles
      .filter((file) => {
        if (file.isTrashed) {
          return false;
        }

        // Root-level file
        if (!file.folderId) {
          return true;
        }

        return activeFolderIds.has(
          file.folderId
        );
      })
      .slice(0, limit);

  return {
    query: q,

    files: visibleFiles.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: Number(file.size),
      folderId: file.folderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    })),

    folders: visibleFolders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    })),
  };
}