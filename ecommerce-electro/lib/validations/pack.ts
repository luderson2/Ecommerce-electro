import { z } from "zod";

export const packSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être positif"),
  is_active: z.boolean().default(true),
});

export type PackFormData = z.infer<typeof packSchema>;
