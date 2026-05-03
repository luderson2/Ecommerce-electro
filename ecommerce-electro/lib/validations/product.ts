import { z } from "zod";

export const produitSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  slug: z.string().min(3, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres et tirets uniquement)"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être positif"),
  brand: z.string().min(1, "La marque est requise"),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif"),
  is_active: z.boolean().default(true),
});

export const alerteStockSchema = z.object({
  email: z.string().email("Adresse courriel invalide"),
  product_id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, "Identifiant produit invalide"),
});

export type ProduitFormData = z.infer<typeof produitSchema>;
export type AlerteStockFormData = z.infer<typeof alerteStockSchema>;
