"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { envoyerSmsProprio } from "@/lib/sms/twilio";
import { demandeReparationSchema } from "@/lib/validations/reparation";
import type { ReparationStatus } from "@/types";
import { verifierAdmin } from "./_guard";

type ReparationState = {
  error?: string;
  success?: boolean;
  id?: string;
};

const STATUTS_VALIDES: ReparationStatus[] = [
  "nouveau",
  "contacte",
  "en_cours",
  "termine",
  "annule",
];

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

export async function soumettreDemandeReparation(
  _prevState: ReparationState | null,
  formData: FormData
): Promise<ReparationState> {
  const website = formData.get("website");
  if (typeof website === "string" && website.trim()) {
    return { success: true };
  }

  const parsed = demandeReparationSchema.safeParse({
    nom: formData.get("nom"),
    telephone: formData.get("telephone"),
    appareil: formData.get("appareil"),
    description: formData.get("description"),
    website,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const { nom, telephone, appareil, description } = parsed.data;
  const headerStore = await headers();
  // x-real-ip is set by the trusted reverse proxy (Vercel) and cannot be spoofed by the client.
  // x-forwarded-for is client-controllable (prepend a fake IP), so it is used only as a fallback.
  const ip =
    headerStore.get("x-real-ip") ||
    headerStore.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown";
  const ip_hash = hashIp(ip);
  const user_agent = headerStore.get("user-agent");
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const supabase = createAdminClient();

  const { count, error: countError } = await supabase
    .from("demandes_reparation")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ip_hash)
    .gte("created_at", since);

  if (countError) {
    return { error: "Impossible de vérifier la limite de demandes. Veuillez réessayer." };
  }

  if ((count ?? 0) >= 3) {
    return { error: "Trop de demandes récentes, réessayez plus tard." };
  }

  const { data, error } = await supabase
    .from("demandes_reparation")
    .insert({ nom, telephone, appareil, description, ip_hash, user_agent })
    .select("id")
    .single();

  if (error) {
    return { error: "Erreur lors de la soumission. Veuillez réessayer." };
  }

  try {
    await envoyerSmsProprio({ nom, telephone, appareil, description });
  } catch (errorSms) {
    console.error("[reparation] échec SMS Twilio:", errorSms);
  }

  revalidatePath("/admin/reparations");
  return { success: true, id: data.id };
}

export async function changerStatutReparation(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const { supabase: authClient, erreur } = await verifierAdmin();
  if (!authClient) return { error: erreur };

  const id = formData.get("id") as string;
  const statut = formData.get("statut") as ReparationStatus;
  const notes_admin = ((formData.get("notes_admin") as string | null) ?? "").trim() || null;

  if (!id || !STATUTS_VALIDES.includes(statut)) {
    return { error: "Données invalides." };
  }

  // demandes_reparation revokes all from authenticated — service_role required
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("demandes_reparation")
    .update({ statut, notes_admin })
    .eq("id", id)
    .select("id")
    .single();

  if (error) return { error: "Mise à jour impossible. Vérifiez vos permissions." };

  revalidatePath(`/admin/reparations/${id}`);
  revalidatePath("/admin/reparations");
  return { success: true };
}
