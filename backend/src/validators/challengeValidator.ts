import { z } from "zod";

export const createChallengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required").max(240),
  image: z.string().startsWith("data:image/", "Expected base64 image data"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(5),
});

export const joinChallengeParamsSchema = z.object({
  id: z.string().uuid("Invalid challenge ID"),
});

export const leaveChallengeParamsSchema = z.object({
  id: z.string().uuid("Invalid challenge ID"),
});

export const getAllChallengesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val ?? "1", 10)),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val ?? "5", 10)),
});
