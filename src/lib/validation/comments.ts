import { z } from "zod";

export const createCommentSchema = z.object({
  displayName: z
    .string()
    .max(50)
    .optional()
    .transform((v) => v || "anon"),
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
