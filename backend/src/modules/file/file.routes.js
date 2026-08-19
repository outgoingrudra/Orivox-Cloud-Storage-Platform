import { Router } from "express";

import {
  requireAuth,
} from "../../middlewares/auth.middleware.js";

import {
  initiateUploadController,
  confirmUploadController,
  cancelUploadController,

  listFilesController,
  renameFileController,
  moveFileController,
  downloadFileController,
  trashFileController,
  restoreFileController,
  permanentlyDeleteFileController,
  listTrashedFilesController,
} from "./file.controller.js";

const router = Router();

router.use(requireAuth);


// ==================== UPLOAD ====================

router.post(
  "/upload/initiate",
  initiateUploadController
);

router.post(
  "/upload/confirm",
  confirmUploadController
);

router.delete(
  "/upload/:reservationId",
  cancelUploadController
);


// ==================== LIST ====================

router.get(
  "/",
  listFilesController
);


// ==================== FILE OPERATIONS ====================

router.patch(
  "/:fileId/rename",
  renameFileController
);

router.patch(
  "/:fileId/move",
  moveFileController
);
router.get(
  "/trash",
  listTrashedFilesController
);

router.get(
  "/:fileId/download",
  downloadFileController
);

router.patch(
  "/:fileId/trash",
  trashFileController
);

router.patch(
  "/:fileId/restore",
  restoreFileController
);

router.delete(
  "/:fileId",
  permanentlyDeleteFileController
);
export default router;