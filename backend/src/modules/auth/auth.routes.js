import { Router } from "express";

import {
  register,
  login,
  verifyEmailController,
  refresh,
  logout,
  me,
  logoutAll,
  resendVerification,
  forgotPasswordController,
  resetPasswordController,
  updateMe,
  sessions,
  revokeSessionController,
  logoutOtherSessions,
  changePasswordController
} from "./auth.controller.js";

import { requireAuth } from "../../middlewares/auth.middleware.js";

import {
  loginLimiter,
  registerLimiter,
  emailLimiter,
} from "../../middlewares/rateLimit.middleware.js";

const router = Router();

// ==================== PUBLIC AUTH ====================

router.post("/register", registerLimiter, register);

router.post("/login", loginLimiter, login);

router.post("/resend-verification", emailLimiter, resendVerification);

router.post("/forgot-password", emailLimiter, forgotPasswordController);

router.post("/reset-password", loginLimiter, resetPasswordController);
router.patch(
  "/change-password",
  requireAuth,
  changePasswordController
);

// ==================== SESSION ====================

router.post("/refresh", refresh);

router.post("/logout", logout);

router.post("/logout-all", requireAuth, logoutAll);
router.post("/logout-others", requireAuth, logoutOtherSessions);
router.get("/sessions", requireAuth, sessions);
router.delete("/sessions/:sessionId", requireAuth, revokeSessionController);

// ==================== USER ====================

router.get("/me", requireAuth, me);

// ==================== EMAIL VERIFICATION ====================

router.get("/verify-email", verifyEmailController);
// ==================== USER ====================

router.get("/me", requireAuth, me);

router.patch("/me", requireAuth, updateMe);
export default router;
