import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateMeSchema
} from "./auth.validator.js";

import {
  registerUser,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  logoutAllSessions,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  updateUserProfile
} from "./auth.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { refreshCookieOptions } from "../../config/cookie.js";

// ==================== REGISTER ====================

export const register = asyncHandler(async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0].message,
      400
    );
  }

  const user = await registerUser(result.data);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: user,
  });
});

// ==================== VERIFY EMAIL ====================

export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/email-verified?status=invalid`
      );
    }

    await verifyEmail(token);

    return res.redirect(
      `${process.env.FRONTEND_URL}/email-verified?status=success`
    );
  } catch (error) {
    const status = error.message.includes("expired")
      ? "expired"
      : "invalid";

    return res.redirect(
      `${process.env.FRONTEND_URL}/email-verified?status=${status}`
    );
  }
};

// ==================== LOGIN ====================

export const login = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0].message,
      400
    );
  }

  const {
    user,
    accessToken,
    refreshToken,
  } = await loginUser({
    ...result.data,
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  });

  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions
  );

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      accessToken,
    },
  });
});

// ==================== REFRESH ====================

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError(
      "Refresh token missing",
      401
    );
  }

  const accessToken =
    await refreshAccessToken(refreshToken);

  return res.status(200).json({
    success: true,
    data: {
      accessToken,
    },
  });
});

// ==================== LOGOUT ====================

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ==================== CURRENT USER ====================

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// ==================== LOGOUT ALL ====================

export const logoutAll = asyncHandler(async (req, res) => {
  await logoutAllSessions(req.user.id);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out from all devices",
  });
});

// ==================== RESEND VERIFICATION ====================

export const resendVerification = asyncHandler(
  async (req, res) => {
    const result =
      resendVerificationSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    await resendVerificationEmail(
      result.data.email
    );

    return res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  }
);

// ==================== FORGOT PASSWORD ====================

export const forgotPasswordController = asyncHandler(
  async (req, res) => {
    const result =
      forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    await forgotPassword(result.data.email);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  }
);

// ==================== RESET PASSWORD ====================

export const resetPasswordController = asyncHandler(
  async (req, res) => {
    const result =
      resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    await resetPassword(result.data);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: refreshCookieOptions.secure,
      sameSite: refreshCookieOptions.sameSite,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login again.",
    });
  }
);

export const updateMe = asyncHandler(
  async (req, res) => {
    const result =
      updateMeSchema.safeParse(
        req.body
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const user =
      await updateUserProfile({
        userId: req.user.id,
        name: result.data.name,
      });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user,
      },
    });
  }
);