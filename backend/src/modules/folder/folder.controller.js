import {
  createFolderSchema,
  renameFolderSchema,
  moveFolderSchema,
  listFolderSchema,
} from "./folder.validator.js";

import {
  createFolder,
  listFolders,
  renameFolder,
  moveFolder,
  trashFolder,
  restoreFolder,
  listTrashedFolders,
  permanentlyDeleteFolder
} from "./folder.service.js";

import {
  asyncHandler,
} from "../../utils/asyncHandler.js";

import {
  AppError,
} from "../../utils/AppError.js";

// ==================== CREATE ====================

export const createFolderController = asyncHandler(async (req, res) => {
    const result =
      createFolderSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const folder =
      await createFolder({
        ...result.data,
        userId: req.user.id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Folder created successfully",
      data: folder,
    });
  });

// ==================== LIST ====================

export const listFoldersController = asyncHandler(async (req, res) => {
    const result =
      listFolderSchema.safeParse(
        req.query
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await listFolders({
        userId: req.user.id,
        ...result.data,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  });

// ==================== RENAME ====================

export const renameFolderController =asyncHandler(async (req, res) => {
    const result =
      renameFolderSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const folder =
      await renameFolder({
        folderId:
          req.params.folderId,

        userId:
          req.user.id,

        name:
          result.data.name,
      });

    return res.status(200).json({
      success: true,
      message:
        "Folder renamed successfully",
      data: folder,
    });
  });

// ==================== MOVE ====================

export const moveFolderController = asyncHandler(async (req, res) => {
    const result =
      moveFolderSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const folder =
      await moveFolder({
        folderId:
          req.params.folderId,

        userId:
          req.user.id,

        parentId:
          result.data.parentId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Folder moved successfully",
      data: folder,
    });
  });

// ==================== TRASH ====================

export const trashFolderController =asyncHandler(async (req, res) => {
    const folder =
      await trashFolder({
        folderId:
          req.params.folderId,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      message:
        "Folder moved to trash",
      data: folder,
    });
  });

// ==================== RESTORE ====================

export const restoreFolderController =asyncHandler(async (req, res) => {
    const folder =
      await restoreFolder({
        folderId:
          req.params.folderId,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      message:
        "Folder restored successfully",
      data: folder,
    });
  });

// ==================== LIST TRASH ====================

export const listTrashController =asyncHandler(async (req, res) => {
    const result =
      listFolderSchema.safeParse(
        req.query
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await listTrashedFolders({
        userId:
          req.user.id,

        page:
          result.data.page,

        limit:
          result.data.limit,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  });


// ==================== PERMANENT DELETE ====================

export const permanentlyDeleteFolderController = asyncHandler(async (req, res) => {
    const result =
      await permanentlyDeleteFolder({
        folderId:
          req.params.folderId,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      message:
        "Folder permanently deleted",
      data: result,
    });
  });