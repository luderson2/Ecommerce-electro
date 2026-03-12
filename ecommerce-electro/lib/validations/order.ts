import { z } from "zod";

export const adresseLivraisonSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  adresse: z.string().min(5, "Adresse invalide"),
  ville: z.string().min(1, "Ville requise"),
  province: z.string().length(2, "Code de province invalide (ex: QC)"),
  codePostal: z
    .string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, "Code postal invalide"),
  telephone: z
    .string()
    .regex(/^\d{10}$/, "Numéro de téléphone invalide (10 chiffres)"),
});

export const savSchema = z.object({
  typeAppareil: z.string().min(1, "Type d'appareil requis"),
  marque: z.string().min(1, "Marque requise"),
  numeroModele: z.string().min(1, "Numéro de modèle requis"),
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caractères"),
  order_id: z.string().uuid().optional(),
});

export type AdresseLivraisonData = z.infer<typeof adresseLivraisonSchema>;
export type SavFormData = z.infer<typeof savSchema>;
