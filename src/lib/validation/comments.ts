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
  parentId: z.number().int().positive().optional(),
  anchorSelector: z.string().max(1000).optional(),
  anchorOffset: z.number().int().min(0).optional(),
  anchorLength: z.number().int().min(1).optional(),
  anchorText: z.string().max(500).optional(),
  anchorContextBefore: z.string().max(50).optional(),
  anchorContextAfter: z.string().max(50).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
