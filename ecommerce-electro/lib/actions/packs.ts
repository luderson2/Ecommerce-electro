"use server";

import { createClient } from "@/lib/supabase/server";
import { packSchema } from "@/lib/validations/pack";
import { slugify } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionState = { error: string } | null;

function parseFormData(formData: FormData) {
  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: parseFloat(formData.get("price") as string),
    is_active: formData.get("is_active") === "true",
    product_ids: formData.getAll("product_ids") as string[],
  };
}

export async function creerPack(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { product_ids, ...raw } = parseFormData(formData);

  const parsed = packSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();

  const { data: pack, error } = await supabase
    .from("packs")
    .insert({ ...parsed.data, slug: slugify(parsed.data.name), description: parsed.data.description ?? null })
    .select("id")
    .single();

  if (error || !pack) return { error: error?.message ?? "Erreur lors de la création" };

  if (product_ids.length > 0) {
    const { error: linkError } = await supabase
      .from("pack_products")
      .insert(product_ids.map((product_id) => ({ pack_id: pack.id, product_id })));
    if (linkError) return { error: linkError.message };
  }

  revalidatePath("/admin/packs");
  redirect("/admin/packs");
}

export async function modifierPack(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  const { product_ids, ...raw } = parseFormData(formData);

  const parsed = packSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("packs")
    .update({ ...parsed.data, slug: slugify(parsed.data.name), description: parsed.data.description ?? null })
    .eq("id", id);

  if (error) return { error: error.message };

  // Remplacer les produits du pack
  await supabase.from("pack_products").delete().eq("pack_id", id);

  if (product_ids.length > 0) {
    const { error: linkError } = await supabase
      .from("pack_products")
      .insert(product_ids.map((product_id) => ({ pack_id: id, product_id })));
    if (linkError) return { error: linkError.message };
  }

  revalidatePath("/admin/packs");
  revalidatePath(`/admin/packs/${id}`);
  redirect("/admin/packs");
}
