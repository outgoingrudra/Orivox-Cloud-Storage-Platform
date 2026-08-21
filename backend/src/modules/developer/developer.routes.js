import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireDeveloperApiKey } from "../../middlewares/developerAuth.middleware.js";

import {
  createApiKeyController,
  listApiKeysController,
  revokeApiKeyController,
  listDeveloperFilesController,
  initiateDeveloperUploadController,
  confirmDeveloperUploadController,
  getDeveloperFileController,
  deleteDeveloperFileController,
} from "./developer.controller.js";

const router = Router();

// ======================================================
// API KEY MANAGEMENT
// ======================================================

router.post(
  "/keys",
  requireAuth,
  createApiKeyController,
);

router.get(
  "/keys",
  requireAuth,
  listApiKeysController,
);

router.delete(
  "/keys/:keyId",
  requireAuth,
  revokeApiKeyController,
);

// ======================================================
// DEVELOPER API
// ======================================================

router.use(
  "/files",
  requireDeveloperApiKey,
);

router.get(
  "/files",
  listDeveloperFilesController,
);

router.post(
  "/files",
  initiateDeveloperUploadController,
);

router.post(
  "/files/:reservationId/confirm",
  confirmDeveloperUploadController,
);

router.get(
  "/files/:fileId",
  getDeveloperFileController,
);

router.delete(
  "/files/:fileId",
  deleteDeveloperFileController,
);

export default router;