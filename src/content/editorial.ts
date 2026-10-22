import { z } from "zod";
import { answerUnitSchema } from './answer-unit';
export const editorialSchema = z.object({
  publishedAt: z.string().datetime({offset:true}).optional(),
  media: z.object({
    alt:z.string().trim().min(1).max(300),
    caption:z.string().trim().max(600).optional(),
    width:z.number().int().positive().max(16000),
    height:z.number().int().positive().max(16000),
  }).optional(),
  resources:z.array(z.object({
    title:z.string().trim().min(1).max(150),
    description:z.string().trim().max(400).optional(),
    path:z.string().regex(/^\/(?!\/)[a-z0-9/._-]+$/).refine(value=>!/^\/(admin|studio|api|auth)(\/|$)/.test(value)&&!value.includes('..'),"Bağlantı herkese açık bir içerik veya dosya yolu olmalı."),
  })).max(6).optional(),
  answerUnit:answerUnitSchema.optional(),
  answer: z.string().max(1600).refine(value=>value.trim().split(/\s+/u).filter(Boolean).length<=120,"Doğrudan cevap en fazla 120 kelime olmalı; ayrıntıları ayrı bölümlere taşıyın.").default(""),
  takeaways: z.array(z.string().max(500)).max(8).default([]),
  comparison: z.object({title:z.string().max(250),columns:z.array(z.string().max(150)).min(2).max(5),rows:z.array(z.array(z.string().max(600))).max(20)}).refine(v => v.rows.every(row => row.length === v.columns.length), "Tablodaki satır ve sütun sayıları eşleşmeli.").optional(),
  relatedPaths:z.array(z.string().regex(/^\/(?!\/)[a-z0-9/-]*$/).refine(value=>!/^\/(admin|studio|api|auth)(\/|$)/.test(value)&&!value.includes('//'),"İlgili bağlantı herkese açık bir içerik yolu olmalı.")).max(12).default([]),
  sources:z.array(z.object({title:z.string().max(250),url:z.string().url().refine(v => {try{const u=new URL(v);return u.protocol === "https:"&&!u.username&&!u.password;}catch{return false;}},"Kaynak HTTPS kullanmalı ve kullanıcı adı/şifre içermemeli.")})).max(10).optional(),
});
export type Editorial = z.infer<typeof editorialSchema>;
export const readEditorial = (value: unknown): Editorial | undefined => {
  const result = editorialSchema.safeParse(value);
  return result.success ? result.data : undefined;
};
