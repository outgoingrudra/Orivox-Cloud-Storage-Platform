import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";

import {
  // ==================== PUBLIC ====================
  publicFileShareController,
  publicFileDownloadController,
  publicFolderShareController,
  publicFolderContentsController,
  publicFolderFileDownloadController,

  // ==================== SHARED WITH ME ====================
  sharedWithMeController,

  // ==================== DIRECT FILE SHARING ====================
  shareFileController,
  getFileSharesController,
  updateFileShareController,
  revokeFileShareController,

  // ==================== FILE SHARE LINKS ====================
  createFileShareLinkController,
  getFileShareLinksController,
  revokeFileShareLinkController,

  // ==================== DIRECT FOLDER SHARING ====================
  shareFolderController,
  getFolderSharesController,
  updateFolderShareController,
  revokeFolderShareController,

  // ==================== FOLDER SHARE LINKS ====================
  createFolderShareLinkController,
  getFolderShareLinksController,
  revokeFolderShareLinkController,
} from "./share.controller.js";

const router = Router();

// ======================================================
// PUBLIC SHARE LINKS
// ======================================================

router.get("/public/file/:token", publicFileShareController);

router.get("/public/file/:token/download", publicFileDownloadController);

router.get("/public/folder/:token", publicFolderShareController);

router.get("/public/folder/:token/contents", publicFolderContentsController);

router.get(
  "/public/folder/:token/files/:fileId/download",
  publicFolderFileDownloadController,
);

// ======================================================
// AUTHENTICATED SHARE APIs
// ======================================================

router.use(requireAuth);

// ======================================================
// SHARED WITH ME
// ======================================================

router.get("/with-me", sharedWithMeController);

// ======================================================
// DIRECT FILE SHARING
// ======================================================

router.post("/files/:fileId", shareFileController);

router.get("/files/:fileId", getFileSharesController);

router.patch("/files/shares/:shareId", updateFileShareController);

router.delete("/files/shares/:shareId", revokeFileShareController);

// ======================================================
// FILE SHARE LINKS
// ======================================================

router.post("/files/:fileId/links", createFileShareLinkController);

router.get("/files/:fileId/links", getFileShareLinksController);

router.delete("/files/links/:linkId", revokeFileShareLinkController);

// ======================================================
// DIRECT FOLDER SHARING
// ======================================================

router.post("/folders/:folderId", shareFolderController);

router.get("/folders/:folderId", getFolderSharesController);

router.patch("/folders/shares/:shareId", updateFolderShareController);

router.delete("/folders/shares/:shareId", revokeFolderShareController);

// ======================================================
// FOLDER SHARE LINKS
// ======================================================

router.post("/folders/:folderId/links", createFolderShareLinkController);

router.get("/folders/:folderId/links", getFolderShareLinksController);

router.delete("/folders/links/:linkId", revokeFolderShareLinkController);

export default router;
