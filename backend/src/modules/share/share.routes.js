import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";

import {
  shareFileController,
  shareFolderController,
  updateFileShareController,
  updateFolderShareController,
  revokeFileShareController,
  revokeFolderShareController,
  sharedWithMeController,
  getFileSharesController,
  getFolderSharesController,
} from "./share.controller.js";

const router = Router();

router.use(requireAuth);

// ==================== SHARED WITH ME ====================

router.get("/with-me", sharedWithMeController);

// ==================== FILE SHARING ====================

router.post("/files/:fileId", shareFileController);

router.get("/files/:fileId", getFileSharesController);

router.patch("/files/shares/:shareId", updateFileShareController);

router.delete("/files/shares/:shareId", revokeFileShareController);

// ==================== FOLDER SHARING ====================

router.post("/folders/:folderId", shareFolderController);

router.get("/folders/:folderId", getFolderSharesController);

router.patch("/folders/shares/:shareId", updateFolderShareController);

router.delete("/folders/shares/:shareId", revokeFolderShareController);

export default router;
