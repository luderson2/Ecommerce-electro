"use server";

import { produitSchema } from "@/lib/validations/product";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifierAdmin } from "./_guard";

export async function creerProduit(
  _prevState: { error?: string; success?: boolean; produitId?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; produitId?: string }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
    price: parseFloat(formData.get("price") as string),
    brand: formData.get("brand") as string,
    stock: parseInt(formData.get("stock") as string, 10),
    is_active: formData.get("is_active") === "true",
    washer_type: (formData.get("washer_type") as string) || null,
    stove_type: (formData.get("stove_type") as string) || null,
    finish: (formData.get("finish") as string) || null,
  };

  const parsed = produitSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...parsed.data,
      description: parsed.data.description ?? null,
      washer_type: parsed.data.washer_type ?? null,
      stove_type: parsed.data.stove_type ?? null,
      finish: parsed.data.finish ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Création impossible. Vérifiez les données saisies." };

  const imageUrls = formData.getAll("image_url") as string[];
  if (imageUrls.length > 0) {
    const { error: imgError } = await supabase.from("product_images").insert(
      imageUrls.map((url, idx) => ({
        product_id: data.id,
        url,
        sort_order: idx,
      }))
    );
    if (imgError) {
      await supabase.from("products").delete().eq("id", data.id);
      return { error: "Impossible d'enregistrer les images. Vérifiez vos permissions." };
    }
  }

  revalidatePath("/admin/produits");
  revalidatePath("/catalogue");
  revalidatePath("/");
  return { success: true, produitId: data.id };
}

export async function modifierProduit(
  _prevState: { error?: string; success?: boolean; produitId?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; produitId?: string }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  if (!id) return { error: "Identifiant manquant." };

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
    price: parseFloat(formData.get("price") as string),
    brand: formData.get("brand") as string,
    stock: parseInt(formData.get("stock") as string, 10),
    is_active: formData.get("is_active") === "true",
    washer_type: (formData.get("washer_type") as string) || null,
    stove_type: (formData.get("stove_type") as string) || null,
    finish: (formData.get("finish") as string) || null,
  };

  const parsed = produitSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Données invalides" };
  }

  const { error } = await supabase.from("products").update({
    ...parsed.data,
    description: parsed.data.description ?? null,
    washer_type: parsed.data.washer_type ?? null,
    stove_type: parsed.data.stove_type ?? null,
    finish: parsed.data.finish ?? null,
  }).eq("id", id).select("id").single();
  if (error) return { error: "Mise à jour impossible. Vérifiez vos permissions." };

  revalidatePath("/admin/produits");
  revalidatePath(`/admin/produits/${id}`);
  revalidatePath("/catalogue");
  revalidatePath(`/catalogue/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/produits");
}


export async function supprimerProduit(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  if (!id) return { error: "Identifiant manquant." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: "Suppression impossible. Vérifiez vos permissions." };

  revalidatePath("/admin/produits");
  revalidatePath("/catalogue");
  revalidatePath("/");
  redirect("/admin/produits");
}
