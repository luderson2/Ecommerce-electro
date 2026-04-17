"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";
import { verifierAdmin } from "./_guard";

const STATUTS_VALIDES: OrderStatus[] = [
  "en_attente",
  "payee",
  "en_preparation",
  "livraison",
  "livree",
  "annulee",
];

export async function changerStatutCommande(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  const statut = formData.get("statut") as OrderStatus;

  if (!id || !STATUTS_VALIDES.includes(statut)) {
    return { error: "Données invalides." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: statut })
    .eq("id", id)
    .select("id")
    .single();

  if (error) return { error: "Mise à jour impossible. Vérifiez vos permissions." };

  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
  return { success: true };
}
