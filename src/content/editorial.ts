import { z } from "zod";
export const editorialSchema = z.object({
  answer: z.string().max(1600).default(""),
  takeaways: z.array(z.string().max(500)).max(8).default([]),
  comparison: z.object({title:z.string().max(250),columns:z.array(z.string().max(150)).min(2).max(5),rows:z.array(z.array(z.string().max(600))).max(20)}).refine(v => v.rows.every(row => row.length === v.columns.length), "Tablodaki satır ve sütun sayıları eşleşmeli.").optional(),
  relatedPaths:z.array(z.string().regex(/^\/(?!\/)[a-z0-9/-]*$/)).max(12).default([]),
  sources:z.array(z.object({title:z.string().max(250),url:z.string().url().refine(v => new URL(v).protocol === "https:")})).max(10).optional(),
});
export type Editorial = z.infer<typeof editorialSchema>;
export const readEditorial = (value: unknown): Editorial | undefined => {
  const result = editorialSchema.safeParse(value);
  return result.success ? result.data : undefined;
};
