"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connexionSchema, inscriptionSchema } from "@/lib/validations/auth";

const DESTINATIONS: Record<string, string> = {
  admin: "/admin",
  employee: "/admin",
  client: "/",
};

export async function seConnecter(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const parsed = connexionSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const { email, password, next = "" } = parsed.data;

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !authData.user) {
    return { error: "Courriel ou mot de passe incorrect." };
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  // Si un `next` sécurisé est fourni (chemin interne uniquement), l'utiliser
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") && !next.includes("://")
      ? next
      : null;
  const destination = safeNext ?? DESTINATIONS[profil?.role ?? ""] ?? "/";
  redirect(destination);
}


export async function sInscrire(
  _prevState: { error?: string; success?: boolean; needsConfirmation?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; needsConfirmation?: boolean }> {
  const parsed = inscriptionSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const { email, password, firstName, lastName, phone } = parsed.data;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/compte/profil`,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      },
    },
  });

  if (error) {
    if (error.message.includes("User already registered") || error.message.includes("already been registered")) {
      return { error: "Un compte existe déjà avec ce courriel." };
    }
    return { error: error.message };
  }

  // Supabase a la confirmation email activée : pas de session créée immédiatement
  if (data.user && !data.session) {
    return { success: true, needsConfirmation: true };
  }

  // Session créée directement (confirmation email désactivée)
  revalidatePath("/", "layout");
  redirect("/compte/profil");
}


export async function seDeconnecter() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  // Même en cas d'erreur réseau, on redirige : le cookie de session est
  // effacé localement par Supabase SSR. L'erreur est loggée pour investigation.
  if (error) {
    console.error("[auth] signOut error:", error.message);
  }

  redirect("/connexion");
}
