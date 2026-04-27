import { z } from "zod";

export const connexionSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ error: "Courriel invalide." })
    .max(254),
  password: z
    .string()
    .min(1, { error: "Mot de passe requis." })
    .max(128, { error: "Mot de passe trop long." }),
  next: z.string().max(500).optional(),
});

export const inscriptionSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ error: "Courriel invalide." })
    .max(254),
  password: z
    .string()
    .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." })
    .max(128, { error: "Mot de passe trop long." }),
  firstName: z
    .string()
    .trim()
    .min(1, { error: "Prénom requis." })
    .max(80),
  lastName: z
    .string()
    .trim()
    .min(1, { error: "Nom requis." })
    .max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?1?\d{10}$/, { error: "Numéro de téléphone invalide (10 chiffres)." })
    .optional()
    .or(z.literal("")),
});

export type ConnexionFormData = z.infer<typeof connexionSchema>;
export type InscriptionFormData = z.infer<typeof inscriptionSchema>;
