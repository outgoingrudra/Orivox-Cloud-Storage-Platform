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

// ==================== CHECK FOLDER ANCESTORS ====================

async function validateFolderHierarchy({
  folder,
  allowTrashed,
}) {
  // Current folder itself
  if (!allowTrashed && folder.isTrashed) {
    return false;
  }

  let parentId = folder.parentId;

  while (parentId) {
    const parent =
      await prisma.folder.findUnique({
        where: {
          id: parentId,
        },

        select: {
          id: true,
          userId: true,
          parentId: true,
          isTrashed: true,
        },
      });

    if (!parent) {
      return false;
    }

    // Folder tree should never cross owners
    if (parent.userId !== folder.userId) {
      return false;
    }

    // Normal operations cannot access anything
    // hidden under a trashed ancestor.
    if (!allowTrashed && parent.isTrashed) {
      return false;
    }

    parentId = parent.parentId;
  }

  return true;
}

// ==================== FOLDER PERMISSION ====================

export async function getFolderPermission({
  folderId,
  userId,
  allowTrashed = false,
}) {
  const folder =
    await prisma.folder.findUnique({
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

  // ==================== TRASH / HIERARCHY CHECK ====================

  const hierarchyValid =
    await validateFolderHierarchy({
      folder,
      allowTrashed,
    });

  if (!hierarchyValid) {
    return PERMISSION.NONE;
  }

  // ==================== OWNER ====================

  /*
    Important:
    Owner check happens AFTER trash/hierarchy validation.

    Therefore normal operations cannot access
    a trashed folder just because the requester owns it.

    restore/delete can explicitly pass:
    allowTrashed: true
  */
  if (folder.userId === userId) {
    return PERMISSION.OWNER;
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

  // ==================== ANCESTOR SHARES ====================

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

    if (parent.userId !== folder.userId) {
      return PERMISSION.NONE;
    }

    if (!allowTrashed && parent.isTrashed) {
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
  allowTrashed = false,
}) {
  const file =
    await prisma.file.findUnique({
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

  // File itself is in trash
  if (!allowTrashed && file.isTrashed) {
    return PERMISSION.NONE;
  }

  /*
    If file lives inside a folder, check whether
    the folder or one of its ancestors is trashed.

    This check happens BEFORE returning OWNER.
  */
  if (file.folderId) {
    const folder =
      await prisma.folder.findUnique({
        where: {
          id: file.folderId,
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

    // File/folder ownership hierarchy should be consistent
    if (folder.userId !== file.userId) {
      return PERMISSION.NONE;
    }

    const hierarchyValid =
      await validateFolderHierarchy({
        folder,
        allowTrashed,
      });

    if (!hierarchyValid) {
      return PERMISSION.NONE;
    }
  }

  // ==================== OWNER ====================

  if (file.userId === userId) {
    return PERMISSION.OWNER;
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

  // Root-level file has no inherited folder permission
  if (!file.folderId) {
    return permission;
  }

  // ==================== INHERITED FOLDER PERMISSION ====================

  const folderPermission =
    await getFolderPermission({
      folderId: file.folderId,
      userId,
      allowTrashed,
    });

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
  allowTrashed = false,
}) {
  const permission =
    await getFilePermission({
      fileId,
      userId,
      allowTrashed,
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
  allowTrashed = false,
}) {
  const permission =
    await getFolderPermission({
      folderId,
      userId,
      allowTrashed,
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