import { z } from "zod";

export const connexionSchema = z.object({
  email: z.string().email("Adresse courriel invalide"),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const inscriptionSchema = z
  .object({
    nomComplet: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse courriel invalide"),
    telephone: z
      .string()
      .regex(/^\d{10}$/, "Numéro de téléphone invalide (10 chiffres)")
      .optional()
      .or(z.literal("")),
    motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmerMotDePasse: z.string(),
  })
  .refine((data) => data.motDePasse === data.confirmerMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmerMotDePasse"],
  });

export type ConnexionFormData = z.infer<typeof connexionSchema>;
export type InscriptionFormData = z.infer<typeof inscriptionSchema>;
