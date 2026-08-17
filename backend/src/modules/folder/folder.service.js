import prisma from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";

import {
  findOwnedFolder,
  getValidRestoreParent
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
import {
  publishStorageDeletion,
} from "../file/file.publisher.js";


export async function createFolder({
  name,
  parentId,
  userId,
}) {
  // Root folder belongs to the current user by default
  let ownerId = userId;

  // ==================== NESTED FOLDER ====================

  if (parentId) {
    // OWNER or EDITOR can create inside this folder
    await requireFolderPermission({
      folderId: parentId,
      userId,
      minimum: PERMISSION.EDITOR,
    });

    const parentFolder =
      await prisma.folder.findUnique({
        where: {
          id: parentId,
        },

        select: {
          id: true,
          userId: true,
        },
      });

    if (!parentFolder) {
      throw new AppError(
        "Parent folder not found",
        404
      );
    }

    /*
      Important:

      New child inherits the OWNER of the parent tree.

      Example:

      Rudra owns Projects
      John is EDITOR

      John creates:
      Projects/Backend

      Backend owner = Rudra
      NOT John.
    */
    ownerId = parentFolder.userId;
  }

  // ==================== CREATE ====================

  const folder =
    await prisma.folder.create({
      data: {
        name,

        userId: ownerId,

        parentId:
          parentId || null,
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
}
export async function listFolders({
  userId,
  parentId,
  search,
  sortBy,
  order,
  page,
  limit,
}) {
  let resourceOwnerId = userId;

  // ==================== SHARED FOLDER ACCESS ====================

  if (parentId) {
    await requireFolderPermission({
      folderId: parentId,
      userId,
      minimum: PERMISSION.VIEWER,
    });

    const parentFolder = await prisma.folder.findUnique({
      where: {
        id: parentId,
      },

      select: {
        userId: true,
      },
    });

    if (!parentFolder) {
      throw new AppError(
        "Parent folder not found",
        404
      );
    }

    resourceOwnerId = parentFolder.userId;
  }

  // ==================== QUERY ====================

  const where = {
    userId: resourceOwnerId,
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

  const skip = (page - 1) * limit;

  const [folders, total] = await prisma.$transaction([
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

      totalPages: Math.ceil(total / limit),

      hasNextPage: page * limit < total,

      hasPreviousPage: page > 1,
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
    allowTrashed: true,
  });

  const folder =
    await prisma.folder.findUnique({
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

  // Check entire ancestor chain.
  // If any ancestor is trashed/missing,
  // restore this folder to root.
  const parentId =
    await getValidRestoreParent({
      parentId: folder.parentId,
      userId,
    });

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
  // ==================== OWNER ONLY ====================
await requireFolderPermission({
  folderId,
  userId,
  minimum: PERMISSION.OWNER,
  allowTrashed: true,
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

  // ==================== COLLECT SUBTREE ====================

  const folderIds =
    await collectFolderSubtree({
      folderId,
      userId,
    });

  // ==================== FIND ALL FILES ====================

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
        userId: true,
        objectKey: true,
        size: true,
      },
    });

  const totalSize =
    files.reduce(
      (sum, file) =>
        sum + file.size,
      0n
    );

  // ==================== DATABASE TRANSACTION ====================

  const deletionJobs =
    await prisma.$transaction(
      async (tx) => {
        /*
          IMPORTANT:

          Don't delete folder hierarchy while
          an upload is actively targeting one
          of these folders.

          That upload may currently be going
          through initiate → B2 → confirm.
        */
        const activeUploads =
          await tx.uploadReservation.count({
            where: {
              folderId: {
                in: folderIds,
              },

              status: "PENDING",
            },
          });

        if (activeUploads > 0) {
          throw new AppError(
            "Folder has active uploads. Cancel them or wait for them to expire before permanent deletion.",
            409
          );
        }

        /*
          Completed / cancelled / expired
          reservation records can now be removed.

          This is also necessary because
          UploadReservation.folder uses
          onDelete: Restrict.
        */
        await tx.uploadReservation.deleteMany({
          where: {
            folderId: {
              in: folderIds,
            },
          },
        });

        // ==================== CREATE DELETION JOBS ====================

        const jobs = [];

        /*
          One physical B2 object
          = one durable deletion job.
        */
        for (const file of files) {
          const job =
            await tx.storageDeletionJob.create({
              data: {
                userId:
                  file.userId,

                fileId:
                  file.id,

                objectKey:
                  file.objectKey,

                size:
                  file.size,

                status:
                  "PENDING",
              },

              select: {
                id: true,
              },
            });

          jobs.push(job);
        }

        // ==================== DELETE FILE METADATA ====================

        await tx.file.deleteMany({
          where: {
            userId,

            folderId: {
              in: folderIds,
            },
          },
        });

        // ==================== DELETE FOLDERS BOTTOM-UP ====================

        /*
          Example:

          A
          └── B
              └── C

          Because parent relation uses
          onDelete: Restrict:

          C → B → A
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

        // ==================== RELEASE STORAGE ====================

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

        return jobs;
      }
    );

  // ==================== PUBLISH DELETION JOBS ====================

  /*
    PostgreSQL transaction has committed.

    Now ask RabbitMQ workers to physically
    remove the objects from B2.
  */

  let publishedJobs = 0;

  for (const job of deletionJobs) {
    try {
      publishStorageDeletion(
        job.id
      );

      publishedJobs++;
    } catch (error) {
      /*
        Not fatal.

        Job remains PENDING in PostgreSQL.

        storageDeletionRecovery.job.js
        will republish it later.
      */

      console.error(
        `Failed to publish storage deletion job ${job.id}:`,
        error
      );
    }
  }

  return {
    deletedFolders:
      folderIds.length,

    deletedFiles:
      files.length,

    releasedStorage:
      Number(totalSize),

    deletionJobs:
      deletionJobs.length,

    publishedJobs,
  };
}