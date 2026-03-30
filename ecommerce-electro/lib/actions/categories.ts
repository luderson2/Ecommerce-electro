"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const categorieSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  slug: z.string().min(2, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets uniquement)"),
  description: z.string().optional(),
});

export async function creerCategorie(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = categorieSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    ...parsed.data,
    description: parsed.data.description ?? null,
    parent_id: null,
  });

  if (error) return { error: error.message };

  redirect("/admin/categories");
}

export async function modifierCategorie(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Identifiant manquant." };

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = categorieSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function supprimerCategorie(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Identifiant manquant." };

  const supabase = await createClient();

  // Vérifier s'il y a des produits liés
  const { count } = await supabase
    .from("product_categories")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return { error: `Impossible de supprimer : ${count} produit${count > 1 ? "s" : ""} lié${count > 1 ? "s" : ""} à cette catégorie.` };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}
