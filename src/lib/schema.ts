import { z } from "zod";
export const articleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  lang: z.enum(["en", "zh"]),
  status: z.enum(["draft", "published"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (v) =>
        !Number.isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v,
      "Invalid date",
    ),
  tags: z.array(z.string()).default([]),
});
