import { z } from "zod";

const telephoneCA = z
  .string()
  .transform((value) => value.replace(/[\s().+-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^1?\d{10}$/, {
        error: "Numéro de téléphone canadien invalide (10 chiffres)",
      })
  )
  .transform((value) => (value.startsWith("1") ? `+${value}` : `+1${value}`));

export const demandeReparationSchema = z.object({
  nom: z.string({ error: "Nom requis" }).trim().min(2).max(100),
  telephone: telephoneCA,
  appareil: z.string({ error: "Appareil requis" }).trim().min(2).max(120),
  description: z.string({ error: "Description requise" }).trim().min(10).max(2000),
  website: z.string().max(0).optional(),
});

export type DemandeReparationInput = z.infer<typeof demandeReparationSchema>;
