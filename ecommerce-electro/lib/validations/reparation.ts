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

const TYPES_APPAREILS = [
  "refrigerateur",
  "congelateur",
  "laveuse",
  "secheuse",
  "lave-vaisselle",
  "cuisiniere",
  "four",
  "micro-ondes",
  "autre",
] as const;

export const TYPES_APPAREILS_LABELS: Record<(typeof TYPES_APPAREILS)[number], string> = {
  refrigerateur: "Réfrigérateur",
  congelateur: "Congélateur",
  laveuse: "Laveuse",
  secheuse: "Sécheuse",
  "lave-vaisselle": "Lave-vaisselle",
  cuisiniere: "Cuisinière",
  four: "Four",
  "micro-ondes": "Micro-ondes",
  autre: "Autre",
};

export const demandeReparationSchema = z.object({
  prenom: z.string({ error: "Prénom requis" }).trim().min(2).max(60),
  nom: z.string({ error: "Nom requis" }).trim().min(2).max(60),
  telephone: telephoneCA,
  email: z.email({ error: "Adresse courriel invalide" }).max(160),
  type_appareil: z.enum(TYPES_APPAREILS, { error: "Type d'appareil requis" }),
  marque: z.string({ error: "Marque requise" }).trim().min(1).max(60),
  modele: z.string({ error: "Modèle requis" }).trim().min(1).max(60),
  description: z.string({ error: "Description requise" }).trim().min(10).max(2000),
  disponibilites: z.string().trim().max(500).optional().transform((v) => v && v.length > 0 ? v : undefined),
  website: z.string().max(0).optional(),
});

export type DemandeReparationInput = z.infer<typeof demandeReparationSchema>;
