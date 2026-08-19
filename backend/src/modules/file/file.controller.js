import {
  initiateUploadSchema,
  confirmUploadSchema,
  renameFileSchema,
  moveFileSchema,
  listFilesSchema,
} from "./file.validator.js";
import {
  initiateUpload,
  confirmUpload,
  cancelUpload,
  listFiles,
  renameFile,
  moveFile,
  getFileDownloadUrl,
  trashFile,
  restoreFile,
  permanentlyDeleteFile,
  listTrashedFiles
} from "./file.service.js";
import {
  asyncHandler,
} from "../../utils/asyncHandler.js";

import {
  AppError,
} from "../../utils/AppError.js";

export const initiateUploadController = asyncHandler(async (req, res) => {
    const result =
      initiateUploadSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await initiateUpload({
        userId:
          req.user.id,

        ...result.data,
      });

    return res.status(201).json({
      success: true,

      message:
        "Upload initialized successfully",

      data,
    });
  });


export const confirmUploadController = asyncHandler(async (req, res) => {
    const result =
      confirmUploadSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const file =
      await confirmUpload({
        userId:
          req.user.id,

        reservationId:
          result.data.reservationId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Upload confirmed successfully",
      data: file,
    });
  });



export const cancelUploadController = asyncHandler(async (req, res) => {
    const { reservationId } = req.params;

    if (!reservationId) {
      throw new AppError(
        "Reservation ID is required",
        400
      );
    }

    await cancelUpload({
      userId: req.user.id,
      reservationId,
    });

    return res.status(200).json({
      success: true,
      message: "Upload cancelled successfully",
    });
  });

export const listFilesController =asyncHandler(async (req, res) => {
    const result =
      listFilesSchema.safeParse(
        req.query
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await listFiles({
        userId:
          req.user.id,

        ...result.data,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  });


export const renameFileController = asyncHandler(async (req, res) => {
    const result =
      renameFileSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const file =
      await renameFile({
        fileId:
          req.params.fileId,

        userId:
          req.user.id,

        name:
          result.data.name,
      });

    return res.status(200).json({
      success: true,
      message:
        "File renamed successfully",
      data: file,
    });
  });


export const moveFileController = asyncHandler(async (req, res) => {
    const result =
      moveFileSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const file =
      await moveFile({
        fileId:
          req.params.fileId,

        userId:
          req.user.id,

        folderId:
          result.data.folderId,
      });

    return res.status(200).json({
      success: true,
      message:
        "File moved successfully",
      data: file,
    });
  });


export const downloadFileController =  asyncHandler(async (req, res) => {
    const data =
      await getFileDownloadUrl({
        fileId:
          req.params.fileId,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  });


export const trashFileController =asyncHandler(async (req, res) => {
    const file =
      await trashFile({
        fileId:
          req.params.fileId,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      message:
        "File moved to trash",
      data: file,
    });
  });


export const restoreFileController =  asyncHandler(async (req, res) => {
    const file =
      await restoreFile({
        fileId:
          req.params.fileId,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      message:
        "File restored successfully",
      data: file,
    });
  });


export const permanentlyDeleteFileController = asyncHandler(async (req, res) => {
    await permanentlyDeleteFile({
      fileId: req.params.fileId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "File permanently deleted",
    });
  });


export const listTrashedFilesController =  asyncHandler(async (req, res) => {
    const result =
      listFilesSchema.safeParse(
        req.query
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await listTrashedFiles({
        userId: req.user.id,
        page: result.data.page,
        limit: result.data.limit,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  });