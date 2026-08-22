import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import prisma from "../../config/prisma.js";

import { generateToken, generateRefreshToken } from "../../utils/token.js";

import { AppError } from "../../utils/AppError.js";

import {
  publishVerificationEmail,
  publishPasswordResetEmail,
  publishWelcomeEmail
} from "./auth.publisher.js";

// ==================== CONSTANTS ====================

const EMAIL_VERIFICATION_EXPIRY = 30 * 60 * 1000;

const PASSWORD_RESET_EXPIRY = 15 * 60 * 1000;

const REFRESH_SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// ==================== HELPERS ====================

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateAccessToken = ({
  userId,
  sessionId,
 }) =>
  jwt.sign(
    {
      userId,
      sessionId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

// ==================== REGISTER ====================

export const registerUser = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },

    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new AppError(
      "User already exists",
      409
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const {
    token,
    tokenHash,
  } = generateToken();

  // User + verification token created atomically
  const user = await prisma.$transaction(
    async (tx) => {
      const createdUser =
        await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
          },

          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
            createdAt: true,
          },
        });

      await tx.emailVerificationToken.create({
        data: {
          tokenHash,
          userId: createdUser.id,

          expiresAt: new Date(
            Date.now() +
              EMAIL_VERIFICATION_EXPIRY
          ),
        },
      });

      return createdUser;
    }
  );

  /*
    Publishing email is intentionally outside
    the DB transaction.

    Database work should not stay open while
    interacting with RabbitMQ.
  */
  try {
    publishVerificationEmail({
      email: user.email,
      token,
    });
  } catch (error) {
    /*
      Registration has already succeeded.

      Do not delete the user just because
      the queue is temporarily unavailable.

      The user can request another
      verification email later.
    */
    console.error(
      "Unable to queue verification email:",
      error.message
    );
  }

  return user;
};

// ==================== VERIFY EMAIL ====================

// ==================== VERIFY EMAIL ====================

export const verifyEmail = async (token) => {
  const tokenHash = hashToken(token);

  const verificationToken =
    await prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
    });

  if (!verificationToken) {
    throw new AppError(
      "Invalid verification link",
      400
    );
  }

  if (
    verificationToken.expiresAt <
    new Date()
  ) {
    await prisma.emailVerificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });

    throw new AppError(
      "Verification link expired",
      400
    );
  }

  // =====================================================
  // VERIFY ATOMICALLY
  // =====================================================

  const result =
    await prisma.$transaction(
      async (tx) => {
        /*
          updateMany allows us to verify only when:

          isVerified: false → true

          If two verification requests race,
          only one request can get count = 1.
        */

        const verified =
          await tx.user.updateMany({
            where: {
              id: verificationToken.userId,
              isVerified: false,
            },

            data: {
              isVerified: true,
            },
          });

        const user =
          await tx.user.findUnique({
            where: {
              id: verificationToken.userId,
            },

            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true,
            },
          });

        if (!user) {
          throw new AppError(
            "User not found",
            404
          );
        }

        // Verification links become unusable.
        await tx.emailVerificationToken.deleteMany({
          where: {
            userId:
              verificationToken.userId,
          },
        });

        return {
          user,
          newlyVerified:
            verified.count === 1,
        };
      }
    );

  // =====================================================
  // WELCOME EMAIL
  // =====================================================

  /*
    RabbitMQ is external infrastructure,
    so publish only AFTER PostgreSQL commits.

    Verification must remain successful even
    if the email queue is temporarily down.
  */

  if (result.newlyVerified) {
    try {
      publishWelcomeEmail({
        email: result.user.email,
        name: result.user.name,
      });
    } catch (error) {
      console.error(
        "Unable to queue welcome email:",
        error.message
      );
    }
  }

  return true;
};

// ==================== LOGIN ====================

export const loginUser = async ({
  email,
  password,
  userAgent,
  ipAddress,
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Same error for wrong email/password
  // prevents account enumeration
  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const isMatch = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isMatch) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (!user.isVerified) {
    throw new AppError(
      "Please verify your email first",
      403
    );
  }

  const {
    token: refreshToken,
    tokenHash: refreshTokenHash,
  } = generateRefreshToken();

  /*
    Create the session first because
    accessToken now contains sessionId.
  */
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,

      expiresAt: new Date(
        Date.now() +
          REFRESH_SESSION_EXPIRY
      ),
    },

    select: {
      id: true,
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    sessionId: session.id,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },

    accessToken,
    refreshToken,
  };
};

