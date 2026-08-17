import { Router } from "express";

import {
  requireAuth,
} from "../../middlewares/auth.middleware.js";

import {
  globalSearchController,
} from "./search.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  globalSearchController
);

export default router;