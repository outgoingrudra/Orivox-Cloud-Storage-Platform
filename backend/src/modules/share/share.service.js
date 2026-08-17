import prisma from "../../config/prisma.js";
import crypto from "crypto";
import {
  getFilePermission,
  getFolderPermission,
  PERMISSION,
} from "./share.permission.js";

import { AppError } from "../../utils/AppError.js";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { storageClient, STORAGE_BUCKET } from "../../config/storage.js";

function generateShareToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashShareToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ==================== FIND TARGET USER ====================

async function findShareTarget({ email, ownerId }) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.id === ownerId) {
    throw new AppError("You cannot share a resource with yourself", 400);
  }

  if (!user.isVerified) {
    throw new AppError(
      "User must verify their account before receiving shared resources",
      400,
    );
  }

  return user;
}

// ==================== SHARE FILE ====================

export async function shareFile({ fileId, ownerId, email, permission }) {
  const currentPermission = await getFilePermission({
    fileId,
    userId: ownerId,
  });

  if (currentPermission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can share this file", 403);
  }

  const targetUser = await findShareTarget({
    email,
    ownerId,
  });

  const share = await prisma.fileShare.upsert({
    where: {
      fileId_sharedWithId: {
        fileId,
        sharedWithId: targetUser.id,
      },
    },

    update: {
      permission,
    },

    create: {
      fileId,

      sharedWithId: targetUser.id,

      sharedById: ownerId,

      permission,
    },

    select: {
      id: true,
      permission: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...share,

    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
    },
  };
}

// ==================== SHARE FOLDER ====================

export async function shareFolder({ folderId, ownerId, email, permission }) {
  const currentPermission = await getFolderPermission({
    folderId,
    userId: ownerId,
  });

  if (currentPermission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can share this folder", 403);
  }

  const targetUser = await findShareTarget({
    email,
    ownerId,
  });

  const share = await prisma.folderShare.upsert({
    where: {
      folderId_sharedWithId: {
        folderId,
        sharedWithId: targetUser.id,
      },
    },

    update: {
      permission,
    },

    create: {
      folderId,

      sharedWithId: targetUser.id,

      sharedById: ownerId,

      permission,
    },

    select: {
      id: true,
      permission: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    ...share,

    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
    },
  };
}

// ==================== UPDATE FILE SHARE ====================

export async function updateFileShare({ shareId, ownerId, permission }) {
  const share = await prisma.fileShare.findUnique({
    where: {
      id: shareId,
    },

    select: {
      id: true,
      fileId: true,
    },
  });

  if (!share) {
    throw new AppError("Share not found", 404);
  }

  const ownerPermission = await getFilePermission({
    fileId: share.fileId,
    userId: ownerId,
  });

  if (ownerPermission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can change permissions", 403);
  }

  return prisma.fileShare.update({
    where: {
      id: shareId,
    },

    data: {
      permission,
    },

    select: {
      id: true,
      permission: true,
      updatedAt: true,
    },
  });
}

// ==================== UPDATE FOLDER SHARE ====================

export async function updateFolderShare({ shareId, ownerId, permission }) {
  const share = await prisma.folderShare.findUnique({
    where: {
      id: shareId,
    },

    select: {
      id: true,
      folderId: true,
    },
  });

  if (!share) {
    throw new AppError("Share not found", 404);
  }

  const ownerPermission = await getFolderPermission({
    folderId: share.folderId,
    userId: ownerId,
  });

  if (ownerPermission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can change permissions", 403);
  }

  return prisma.folderShare.update({
    where: {
      id: shareId,
    },

    data: {
      permission,
    },

    select: {
      id: true,
      permission: true,
      updatedAt: true,
    },
  });
}

// ==================== REVOKE FILE SHARE ====================

export async function revokeFileShare({ shareId, ownerId }) {
  const share = await prisma.fileShare.findUnique({
    where: {
      id: shareId,
    },

    select: {
      id: true,
      fileId: true,
    },
  });

  if (!share) {
    throw new AppError("Share not found", 404);
  }

  const permission = await getFilePermission({
    fileId: share.fileId,
    userId: ownerId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can revoke sharing", 403);
  }

  await prisma.fileShare.delete({
    where: {
      id: shareId,
    },
  });
}

// ==================== REVOKE FOLDER SHARE ====================

export async function revokeFolderShare({ shareId, ownerId }) {
  const share = await prisma.folderShare.findUnique({
    where: {
      id: shareId,
    },

    select: {
      id: true,
      folderId: true,
    },
  });

  if (!share) {
    throw new AppError("Share not found", 404);
  }

  const permission = await getFolderPermission({
    folderId: share.folderId,
    userId: ownerId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can revoke sharing", 403);
  }

  await prisma.folderShare.delete({
    where: {
      id: shareId,
    },
  });
}

// ==================== SHARED WITH ME ====================

export async function getSharedWithMe(userId) {
  // ==================== FETCH DIRECT SHARES ====================

  const [fileShares, folderShares] = await prisma.$transaction([
    prisma.fileShare.findMany({
      where: {
        sharedWithId: userId,

        file: {
          isTrashed: false,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        permission: true,
        createdAt: true,

        file: {
          select: {
            id: true,
            name: true,
            mimeType: true,
            size: true,
            folderId: true,
            createdAt: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),

    prisma.folderShare.findMany({
      where: {
        sharedWithId: userId,

        folder: {
          isTrashed: false,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        permission: true,
        createdAt: true,

        folder: {
          select: {
            id: true,
            name: true,
            parentId: true,
            createdAt: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // ==================== EFFECTIVELY ACCESSIBLE FILES ====================

  const visibleFileShares = [];

  for (const share of fileShares) {
    const permission = await getFilePermission({
      fileId: share.file.id,
      userId,
    });

    /*
      getFilePermission() checks:
      - file itself isn't trashed
      - folder isn't trashed
      - no ancestor is trashed
      - sharing permission still exists
    */
    if (permission === PERMISSION.NONE) {
      continue;
    }

    visibleFileShares.push({
      shareId: share.id,

      /*
        Use effective permission instead of only
        the direct share value.

        Example:
        direct file VIEWER +
        inherited folder EDITOR
        => effective EDITOR
      */
      permission,

      sharedAt: share.createdAt,

      file: {
        ...share.file,
        size: Number(share.file.size),
      },
    });
  }

  // ==================== EFFECTIVELY ACCESSIBLE FOLDERS ====================

  const visibleFolderShares = [];

  for (const share of folderShares) {
    const permission = await getFolderPermission({
      folderId: share.folder.id,

      userId,
    });

    /*
      Also checks the complete ancestor chain.
    */
    if (permission === PERMISSION.NONE) {
      continue;
    }

    visibleFolderShares.push({
      shareId: share.id,

      permission,

      sharedAt: share.createdAt,

      folder: share.folder,
    });
  }

  // ==================== RESPONSE ====================

  return {
    files: visibleFileShares,

    folders: visibleFolderShares,
  };
}

// ==================== FILE ACCESS LIST ====================

export async function getFileShares({ fileId, ownerId }) {
  const permission = await getFilePermission({
    fileId,
    userId: ownerId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can view sharing details", 403);
  }

  return prisma.fileShare.findMany({
    where: {
      fileId,
    },

    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      permission: true,
      createdAt: true,
      updatedAt: true,

      sharedWith: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

// ==================== FOLDER ACCESS LIST ====================

export async function getFolderShares({ folderId, ownerId }) {
  const permission = await getFolderPermission({
    folderId,
    userId: ownerId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can view sharing details", 403);
  }

  return prisma.folderShare.findMany({
    where: {
      folderId,
    },

    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      permission: true,
      createdAt: true,
      updatedAt: true,

      sharedWith: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function createFileShareLink({ fileId, userId, expiresAt }) {
  const permission = await getFilePermission({
    fileId,
    userId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can create share links", 403);
  }

  const token = generateShareToken();

  const tokenHash = hashShareToken(token);

  const shareLink = await prisma.fileShareLink.create({
    data: {
      fileId,
      createdById: userId,
      tokenHash,

      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },

    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return {
    ...shareLink,

    // Raw token returned ONLY now.
    token,
  };
}

export async function createFolderShareLink({ folderId, userId, expiresAt }) {
  const permission = await getFolderPermission({
    folderId,
    userId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can create share links", 403);
  }

  const token = generateShareToken();

  const tokenHash = hashShareToken(token);

  const shareLink = await prisma.folderShareLink.create({
    data: {
      folderId,
      createdById: userId,
      tokenHash,

      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },

    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return {
    ...shareLink,
    token,
  };
}
export async function resolveFileShareLink(token) {
  const tokenHash = hashShareToken(token);

  const share = await prisma.fileShareLink.findUnique({
    where: {
      tokenHash,
    },

    include: {
      file: {
        select: {
          id: true,
          userId: true,
          name: true,
          mimeType: true,
          size: true,
          objectKey: true,
          isTrashed: true,
        },
      },
    },
  });

  if (
    !share ||
    share.revokedAt ||
    (share.expiresAt && share.expiresAt < new Date())
  ) {
    throw new AppError("Share link is invalid or expired", 404);
  }

  const ownerPermission = await getFilePermission({
    fileId: share.file.id,
    userId: share.file.userId,
  });

  /*
    Because getFilePermission() is trash-aware,
    OWNER here means:
    - file exists
    - file itself is not trashed
    - none of its ancestors are trashed
  */
  if (ownerPermission !== PERMISSION.OWNER) {
    throw new AppError("Shared file is no longer available", 404);
  }

  return share;
}

export async function resolveFolderShareLink(token) {
  const tokenHash = hashShareToken(token);

  const share = await prisma.folderShareLink.findUnique({
    where: {
      tokenHash,
    },

    include: {
      folder: {
        select: {
          id: true,
          name: true,
          userId: true,
          isTrashed: true,
        },
      },
    },
  });

  if (
    !share ||
    share.revokedAt ||
    (share.expiresAt && share.expiresAt < new Date())
  ) {
    throw new AppError("Share link is invalid or expired", 404);
  }

  const ownerPermission = await getFolderPermission({
    folderId: share.folder.id,
    userId: share.folder.userId,
  });

  if (ownerPermission !== PERMISSION.OWNER) {
    throw new AppError("Shared folder is no longer available", 404);
  }

  return share;
}

export async function revokeFileShareLink({ linkId, userId }) {
  const link = await prisma.fileShareLink.findUnique({
    where: {
      id: linkId,
    },

    select: {
      id: true,
      fileId: true,
    },
  });

  if (!link) {
    throw new AppError("Share link not found", 404);
  }

  const permission = await getFilePermission({
    fileId: link.fileId,
    userId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can revoke this link", 403);
  }

  await prisma.fileShareLink.update({
    where: {
      id: linkId,
    },

    data: {
      revokedAt: new Date(),
    },
  });
}

export async function revokeFolderShareLink({ linkId, userId }) {
  const link = await prisma.folderShareLink.findUnique({
    where: {
      id: linkId,
    },

    select: {
      id: true,
      folderId: true,
    },
  });

  if (!link) {
    throw new AppError("Share link not found", 404);
  }

  const permission = await getFolderPermission({
    folderId: link.folderId,
    userId,
  });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError("Only the owner can revoke this link", 403);
  }

  await prisma.folderShareLink.update({
    where: {
      id: linkId,
    },

    data: {
      revokedAt: new Date(),
    },
  });
}

export async function getPublicFileDownloadUrl(token) {
  const share = await resolveFileShareLink(token);

  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,

    Key: share.file.objectKey,

    ResponseContentType: share.file.mimeType,

    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
      share.file.name,
    )}"`,
  });

  const downloadUrl = await getSignedUrl(storageClient, command, {
    expiresIn: 5 * 60,
  });

  return {
    downloadUrl,
    expiresIn: 300,
  };
}

async function isFolderInsideSharedTree({
  candidateFolderId,
  sharedRootFolderId,
  ownerId,
}) {
  let currentId = candidateFolderId;

  while (currentId) {
    if (currentId === sharedRootFolderId) {
      return true;
    }

    const folder = await prisma.folder.findFirst({
      where: {
        id: currentId,
        userId: ownerId,
      },

      select: {
        parentId: true,
      },
    });

    if (!folder) {
      return false;
    }

    currentId = folder.parentId;
  }

  return false;
}

export async function getPublicFolderContents({ token, folderId }) {
  const share = await resolveFolderShareLink(token);

  const sharedRoot = share.folder;

  const targetFolderId = folderId || sharedRoot.id;

  const allowed = await isFolderInsideSharedTree({
    candidateFolderId: targetFolderId,

    sharedRootFolderId: sharedRoot.id,

    ownerId: sharedRoot.userId,
  });

  if (!allowed) {
    throw new AppError("Folder is outside the shared resource", 403);
  }

  const targetFolder = await prisma.folder.findFirst({
    where: {
      id: targetFolderId,

      userId: sharedRoot.userId,

      isTrashed: false,
    },

    select: {
      id: true,
      name: true,
      parentId: true,
    },
  });

  if (!targetFolder) {
    throw new AppError("Folder not found", 404);
  }

  const [folders, files] = await prisma.$transaction([
    prisma.folder.findMany({
      where: {
        userId: sharedRoot.userId,

        parentId: targetFolderId,

        isTrashed: false,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.file.findMany({
      where: {
        userId: sharedRoot.userId,

        folderId: targetFolderId,

        isTrashed: false,
      },

      orderBy: {
        name: "asc",
      },

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

  return {
    sharedRoot: {
      id: sharedRoot.id,

      name: sharedRoot.name,
    },

    currentFolder: targetFolder,

    folders,

    files: files.map((file) => ({
      ...file,
      size: Number(file.size),
    })),
  };
}

export async function getPublicFolderFileDownloadUrl({ token, fileId }) {
  // ==================== VALIDATE SHARE LINK ====================

  const share = await resolveFolderShareLink(token);

  const sharedRoot = share.folder;

  // ==================== FIND FILE ====================

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,

      // Must belong to same owner as shared tree
      userId: sharedRoot.userId,

      isTrashed: false,
    },

    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      objectKey: true,
      folderId: true,
    },
  });

  if (!file) {
    throw new AppError("File not found", 404);
  }

  /*
    A folder share only exposes files
    contained somewhere under that shared root.

    Root-level files obviously cannot belong
    inside a shared folder.
  */
  if (!file.folderId) {
    throw new AppError("File is outside the shared folder", 403);
  }

  // ==================== VERIFY SUBTREE ====================

  const allowed = await isFolderInsideSharedTree({
    candidateFolderId: file.folderId,

    sharedRootFolderId: sharedRoot.id,

    ownerId: sharedRoot.userId,
  });

  if (!allowed) {
    throw new AppError("File is outside the shared folder", 403);
  }

  // ==================== DOWNLOAD URL ====================

  const command = new GetObjectCommand({
    Bucket: STORAGE_BUCKET,

    Key: file.objectKey,

    ResponseContentType: file.mimeType,

    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
      file.name,
    )}"`,
  });

  const downloadUrl = await getSignedUrl(storageClient, command, {
    expiresIn: 5 * 60,
  });

  return {
    file: {
      id: file.id,

      name: file.name,

      mimeType: file.mimeType,

      size: Number(file.size),
    },

    downloadUrl,

    expiresIn: 300,
  };
}


export async function getFileShareLinks({
  fileId,
  userId,
}) {
  const permission =
    await getFilePermission({
      fileId,
      userId,
    });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError(
      "Only the owner can view share links",
      403
    );
  }

  return prisma.fileShareLink.findMany({
    where: {
      fileId,
      revokedAt: null,
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
      revokedAt: true,
    },
  });
}

export async function getFolderShareLinks({
  folderId,
  userId,
}) {
  const permission =
    await getFolderPermission({
      folderId,
      userId,
    });

  if (permission !== PERMISSION.OWNER) {
    throw new AppError(
      "Only the owner can view share links",
      403
    );
  }

  return prisma.folderShareLink.findMany({
    where: {
      folderId,
      revokedAt: null,
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      expiresAt: true,
      createdAt: true,
      revokedAt: true,
    },
  });
}