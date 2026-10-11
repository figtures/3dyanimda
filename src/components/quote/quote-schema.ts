import {z} from "zod";
export const schema = z.object({
  full_name: z.string().trim().min(2).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(40),
  company: z.string().max(200),
  quantity: z.coerce.number().int().min(1).max(1000),
  part_description: z.string().trim().min(10).max(2400),
  department: z.string().trim().max(100),
  reference: z.string().trim().max(100),
  target_date: z.string().max(10),
  environment: z.string().trim().max(500),
  material_pref: z.string().trim().max(100),
  nda: z.string().optional(),
});
