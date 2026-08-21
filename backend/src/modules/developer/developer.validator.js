import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().trim().min(2).max(50),
});

export const developerUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(150),
  size: z.coerce.number().int().positive(),
});

export const developerListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});