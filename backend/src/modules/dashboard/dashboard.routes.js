import { Router } from "express";

import {
  requireAuth,
} from "../../middlewares/auth.middleware.js";

import {
  getDashboardController,
} from "./dashboard.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  getDashboardController
);

export default router;