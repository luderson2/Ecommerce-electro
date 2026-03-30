"use server";

import { createClient } from "@/lib/supabase/server";
import { produitSchema } from "@/lib/validations/product";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function creerProduit(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: (formData.get("description") as string) || undefined,
    price: parseFloat(formData.get("price") as string),
    brand: formData.get("brand") as string,
    stock: parseInt(formData.get("stock") as string, 10),
    is_active: formData.get("is_active") === "true",
  };

  const parsed = produitSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("products").insert(parsed.data as any);

  if (error) {
    return { error: error.message };
  }

  redirect("/admin/produits");
}

export async function modifierProduit(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
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
  };

  const parsed = produitSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("products").update(parsed.data as any).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/produits");
  redirect(`/admin/produits/${id}`);
}

export async function supprimerProduit(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}
