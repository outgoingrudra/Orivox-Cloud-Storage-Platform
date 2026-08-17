import prisma from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";

import {
  findOwnedFolder,
} from "./folder.helper.js";

import {
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

import {
  storageClient,
  STORAGE_BUCKET,
} from "../../config/storage.js";

import {
  requireFolderPermission,
  PERMISSION,
} from "../share/share.permission.js";

export const createFolder = async ({
  name,
  parentId,
  userId,
}) => {
  if (parentId) {
    await findOwnedFolder(
      parentId,
      userId
    );
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      userId,
      parentId: parentId || null,
    },

    select: {
      id: true,
      name: true,
      parentId: true,
      isTrashed: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return folder;
};

export async function listFolders({
  userId,
  parentId,
  search,
  sortBy,
  order,
  page,
  limit,
}) {
  if (parentId) {
    await findOwnedFolder(
      parentId,
      userId
    );
  }

  const where = {
    userId,
    isTrashed: false,
    parentId: parentId || null,

    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const skip =
    (page - 1) * limit;

  const [folders, total] =
    await prisma.$transaction([
      prisma.folder.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          [sortBy]: order,
        },

        select: {
          id: true,
          name: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,

          _count: {
            select: {
              children: {
                where: {
                  isTrashed: false,
                },
              },

              files: {
                where: {
                  isTrashed: false,
                },
              },
            },
          },
        },
      }),

      prisma.folder.count({
        where,
      }),
    ]);

  return {
    folders,

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


export async function renameFolder({
  folderId,
  userId,
  name,
}) {
  await requireFolderPermission({
    folderId,
    userId,
    minimum: PERMISSION.EDITOR,
  });

  return prisma.folder.update({
    where: {
      id: folderId,
    },

    data: {
      name,
    },

    select: {
      id: true,
      name: true,
      parentId: true,
      updatedAt: true,
    },
  });
}


export async function moveFolder({
  folderId,
  userId,
  parentId,
}) {
  const permission =
    await requireFolderPermission({
      folderId,
      userId,
      minimum: PERMISSION.EDITOR,
    });

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    throw new AppError(
      "Folder not found",
      404
    );
  }

  if (folderId === parentId) {
    throw new AppError(
      "A folder cannot be moved inside itself",
      400
    );
  }

  if (!parentId) {
    if (permission !== PERMISSION.OWNER) {
      throw new AppError(
        "Shared folders cannot be moved to your root",
        403
      );
    }

    return prisma.folder.update({
      where: {
        id: folderId,
      },

      data: {
        parentId: null,
      },
    });
  }

  await requireFolderPermission({
    folderId: parentId,
    userId,
    minimum: PERMISSION.EDITOR,
  });

  let currentId = parentId;

  while (currentId) {
    if (currentId === folderId) {
      throw new AppError(
        "Cannot move a folder inside its own descendant",
        400
      );
    }

    const current =
      await prisma.folder.findUnique({
        where: {
          id: currentId,
        },

        select: {
          parentId: true,
        },
      });

    if (!current) {
      throw new AppError(
        "Destination folder not found",
        404
      );
    }

    currentId = current.parentId;
  }

  return prisma.folder.update({
    where: {
      id: folderId,
    },

    data: {
      parentId,
    },
  });
}


export async function trashFolder({
  folderId,
  userId,
}) {
  await requireFolderPermission({
    folderId,
    userId,
    minimum: PERMISSION.OWNER,
  });

  return prisma.folder.update({
    where: {
      id: folderId,
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
}

export async function restoreFolder({
  folderId,
  userId,
}) {
  await requireFolderPermission({
    folderId,
    userId,
    minimum: PERMISSION.OWNER,
  });

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    throw new AppError(
      "Folder not found",
      404
    );
  }

  if (!folder.isTrashed) {
    throw new AppError(
      "Folder is not in trash",
      400
    );
  }

  let parentId = folder.parentId;

  if (parentId) {
    const parent =
      await prisma.folder.findUnique({
        where: {
          id: parentId,
        },

        select: {
          id: true,
          userId: true,
          isTrashed: true,
        },
      });

    if (
      !parent ||
      parent.userId !== userId ||
      parent.isTrashed
    ) {
      parentId = null;
    }
  }

  return prisma.folder.update({
    where: {
      id: folderId,
    },

    data: {
      isTrashed: false,
      trashedAt: null,
      parentId,
    },

    select: {
      id: true,
      name: true,
      parentId: true,
      isTrashed: true,
      trashedAt: true,
    },
  });
}
export const listTrashedFolders = async ({
    userId,
    page,
    limit,
  }) => {
    const skip =
      (page - 1) * limit;

    const where = {
      userId,
      isTrashed: true,
    };

    const [folders, total] =
      await prisma.$transaction([
        prisma.folder.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            trashedAt: "desc",
          },

          select: {
            id: true,
            name: true,
            parentId: true,
            trashedAt: true,
            createdAt: true,
          },
        }),

        prisma.folder.count({
          where,
        }),
      ]);

    return {
      folders,

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
  };

// ==================== COLLECT FOLDER SUBTREE ====================

async function collectFolderSubtree({
  folderId,
  userId,
}) {
  const folderIds = [];
  const queue = [folderId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    folderIds.push(currentId);

    const children = await prisma.folder.findMany({
      where: {
        parentId: currentId,
        userId,
      },

      select: {
        id: true,
      },
    });

    for (const child of children) {
      queue.push(child.id);
    }
  }

  return folderIds;
}


export async function permanentlyDeleteFolder({
  folderId,
  userId,
}) {
  // ==================== OWNER PERMISSION ====================

  await requireFolderPermission({
    folderId,
    userId,
    minimum: PERMISSION.OWNER,
  });

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    throw new AppError(
      "Folder not found",
      404
    );
  }

  if (!folder.isTrashed) {
    throw new AppError(
      "Folder must be in trash before permanent deletion",
      400
    );
  }

  // ==================== COLLECT ENTIRE SUBTREE ====================

  const folderIds =
    await collectFolderSubtree({
      folderId,
      userId,
    });

  // ==================== GET ALL FILES ====================

  const files =
    await prisma.file.findMany({
      where: {
        userId,

        folderId: {
          in: folderIds,
        },
      },

      select: {
        id: true,
        objectKey: true,
        size: true,
      },
    });

  // ==================== DELETE B2 OBJECTS ====================

  if (files.length > 0) {
    const objects =
      files.map((file) => ({
        Key: file.objectKey,
      }));

    /*
      S3-compatible DeleteObjects allows
      max 1000 objects per request.
    */

    for (
      let i = 0;
      i < objects.length;
      i += 1000
    ) {
      const batch =
        objects.slice(
          i,
          i + 1000
        );

      try {
        await storageClient.send(
          new DeleteObjectsCommand({
            Bucket:
              STORAGE_BUCKET,

            Delete: {
              Objects: batch,
              Quiet: true,
            },
          })
        );
      } catch (error) {
        console.error(
          "Failed to delete folder objects from B2:",
          error
        );

        throw new AppError(
          "Unable to delete folder files from storage",
          502
        );
      }
    }
  }

  // ==================== CALCULATE RELEASED STORAGE ====================

  const totalSize =
    files.reduce(
      (sum, file) =>
        sum + file.size,
      0n
    );

  // ==================== DATABASE CLEANUP ====================

  await prisma.$transaction(
    async (tx) => {
      /*
        Delete files first.

        Their folderId references folders
        inside the subtree.
      */

      await tx.file.deleteMany({
        where: {
          userId,

          folderId: {
            in: folderIds,
          },
        },
      });

      /*
        Delete folders bottom-up.

        Example:

        A
        └── B
            └── C

        Delete:
        C → B → A

        because our parent relation uses
        onDelete: Restrict.
      */

      for (
        let i =
          folderIds.length - 1;
        i >= 0;
        i--
      ) {
        await tx.folder.delete({
          where: {
            id: folderIds[i],
          },
        });
      }

      // Update user's consumed storage
      if (totalSize > 0n) {
        await tx.user.update({
          where: {
            id: userId,
          },

          data: {
            storageUsed: {
              decrement:
                totalSize,
            },
          },
        });
      }
    }
  );

  return {
    deletedFolders:
      folderIds.length,

    deletedFiles:
      files.length,

    releasedStorage:
      Number(totalSize),
  };
}