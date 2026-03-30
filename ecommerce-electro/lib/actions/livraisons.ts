"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DeliveryStatus } from "@/types";

const STATUTS_VALIDES: DeliveryStatus[] = ["planifiee", "en_transit", "livree", "echec"];

export async function changerStatutLivraison(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const id = formData.get("id") as string;
  const statut = formData.get("statut") as DeliveryStatus;
  const scheduledDate = formData.get("scheduled_date") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!id || !STATUTS_VALIDES.includes(statut)) {
    return { error: "Données invalides." };
  }

  const update: Record<string, unknown> = { status: statut };
  if (scheduledDate) update.scheduled_date = scheduledDate;
  if (statut === "livree") update.delivered_at = new Date().toISOString();
  if (notes !== null) update.notes = notes || null;

  const supabase = await createClient();
  const { data: livraison, error: fetchError } = await supabase
    .from("deliveries")
    .select("order_id")
    .eq("id", id)
    .single();

  if (fetchError || !livraison) return { error: "Livraison introuvable." };

  const { error } = await supabase
    .from("deliveries")
    .update(update)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/livraisons/${id}`);
  revalidatePath("/admin/livraisons");
  revalidatePath(`/admin/commandes/${livraison.order_id}`);
  return { success: true };
}
