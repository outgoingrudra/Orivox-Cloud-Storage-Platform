import { z } from "zod";

export const initiateUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required")
    .max(255, "File name is too long"),

  mimeType: z
    .string()
    .trim()
    .min(1, "MIME type is required"),

  size: z.coerce
    .number()
    .int()
    .positive("File size must be greater than 0"),

  folderId: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional(),
});



export const confirmUploadSchema = z.object({
  reservationId: z
    .string()
    .trim()
    .min(1, "Reservation ID is required"),
});



// ==================== RENAME FILE ====================

export const renameFileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "File name is required")
    .max(255, "File name cannot exceed 255 characters"),
});

// ==================== MOVE FILE ====================

export const moveFileSchema = z.object({
  folderId: z
    .string()
    .trim()
    .min(1, "Invalid folder")
    .nullable(),
});

// ==================== LIST FILES ====================
export const listFilesSchema = z.object({
  folderId: z
    .string()
    .trim()
    .min(1)
    .optional(),

  search: z
    .string()
    .trim()
    .max(255)
    .optional(),

  type: z
    .enum([
      "image",
      "video",
      "audio",
      "document",
      "archive",
      "other",
    ])
    .optional(),

  sortBy: z
    .enum([
      "name",
      "size",
      "createdAt",
      "updatedAt",
    ])
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