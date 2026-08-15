import { Router } from "express";

import {
  createFolderController,
  listFoldersController,
  renameFolderController,
  moveFolderController,
  trashFolderController,
  restoreFolderController,
  listTrashController,
  permanentlyDeleteFolderController
} from "./folder.controller.js";

import {
  requireAuth,
} from "../../middlewares/auth.middleware.js";

const router = Router();


router.use(requireAuth);

// ==================== LIST ====================

router.get(
  "/",
  listFoldersController
);

// ==================== TRASH LIST ====================

// Keep static routes before /:folderId routes
router.get(
  "/trash",
  listTrashController
);

// ==================== CREATE ====================

router.post(
  "/",
  createFolderController
);

// ==================== RENAME ====================

router.patch(
  "/:folderId/rename",
  renameFolderController
);

// ==================== MOVE ====================

router.patch(
  "/:folderId/move",
  moveFolderController
);

// ==================== TRASH ====================

router.patch(
  "/:folderId/trash",
  trashFolderController
);

// ==================== RESTORE ====================

router.patch(
  "/:folderId/restore",
  restoreFolderController
);

router.delete(
  "/:folderId",
  permanentlyDeleteFolderController
);
export default router;