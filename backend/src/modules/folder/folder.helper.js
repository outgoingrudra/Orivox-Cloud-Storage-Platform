import prisma from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";

// ==================== FIND OWNED FOLDER ====================

export const findOwnedFolder = async (
  folderId,
  userId,
  options = {}
) => {
  const {
    allowTrashed = false,
    checkAncestors = true,
  } = options;

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      userId,
    },
  });

  if (!folder) {
    throw new AppError(
      "Folder not found",
      404
    );
  }

  // Folder itself is trashed
  if (!allowTrashed && folder.isTrashed) {
    throw new AppError(
      "Folder not found",
      404
    );
  }

  /*
    Check whether any parent/ancestor
    of this folder is in trash.

    Example:

    A (trashed)
      └── B
          └── C

    Even though B/C have isTrashed=false,
    they must be treated as inaccessible.
  */
  if (
    !allowTrashed &&
    checkAncestors &&
    folder.parentId
  ) {
    let parentId = folder.parentId;

    while (parentId) {
      const parent =
        await prisma.folder.findFirst({
          where: {
            id: parentId,
            userId,
          },

          select: {
            id: true,
            parentId: true,
            isTrashed: true,
          },
        });

      if (!parent) {
        throw new AppError(
          "Folder hierarchy is invalid",
          500
        );
      }

      if (parent.isTrashed) {
        throw new AppError(
          "Folder not found",
          404
        );
      }

      parentId = parent.parentId;
    }
  }

  return folder;
};

// ==================== CHECK ACTIVE FOLDER ====================

export const validateActiveFolder = async (
  folderId,
  userId
) => {
  if (!folderId) {
    return null;
  }

  return findOwnedFolder(
    folderId,
    userId
  );
};