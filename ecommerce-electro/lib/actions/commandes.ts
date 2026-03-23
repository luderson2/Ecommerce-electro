"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";

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
  const id = formData.get("id") as string;
  const statut = formData.get("statut") as OrderStatus;

  if (!id || !STATUTS_VALIDES.includes(statut)) {
    return { error: "Données invalides." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: statut })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
  return { success: true };
}
