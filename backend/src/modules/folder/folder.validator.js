import { z } from "zod";

// ==================== CREATE ====================

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(100, "Folder name cannot exceed 100 characters"),

  parentId: z
    .string()
    .trim()
    .min(1, "Invalid parent folder")
    .nullable()
    .optional(),
});

// ==================== RENAME ====================

export const renameFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(100, "Folder name cannot exceed 100 characters"),
});

// ==================== MOVE ====================

export const moveFolderSchema = z.object({
  parentId: z
    .string()
    .trim()
    .min(1, "Invalid destination folder")
    .nullable(),
});

// ==================== LIST ====================
export const listFolderSchema = z.object({
  parentId: z
    .string()
    .trim()
    .min(1)
    .optional(),

  search: z
    .string()
    .trim()
    .max(100)
    .optional(),

  sortBy: z
    .enum(["name", "createdAt", "updatedAt"])
    .default("createdAt"),

  order: z
    .enum(["asc", "desc"])
    .default("desc"),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
});