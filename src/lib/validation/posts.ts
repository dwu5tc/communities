import { z } from "zod";

export const submitPostSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  localTitle: z.string().max(200).optional(),
  localNote: z.string().max(1000).optional(),
  submittedByAlias: z.string().max(50).optional(),
});

export type SubmitPostInput = z.infer<typeof submitPostSchema>;
