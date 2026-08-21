import prisma from "../config/prisma.js";
import { hashApiKey } from "../utils/apiKey.js";
import { AppError } from "../utils/AppError.js";

const MONTHLY_API_LIMIT = 1000;

export async function requireDeveloperApiKey(req, res, next) {
  try {
    const authorization = req.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("Developer API key is required.", 401);
    }

    const rawKey = authorization.slice(7).trim();

    if (!rawKey.startsWith("orvx_live_")) {
      throw new AppError("Invalid developer API key.", 401);
    }

    const keyHash = hashApiKey(rawKey);

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      select: {
        id: true,
        userId: true,
        revokedAt: true,
      },
    });

    if (!apiKey || apiKey.revokedAt) {
      throw new AppError("Invalid or revoked developer API key.", 401);
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const usage = await prisma.$transaction(async (tx) => {
      const current = await tx.apiUsage.upsert({
        where: {
          userId_year_month: {
            userId: apiKey.userId,
            year,
            month,
          },
        },
        update: {},
        create: {
          userId: apiKey.userId,
          year,
          month,
        },
      });

      if (current.requests >= MONTHLY_API_LIMIT) {
        throw new AppError(
          "Monthly developer API quota exceeded.",
          429,
        );
      }

      return tx.apiUsage.update({
        where: { id: current.id },
        data: {
          requests: {
            increment: 1,
          },
        },
      });
    });

    /*
      Do this asynchronously enough for functionality,
      but still catch failures.
    */
    prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: now },
      })
      .catch((error) =>
        console.error("Unable to update API key lastUsedAt:", error),
      );

    req.developer = {
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
      usage: usage.requests,
      monthlyLimit: MONTHLY_API_LIMIT,
    };

    next();
  } catch (error) {
    next(error);
  }
}