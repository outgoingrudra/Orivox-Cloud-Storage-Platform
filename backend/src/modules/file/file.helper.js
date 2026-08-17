import crypto from "crypto";
import prisma from "../../config/prisma.js";

import { AppError } from "../../utils/AppError.js";

import {
  validateActiveFolder,
} from "../folder/folder.helper.js";

// ==================== OBJECT KEY ====================

export const generateObjectKey = ({
  userId,
  fileName,
}) => {
  const randomId =
    crypto.randomUUID();

  const safeName =
    fileName.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

  return `users/${userId}/${randomId}-${safeName}`;
};

// ==================== VALIDATE TARGET FOLDER ====================

export const validateOwnedFolder = async ({
  folderId,
  userId,
}) => {
  return validateActiveFolder(
    folderId,
    userId
  );
};

// ==================== FIND OWNED FILE ====================

export const findOwnedFile = async (
  fileId,
  userId,
  options = {}
) => {
  const {
    allowTrashed = false,
  } = options;

  const file =
    await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

  if (!file) {
    throw new AppError(
      "File not found",
      404
    );
  }

  // File itself is trashed
  if (
    !allowTrashed &&
    file.isTrashed
  ) {
    throw new AppError(
      "File not found",
      404
    );
  }

  /*
    File might not be trashed,
    but its parent folder/ancestor
    might be trashed.
  */
  if (
    !allowTrashed &&
    file.folderId
  ) {
    await validateActiveFolder(
      file.folderId,
      userId
    );
  }

  return file;
};


export function getMimeFilter(type) {
  const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ];

  const archiveTypes = [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
  ];

  switch (type) {
    case "image":
      return {
        mimeType: {
          startsWith: "image/",
        },
      };

    case "video":
      return {
        mimeType: {
          startsWith: "video/",
        },
      };

    case "audio":
      return {
        mimeType: {
          startsWith: "audio/",
        },
      };

    case "document":
      return {
        mimeType: {
          in: documentTypes,
        },
      };

    case "archive":
      return {
        mimeType: {
          in: archiveTypes,
        },
      };

    case "other":
      return {
        NOT: [
          {
            mimeType: {
              startsWith: "image/",
            },
          },

          {
            mimeType: {
              startsWith: "video/",
            },
          },

          {
            mimeType: {
              startsWith: "audio/",
            },
          },

          {
            mimeType: {
              in: documentTypes,
            },
          },

          {
            mimeType: {
              in: archiveTypes,
            },
          },
        ],
      };

    default:
      return {};
  }
}