"use server";

import { packSchema } from "@/lib/validations/pack";
import { slugify } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifierAdmin } from "./_guard";

type ActionState = { error?: string; success?: boolean } | null;

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
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const { product_ids, ...raw } = parseFormData(formData);

  const parsed = packSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { data: pack, error } = await supabase
    .from("packs")
    .insert({ ...parsed.data, slug: slugify(parsed.data.name), description: parsed.data.description ?? null })
    .select("id")
    .single();

  if (error || !pack) return { error: "Création impossible. Vérifiez que le nom n'est pas déjà utilisé." };

  if (product_ids.length > 0) {
    const { error: linkError } = await supabase
      .from("pack_products")
      .insert(product_ids.map((product_id) => ({ pack_id: pack.id, product_id })));
    if (linkError) return { error: "Pack créé mais liaison des produits impossible. Contactez un administrateur." };
  }

  revalidatePath("/admin/packs");
  redirect("/admin/packs");
}

export async function modifierPack(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  const { product_ids, ...raw } = parseFormData(formData);

  const parsed = packSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase
    .from("packs")
    .update({ ...parsed.data, slug: slugify(parsed.data.name), description: parsed.data.description ?? null })
    .eq("id", id)
    .select("id")
    .single();

  if (error) return { error: "Mise à jour impossible. Vérifiez vos permissions." };

  // Remplacement atomique des produits via RPC (delete + insert dans une seule transaction)
  const { error: rpcError } = await supabase.rpc("remplacer_pack_products", {
    p_pack_id: id,
    p_product_ids: product_ids,
  });

  if (rpcError) return { error: "Impossible de mettre à jour les produits du pack." };

  revalidatePath("/admin/packs");
  redirect("/admin/packs");
}

export async function supprimerPack(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  if (!id) return { error: "Identifiant manquant." };

  const { error } = await supabase.from("packs").delete().eq("id", id);
  if (error) return { error: "Suppression impossible. Vérifiez vos permissions." };

  revalidatePath("/admin/packs");
  redirect("/admin/packs");
}
