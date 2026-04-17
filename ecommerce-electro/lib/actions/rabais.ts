"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifierAdmin } from "./_guard";

const rabaisSchema = z.object({
  cible_type: z.enum(["product", "pack"], { message: "Type de cible invalide" }),
  cible_id: z.string().uuid("Veuillez sélectionner une cible valide"),
  discount_type: z.literal("percentage"),
  value: z
    .number({ error: "La valeur doit être un nombre" })
    .min(1, "La valeur doit être d'au moins 1 %")
    .max(100, "La valeur ne peut pas dépasser 100 %"),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  is_active: z.boolean(),
});

function parseFormData(formData: FormData) {
  const cible_type = formData.get("cible_type") as string;
  const cible_id = formData.get("cible_id") as string;
  const rawValue = formData.get("value") as string;
  const starts_at = (formData.get("starts_at") as string) || null;
  const ends_at = (formData.get("ends_at") as string) || null;
  const is_active = formData.get("is_active") === "true";

  return {
    cible_type,
    cible_id,
    discount_type: "percentage" as const,
    value: parseFloat(rawValue),
    starts_at: starts_at || null,
    ends_at: ends_at || null,
    is_active,
  };
}

export async function creerRabais(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const raw = parseFormData(formData);
  const parsed = rabaisSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { cible_type, cible_id, discount_type, value, starts_at, ends_at, is_active } = parsed.data;

  const insert = {
    discount_type,
    value,
    starts_at: starts_at || null,
    ends_at: ends_at || null,
    is_active,
    product_id: cible_type === "product" ? cible_id : null,
    pack_id: cible_type === "pack" ? cible_id : null,
  };

  const { error } = await supabase.from("discounts").insert(insert);
  if (error) return { error: "Création impossible. Vérifiez les données saisies." };

  redirect("/admin/rabais");
}

export async function modifierRabais(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  if (!id) return { error: "Identifiant manquant." };

  const raw = parseFormData(formData);
  const parsed = rabaisSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { cible_type, cible_id, discount_type, value, starts_at, ends_at, is_active } = parsed.data;

  const update = {
    discount_type,
    value,
    starts_at: starts_at || null,
    ends_at: ends_at || null,
    is_active,
    product_id: cible_type === "product" ? cible_id : null,
    pack_id: cible_type === "pack" ? cible_id : null,
  };

  const { error } = await supabase.from("discounts").update(update).eq("id", id).select("id").single();
  if (error) return { error: "Mise à jour impossible. Vérifiez vos permissions." };

  revalidatePath("/admin/rabais");
  redirect("/admin/rabais");
}

export async function supprimerRabais(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  if (!id) return { error: "Identifiant manquant." };

  const { error } = await supabase.from("discounts").delete().eq("id", id);
  if (error) return { error: "Suppression impossible. Vérifiez vos permissions." };

  revalidatePath("/admin/rabais");
  return { success: true };
}
