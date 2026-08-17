import { z } from "zod";

export const createShareSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  permission: z
    .enum(["VIEWER", "EDITOR"])
    .default("VIEWER"),
});

export const updateShareSchema = z.object({
  permission: z.enum([
    "VIEWER",
    "EDITOR",
  ]),
});

// ==================== SHARE LINK ====================

export const createShareLinkSchema = z.object({
  expiresAt: z
    .string()
    .datetime()
    .nullable()
    .optional(),
});