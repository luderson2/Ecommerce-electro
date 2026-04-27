"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { SAV_LABEL } from "@/lib/constants/statuts";
import type { SavStatus } from "@/types";
import { verifierAdmin } from "./_guard";

const STATUTS_VALIDES: SavStatus[] = ["ouvert", "en_cours", "resolu", "ferme"];

export async function changerStatutSAV(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const { supabase, erreur } = await verifierAdmin();
  if (!supabase) return { error: erreur };

  const id = formData.get("id") as string;
  const statut = formData.get("statut") as SavStatus;

  if (!id || !STATUTS_VALIDES.includes(statut)) {
    return { error: "Données invalides." };
  }

  const { data: demandeActuelle, error: loadError } = await supabase
    .from("service_requests")
    .select("id, user_id, subject, status")
    .eq("id", id)
    .single();

  if (loadError || !demandeActuelle) {
    return { error: "Demande introuvable." };
  }

  const ancienStatut = demandeActuelle.status;

  const { error } = await supabase
    .from("service_requests")
    .update({ status: statut })
    .eq("id", id)
    .select("id")
    .single();

  if (error) return { error: "Mise à jour impossible. Vérifiez vos permissions." };

  if (ancienStatut !== statut) {
    const { data: emailData } = await supabase.rpc("get_user_email", {
      user_id: demandeActuelle.user_id,
    });
    const email = emailData as string | null;

    if (email && process.env.RESEND_API_KEY) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const lien = `${siteUrl}/compte/sav/${id}`;
      const resend = new Resend(process.env.RESEND_API_KEY);
      const subjectEscaped = demandeActuelle.subject
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@electrometropolitain.ca",
        to: email,
        subject: `Mise à jour de votre demande SAV: ${SAV_LABEL[statut]}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
            <h2 style="margin-bottom:8px">Votre demande SAV a été mise à jour</h2>
            <p style="color:#555;margin-top:0">Le statut de votre demande a changé.</p>
            <blockquote style="border-left:3px solid #e5e7eb;margin:16px 0;padding:8px 16px;background:#f9fafb;border-radius:4px">
              <strong>${subjectEscaped}</strong><br />
              Nouveau statut: <strong>${SAV_LABEL[statut]}</strong>
            </blockquote>
            <p>Vous pouvez consulter le détail et suivre l'évolution depuis votre espace client.</p>
            <p>
              <a href="${lien}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
                Voir ma demande
              </a>
            </p>
            <p style="color:#888;font-size:13px;margin-top:24px">ÉlectroMétropolitain · Service après-vente</p>
          </div>
        `,
      }).catch((err) => {
        console.error("[sav status email] failed:", err);
      });
    }
  }

  revalidatePath(`/admin/sav/${id}`);
  revalidatePath("/admin/sav");
  return { success: true };
}

export async function soumettreDemandeSAV(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Vous devez être connecté." };

  const subject = (formData.get("subject") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const orderIdRaw = (formData.get("order_id") as string)?.trim();
  const orderId = orderIdRaw || null;

  if (!subject) return { error: "Le sujet est obligatoire." };
  if (!description || description.length < 10)
    return { error: "La description doit faire au moins 10 caractères." };

  // Vérifier que la commande appartient à l'utilisateur (IDOR protection)
  if (orderId) {
    const { data: orderCheck } = await supabase
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();
    if (!orderCheck) return { error: "Commande introuvable ou non autorisée." };
  }

  const { data: inserted, error } = await supabase
    .from("service_requests")
    .insert({
      user_id: user.id,
      subject,
      description,
      order_id: orderId,
      status: "ouvert" as SavStatus,
    })
    .select("id")
    .single();

  if (error) return { error: "Erreur lors de la soumission. Veuillez réessayer." };

  // Envoi email de confirmation au client
  if (user.email && inserted?.id) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const lien = `${siteUrl}/compte/sav/${inserted.id}`;
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Échapper les caractères HTML pour prévenir le XSS dans le template email
    const subjectEscaped = subject
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@electrometropolitain.ca",
      to: user.email,
      subject: "Votre demande SAV a bien été reçue",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
          <h2 style="margin-bottom:8px">Demande SAV reçue</h2>
          <p style="color:#555;margin-top:0">Nous avons bien reçu votre demande concernant :</p>
          <blockquote style="border-left:3px solid #e5e7eb;margin:16px 0;padding:8px 16px;background:#f9fafb;border-radius:4px">
            <strong>${subjectEscaped}</strong>
          </blockquote>
          <p>Notre équipe prendra en charge votre demande dans les plus brefs délais.</p>
          <p>
            <a href="${lien}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
              Suivre ma demande
            </a>
          </p>
          <p style="color:#888;font-size:13px;margin-top:24px">ÉlectroMétropolitain · Service après-vente</p>
        </div>
      `,
    }).catch((err) => {
      console.error("[sav confirmation email] failed:", err);
    });
  }

  revalidatePath("/compte/sav");
  redirect("/compte/sav");
}
