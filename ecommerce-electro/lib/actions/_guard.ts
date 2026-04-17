"use server";

import { createClient } from "@/lib/supabase/server";

const ROLES_AUTORISES = ["admin", "employee"] as const;

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type GuardResult =
  | { supabase: SupabaseClient; erreur: null }
  | { supabase: null; erreur: string };

/**
 * Vérifie que l'appelant est authentifié et possède un rôle admin ou employee.
 * Retourne le client Supabase prêt à l'emploi pour éviter une double instanciation.
 */
export async function verifierAdmin(): Promise<GuardResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, erreur: "Accès non autorisé." };

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    !profil ||
    !ROLES_AUTORISES.includes(profil.role as (typeof ROLES_AUTORISES)[number])
  ) {
    return { supabase: null, erreur: "Accès non autorisé." };
  }

  return { supabase, erreur: null };
}
