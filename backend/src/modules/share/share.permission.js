import prisma from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
// ==================== PERMISSION CONSTANTS ====================

export const PERMISSION = {
  NONE: "NONE",
  VIEWER: "VIEWER",
  EDITOR: "EDITOR",
  OWNER: "OWNER",
};

// Higher number = stronger permission
const permissionRank = {
  NONE: 0,
  VIEWER: 1,
  EDITOR: 2,
  OWNER: 3,
};

// ==================== STRONGER PERMISSION ====================

function strongerPermission(a, b) {
  return permissionRank[a] >= permissionRank[b]
    ? a
    : b;
}

// ==================== FOLDER PERMISSION ====================

export async function getFolderPermission({
  folderId,
  userId,
}) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },

    select: {
      id: true,
      userId: true,
      parentId: true,
      isTrashed: true,
    },
  });

  if (!folder) {
    return PERMISSION.NONE;
  }

  // Owner always has full permission
  if (folder.userId === userId) {
    return PERMISSION.OWNER;
  }

  // Trashed resources aren't accessible through sharing
  if (folder.isTrashed) {
    return PERMISSION.NONE;
  }

  let permission = PERMISSION.NONE;

  // ==================== DIRECT SHARE ====================

  const directShare =
    await prisma.folderShare.findUnique({
      where: {
        folderId_sharedWithId: {
          folderId,
          sharedWithId: userId,
        },
      },

      select: {
        permission: true,
      },
    });

  if (directShare) {
    permission = strongerPermission(
      permission,
      directShare.permission
    );
  }

  /*
    Now walk upward.

    Example:

    Projects       ← shared with John as EDITOR
      └── Backend
          └── API

    John accesses API.

    API has no direct share.
    Backend has no direct share.
    Projects does → EDITOR.
  */

  let parentId = folder.parentId;

  while (parentId) {
    const parent =
      await prisma.folder.findUnique({
        where: {
          id: parentId,
        },

        select: {
          id: true,
          parentId: true,
          userId: true,
          isTrashed: true,
        },
      });

    if (!parent) {
      return PERMISSION.NONE;
    }

    // Hidden because an ancestor is in trash
    if (parent.isTrashed) {
      return PERMISSION.NONE;
    }

    /*
      Safety check:
      hierarchy should never cross owners.
    */
    if (parent.userId !== folder.userId) {
      return PERMISSION.NONE;
    }

    const ancestorShare =
      await prisma.folderShare.findUnique({
        where: {
          folderId_sharedWithId: {
            folderId: parent.id,
            sharedWithId: userId,
          },
        },

        select: {
          permission: true,
        },
      });

    if (ancestorShare) {
      permission = strongerPermission(
        permission,
        ancestorShare.permission
      );
    }

    parentId = parent.parentId;
  }

  return permission;
}

// ==================== FILE PERMISSION ====================

export async function getFilePermission({
  fileId,
  userId,
}) {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },

    select: {
      id: true,
      userId: true,
      folderId: true,
      isTrashed: true,
    },
  });

  if (!file) {
    return PERMISSION.NONE;
  }

  // Owner
  if (file.userId === userId) {
    return PERMISSION.OWNER;
  }

  if (file.isTrashed) {
    return PERMISSION.NONE;
  }

  let permission = PERMISSION.NONE;

  // ==================== DIRECT FILE SHARE ====================

  const directShare =
    await prisma.fileShare.findUnique({
      where: {
        fileId_sharedWithId: {
          fileId,
          sharedWithId: userId,
        },
      },

      select: {
        permission: true,
      },
    });

  if (directShare) {
    permission = strongerPermission(
      permission,
      directShare.permission
    );
  }

  // Root-level file has no folder inheritance
  if (!file.folderId) {
    return permission;
  }

  // ==================== INHERITED FOLDER PERMISSION ====================

  const folderPermission =
    await getFolderPermission({
      folderId: file.folderId,
      userId,
    });

  /*
    OWNER here would mean user owns folder,
    but file owner should normally match folder owner.

    For a shared user, folderPermission will usually
    be VIEWER / EDITOR / NONE.
  */

  if (folderPermission === PERMISSION.OWNER) {
    return PERMISSION.OWNER;
  }

  return strongerPermission(
    permission,
    folderPermission
  );
}


// ==================== REQUIRE FILE PERMISSION ====================

export async function requireFilePermission({
  fileId,
  userId,
  minimum = PERMISSION.VIEWER,
}) {
  const permission =
    await getFilePermission({
      fileId,
      userId,
    });

  if (
    permissionRank[permission] <
    permissionRank[minimum]
  ) {
    throw new AppError(
      "You do not have permission to access this file",
      403
    );
  }

  return permission;
}

// ==================== REQUIRE FOLDER PERMISSION ====================

export async function requireFolderPermission({
  folderId,
  userId,
  minimum = PERMISSION.VIEWER,
}) {
  const permission =
    await getFolderPermission({
      folderId,
      userId,
    });

  if (
    permissionRank[permission] <
    permissionRank[minimum]
  ) {
    throw new AppError(
      "You do not have permission to access this folder",
      403
    );
  }

  return permission;
}