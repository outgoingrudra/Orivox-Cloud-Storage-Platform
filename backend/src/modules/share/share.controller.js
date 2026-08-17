import {
  shareFile,
  shareFolder,
  updateFileShare,
  updateFolderShare,
  revokeFileShare,
  revokeFolderShare,
  getSharedWithMe,
  getFileShares,
  getFolderShares,

  createFileShareLink,
  createFolderShareLink,
  revokeFileShareLink,
  revokeFolderShareLink,
  resolveFileShareLink,
  resolveFolderShareLink,
  getPublicFileDownloadUrl,
} from "./share.service.js";


import {
  createShareSchema,
  updateShareSchema,
  createShareLinkSchema,
} from "./share.validator.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

// ==================== SHARE FILE ====================

export const shareFileController = asyncHandler(async (req, res) => {
  const result = createShareSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const data = await shareFile({
    fileId: req.params.fileId,
    ownerId: req.user.id,
    ...result.data,
  });

  return res.status(200).json({
    success: true,
    message: "File shared successfully",
    data,
  });
});

// ==================== SHARE FOLDER ====================

export const shareFolderController = asyncHandler(async (req, res) => {
  const result = createShareSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const data = await shareFolder({
    folderId: req.params.folderId,
    ownerId: req.user.id,
    ...result.data,
  });

  return res.status(200).json({
    success: true,
    message: "Folder shared successfully",
    data,
  });
});

// ==================== UPDATE FILE SHARE ====================

export const updateFileShareController = asyncHandler(async (req, res) => {
  const result = updateShareSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const data = await updateFileShare({
    shareId: req.params.shareId,
    ownerId: req.user.id,
    permission: result.data.permission,
  });

  return res.status(200).json({
    success: true,
    message: "File share permission updated",
    data,
  });
});

// ==================== UPDATE FOLDER SHARE ====================

export const updateFolderShareController = asyncHandler(async (req, res) => {
  const result = updateShareSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  const data = await updateFolderShare({
    shareId: req.params.shareId,
    ownerId: req.user.id,
    permission: result.data.permission,
  });

  return res.status(200).json({
    success: true,
    message: "Folder share permission updated",
    data,
  });
});

// ==================== REVOKE ====================

export const revokeFileShareController = asyncHandler(async (req, res) => {
  await revokeFileShare({
    shareId: req.params.shareId,
    ownerId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "File access revoked",
  });
});

export const revokeFolderShareController = asyncHandler(async (req, res) => {
  await revokeFolderShare({
    shareId: req.params.shareId,
    ownerId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Folder access revoked",
  });
});

// ==================== SHARED WITH ME ====================

export const sharedWithMeController = asyncHandler(async (req, res) => {
  const data = await getSharedWithMe(req.user.id);

  return res.status(200).json({
    success: true,
    data,
  });
});

// ==================== WHO HAS ACCESS ====================

export const getFileSharesController = asyncHandler(async (req, res) => {
  const data = await getFileShares({
    fileId: req.params.fileId,
    ownerId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    data,
  });
});

export const getFolderSharesController = asyncHandler(async (req, res) => {
  const data = await getFolderShares({
    folderId: req.params.folderId,
    ownerId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    data,
  });
});


// ==================== CREATE FILE SHARE LINK ====================

export const createFileShareLinkController =asyncHandler(async (req, res) => {
    const result =
      createShareLinkSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await createFileShareLink({
        fileId:
          req.params.fileId,

        userId:
          req.user.id,

        expiresAt:
          result.data.expiresAt,
      });

    return res.status(201).json({
      success: true,
      message:
        "File share link created",
      data,
    });
  });

// ==================== CREATE FOLDER SHARE LINK ====================

export const createFolderShareLinkController = asyncHandler(async (req, res) => {
    const result =
      createShareLinkSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await createFolderShareLink({
        folderId:
          req.params.folderId,

        userId:
          req.user.id,

        expiresAt:
          result.data.expiresAt,
      });

    return res.status(201).json({
      success: true,
      message:
        "Folder share link created",
      data,
    });
  });

// ==================== REVOKE FILE SHARE LINK ====================

export const revokeFileShareLinkController =asyncHandler(async (req, res) => {
    await revokeFileShareLink({
      linkId:
        req.params.linkId,

      userId:
        req.user.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "File share link revoked",
    });
  });

// ==================== REVOKE FOLDER SHARE LINK ====================

export const revokeFolderShareLinkController =asyncHandler(async (req, res) => {
    await revokeFolderShareLink({
      linkId:
        req.params.linkId,

      userId:
        req.user.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Folder share link revoked",
    });
  });

// ==================== PUBLIC FILE LINK ====================

export const publicFileShareController =asyncHandler(async (req, res) => {
    const data =
      await resolveFileShareLink(
        req.params.token
      );

    return res.status(200).json({
      success: true,

      data: {
        id:
          data.file.id,

        name:
          data.file.name,

        mimeType:
          data.file.mimeType,

        size:
          Number(data.file.size),
      },
    });
  });

// ==================== PUBLIC FOLDER LINK ====================

export const publicFolderShareController =asyncHandler(async (req, res) => {
    const data =
      await resolveFolderShareLink(
        req.params.token
      );

    return res.status(200).json({
      success: true,

      data: {
        id:
          data.folder.id,

        name:
          data.folder.name,
      },
    });
  });


export const publicFileDownloadController = asyncHandler(async (req, res) => {
    const data =
      await getPublicFileDownloadUrl(
        req.params.token
      );

    return res.status(200).json({
      success: true,
      data,
    });
  });