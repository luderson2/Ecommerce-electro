"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { redirect } from "next/navigation";

export async function seConnecter(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Veuillez remplir tous les champs." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Courriel ou mot de passe incorrect." };
  }

  revalidatePath("/", "layout");
  redirect("/compte/profil");
}


export async function sInscrire(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  if (!email || !password || !firstName || !lastName) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/compte`,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/compte/profil");
}



export async function seDeconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
