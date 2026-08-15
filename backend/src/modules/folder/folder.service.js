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
export const renameFolder = async ({
  folderId,
  userId,
  name,
}) => {
  await findOwnedFolder(
    folderId,
    userId
  );

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
};

export const moveFolder = async ({
  folderId,
  userId,
  parentId,
}) => {
  const folder =
    await findOwnedFolder(
      folderId,
      userId
    );

  // Moving folder to itself
  if (folderId === parentId) {
    throw new AppError(
      "A folder cannot be moved inside itself",
      400
    );
  }

  // Move to root
  if (parentId === null) {
    return prisma.folder.update({
      where: {
        id: folderId,
      },

      data: {
        parentId: null,
      },
    });
  }

  const destination =
    await findOwnedFolder(
      parentId,
      userId
    );

  /*
    Prevent cycles.

    Example:

    A
      └── B
           └── C

    Moving A into C must NOT be allowed.
  */

  let currentFolder = destination;

  while (currentFolder.parentId) {
    if (
      currentFolder.parentId ===
      folderId
    ) {
      throw new AppError(
        "Cannot move a folder inside its own descendant",
        400
      );
    }

    currentFolder =
      await findOwnedFolder(
        currentFolder.parentId,
        userId
      );
  }

  return prisma.folder.update({
    where: {
      id: folder.id,
    },

    data: {
      parentId,
    },

    select: {
      id: true,
      name: true,
      parentId: true,
      updatedAt: true,
    },
  });
};

export const trashFolder = async ({
  folderId,
  userId,
}) => {
  await findOwnedFolder(
    folderId,
    userId
  );

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
};

export const restoreFolder = async ({
  folderId,
  userId,
}) => {
  const folder =
    await findOwnedFolder(
      folderId,
      userId,
      {
        allowTrashed: true,
      }
    );

  if (!folder.isTrashed) {
    throw new AppError(
      "Folder is not in trash",
      400
    );
  }

  /*
    If parent itself has been trashed,
    restoring the child into that hidden
    parent would make it inaccessible.

    Therefore restore to root.
  */

  let parentId = folder.parentId;

  if (parentId) {
    const parent =
      await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId,
        },

        select: {
          id: true,
          isTrashed: true,
        },
      });

    if (
      !parent ||
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
};

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
  const folder = await findOwnedFolder(
    folderId,
    userId,
    {
      allowTrashed: true,
      checkAncestors: false,
    }
  );

  if (!folder.isTrashed) {
    throw new AppError(
      "Folder must be in trash before permanent deletion",
      400
    );
  }

  const folderIds =
    await collectFolderSubtree({
      folderId,
      userId,
    });

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
    const objects = files.map((file) => ({
      Key: file.objectKey,
    }));

    /*
      S3-compatible DeleteObjects supports
      up to 1000 objects per request.
    */
    for (
      let i = 0;
      i < objects.length;
      i += 1000
    ) {
      const batch =
        objects.slice(i, i + 1000);

      await storageClient.send(
        new DeleteObjectsCommand({
          Bucket: STORAGE_BUCKET,

          Delete: {
            Objects: batch,
            Quiet: true,
          },
        })
      );
    }
  }

  const totalSize =
    files.reduce(
      (sum, file) =>
        sum + file.size,
      0n
    );

  // ==================== DATABASE CLEANUP ====================

  await prisma.$transaction(async (tx) => {
    // Delete files first because folders reference them
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

      parent relation uses onDelete: Restrict,
      so children must disappear before parents.
    */

    for (
      let i = folderIds.length - 1;
      i >= 0;
      i--
    ) {
      await tx.folder.delete({
        where: {
          id: folderIds[i],
        },
      });
    }

    if (totalSize > 0n) {
      await tx.user.update({
        where: {
          id: userId,
        },

        data: {
          storageUsed: {
            decrement: totalSize,
          },
        },
      });
    }
  });

  return {
    deletedFolders:
      folderIds.length,

    deletedFiles:
      files.length,

    releasedStorage:
      Number(totalSize),
  };
}