"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SavStatus } from "@/types";

const STATUTS_VALIDES: SavStatus[] = ["ouvert", "en_cours", "resolu", "ferme"];

export async function changerStatutSAV(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const id = formData.get("id") as string;
  const statut = formData.get("statut") as SavStatus;

  if (!id || !STATUTS_VALIDES.includes(statut)) {
    return { error: "Données invalides." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_requests")
    .update({ status: statut })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/sav/${id}`);
  revalidatePath("/admin/sav");
  return { success: true };
}
