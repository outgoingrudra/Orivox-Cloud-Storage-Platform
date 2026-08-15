import { z } from "zod";

export const listTrashSchema = z.object({
  search: z
    .string()
    .trim()
    .max(255)
    .optional(),

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