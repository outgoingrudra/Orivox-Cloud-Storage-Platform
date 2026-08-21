import {
  createApiKeySchema,
  developerListSchema,
  developerUploadSchema,
} from "./developer.validator.js";

import {
  createDeveloperApiKey,
  listDeveloperApiKeys,
  revokeDeveloperApiKey,
  listDeveloperFiles,
  initiateDeveloperUpload,
  confirmDeveloperUpload,
  getDeveloperFileDownload,
  deleteDeveloperFile,
} from "./developer.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

function validate(schema, value) {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }

  return result.data;
}

// ======================================================
// API KEY MANAGEMENT — NORMAL ORIVOX AUTH
// ======================================================

export const createApiKeyController = asyncHandler(async (req, res) => {
  const data = validate(createApiKeySchema, req.body);

  const key = await createDeveloperApiKey({
    userId: req.user.id,
    name: data.name,
  });

  return res.status(201).json({
    success: true,
    message:
      "API key created. Save it now because it will not be shown again.",
    data: key,
  });
});

export const listApiKeysController = asyncHandler(async (req, res) => {
  const keys = await listDeveloperApiKeys(req.user.id);

  return res.status(200).json({
    success: true,
    data: { keys },
  });
});

export const revokeApiKeyController = asyncHandler(async (req, res) => {
  await revokeDeveloperApiKey({
    userId: req.user.id,
    keyId: req.params.keyId,
  });

  return res.status(200).json({
    success: true,
    message: "API key revoked successfully.",
  });
});

// ======================================================
// DEVELOPER FILE API — API KEY AUTH
// ======================================================

export const listDeveloperFilesController = asyncHandler(
  async (req, res) => {
    const query = validate(developerListSchema, req.query);

    const data = await listDeveloperFiles({
      userId: req.developer.userId,
      ...query,
    });

    return res.status(200).json({
      success: true,
      data,
      usage: {
        requests: req.developer.usage,
        monthlyLimit: req.developer.monthlyLimit,
      },
    });
  },
);

export const initiateDeveloperUploadController = asyncHandler(
  async (req, res) => {
    const data = validate(developerUploadSchema, req.body);

    const upload = await initiateDeveloperUpload({
      userId: req.developer.userId,
      ...data,
    });

    return res.status(201).json({
      success: true,
      message: "Upload initialized.",
      data: upload,
      usage: {
        requests: req.developer.usage,
        monthlyLimit: req.developer.monthlyLimit,
      },
    });
  },
);

export const confirmDeveloperUploadController = asyncHandler(
  async (req, res) => {
    const file = await confirmDeveloperUpload({
      userId: req.developer.userId,
      reservationId: req.params.reservationId,
    });

    return res.status(201).json({
      success: true,
      message: "Upload confirmed.",
      data: file,
    });
  },
);

export const getDeveloperFileController = asyncHandler(async (req, res) => {
  const data = await getDeveloperFileDownload({
    userId: req.developer.userId,
    fileId: req.params.fileId,
  });

  return res.status(200).json({
    success: true,
    data,
  });
});

export const deleteDeveloperFileController = asyncHandler(
  async (req, res) => {
    await deleteDeveloperFile({
      userId: req.developer.userId,
      fileId: req.params.fileId,
    });

    return res.status(200).json({
      success: true,
      message: "Developer file deleted successfully.",
    });
  },
);