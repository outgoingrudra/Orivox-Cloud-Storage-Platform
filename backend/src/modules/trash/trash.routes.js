import { Router } from "express";

import {
  requireAuth,
} from "../../middlewares/auth.middleware.js";

import {
  listTrashController,
} from "./trash.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  listTrashController
);

export default router;