// ==================== REFRESH ACCESS TOKEN ====================

export const refreshAccessToken = async (
  refreshToken
) => {
  const refreshTokenHash =
    hashToken(refreshToken);

  const session =
    await prisma.session.findUnique({
      where: {
        refreshTokenHash,
      },
    });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt < new Date()
  ) {
    throw new AppError(
      "Invalid or expired session",
      401
    );
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },

    data: {
      lastUsedAt: new Date(),
    },
  });

  return generateAccessToken({
    userId: session.userId,
    sessionId: session.id,
  });
};
// ==================== LOGOUT ====================

export const logoutUser = async (refreshToken) => {
  const refreshTokenHash = hashToken(refreshToken);

  await prisma.session.updateMany({
    where: {
      refreshTokenHash,
      revokedAt: null,
    },

    data: {
      revokedAt: new Date(),
    },
  });
};

// ==================== CURRENT USER ====================

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,

      storageUsed: true,
      storageLimit: true,

      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,

    // BigInt cannot be JSON serialized directly
    storageUsed: Number(user.storageUsed),

    storageLimit: Number(user.storageLimit),
  };
};

// ==================== LOGOUT ALL DEVICES ====================

export const logoutAllSessions = async (userId) => {
  await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },

    data: {
      revokedAt: new Date(),
    },
  });
};

// ==================== RESEND VERIFICATION ====================

export const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  /*
      Don't reveal whether:
      - user exists
      - email is already verified

      Controller can always return the same success response.
    */
  if (!user || user.isVerified) {
    return;
  }

  // Only latest verification link should work
  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const { token, tokenHash } = generateToken();

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash,
      userId: user.id,

      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY),
    },
  });

  publishVerificationEmail({
    email: user.email,
    token,
  });
};

// ==================== FORGOT PASSWORD ====================

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Prevent account enumeration
  if (!user) {
    return;
  }

  // Only latest reset link should work
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const { token, tokenHash } = generateToken();

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,

      expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY),
    },
  });

  publishPasswordResetEmail({
    email: user.email,
    token,
  });
};

// ==================== RESET PASSWORD ====================

export const resetPassword = async ({ token, password }) => {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!resetToken) {
    throw new AppError("Invalid reset link", 400);
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });

    throw new AppError("Reset link expired", 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    // Change password
    prisma.user.update({
      where: {
        id: resetToken.userId,
      },

      data: {
        passwordHash,
      },
    }),

    // Make reset link one-time use
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
      },
    }),

    // Logout every existing device
    prisma.session.updateMany({
      where: {
        userId: resetToken.userId,
        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    }),
  ]);
};

export const updateUserProfile = async ({
  userId,
  name,
}) => {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      name,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isVerified: true,
      createdAt: true,
    },
  });

  return user;
};

export const getActiveSessions = async ({
  userId,
}) => {
  const sessions =
    await prisma.session.findMany({
      where: {
        userId,

        revokedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },

      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },

      orderBy: {
        lastUsedAt: "desc",
      },
    });

  return sessions;
};


export const revokeSession = async ({
  userId,
  sessionId,
}) => {
  const session =
    await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },

      select: {
        id: true,
      },
    });

  if (!session) {
    throw new AppError(
      "Session not found.",
      404
    );
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },

    data: {
      revokedAt: new Date(),
    },
  });
};


export const revokeOtherSessions = async ({
  userId,
  currentSessionId,
}) => {
  const result =
    await prisma.session.updateMany({
      where: {
        userId,

        id: {
          not: currentSessionId,
        },

        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });

  return result.count;
};

export const changePassword = async ({
  userId,
  currentSessionId,
  currentPassword,
  newPassword,
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new AppError(
      "User not found.",
      404
    );
  }

  const validPassword =
    await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

  if (!validPassword) {
    throw new AppError(
      "Current password is incorrect.",
      400
    );
  }

  const samePassword =
    await bcrypt.compare(
      newPassword,
      user.passwordHash
    );

  if (samePassword) {
    throw new AppError(
      "New password must be different from your current password.",
      400
    );
  }

  const passwordHash =
    await bcrypt.hash(
      newPassword,
      12
    );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });

  await revokeOtherSessions({
    userId,
    currentSessionId,
  });
};