export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageSquare, User, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateLong } from "@/lib/utils";
import { SAV_BADGE, SAV_LABEL } from "@/lib/constants/statuts";
import type { SavStatus } from "@/types";
import StatutSavForm from "./StatutSavForm";

type DemandeDetail = {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  description: string;
  status: SavStatus;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address_street: string | null;
    address_city: string | null;
    address_province: string | null;
    address_postal_code: string | null;
  } | null;
};

export default async function AdminSavDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: demandeRaw } = await supabase
    .from("service_requests")
    .select("id, user_id, order_id, subject, description, status, created_at, profiles(first_name, last_name, phone, address_street, address_city, address_province, address_postal_code)")
    .eq("id", id)
    .single();

  if (!demandeRaw) notFound();
  const demande = demandeRaw as unknown as DemandeDetail;

  const { data: emailData } = await supabase.rpc("get_user_email", { user_id: demande.user_id });
  const email = emailData as string | null;

  return (
    <div className="w-full">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/sav" className="hover:text-foreground transition-colors">
          SAV
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium truncate max-w-[300px]">
          {demande.subject}
        </span>
      </nav>

      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">{demande.subject}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${SAV_BADGE[demande.status]}`}>
              {SAV_LABEL[demande.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Soumise le {formatDateLong(demande.created_at, true)}
          </p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* â”€â”€ Colonne principale â”€â”€ */}
        <div className="space-y-6 min-w-0">

          {/* Description */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <MessageSquare size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Description du problème</h2>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {demande.description}
              </p>
            </div>
          </div>

          {/* Commande liée */}
          {demande.order_id && (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <ShoppingCart size={16} className="text-muted-foreground" />
                <h2 className="font-semibold text-foreground text-sm">Commande liée</h2>
              </div>
              <div className="px-5 py-4">
                <Link
                  href={`/admin/commandes/${demande.order_id}`}
                  className="inline-flex items-center gap-2 text-sm font-mono font-semibold text-primary hover:underline"
                >
                  #{demande.order_id.slice(0, 8).toUpperCase()}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* â”€â”€ Colonne latérale â”€â”€ */}
        <div className="space-y-6">

          {/* Changer le statut */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">Statut de la demande</h2>
            </div>
            <div className="px-5 py-4">
              <StatutSavForm key={demande.status} demandeId={demande.id} statutActuel={demande.status} />
            </div>
          </div>

          {/* Informations client */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <User size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Client</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Nom complet</p>
                <p className="font-medium text-foreground">
                  {[demande.profiles?.first_name, demande.profiles?.last_name].filter(Boolean).join(" ") || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Courriel</p>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="font-medium text-primary hover:underline break-all"
                  >
                    {email}
                  </a>
                ) : (
                  <p className="text-muted-foreground italic">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                <p className="font-medium text-foreground">
                  {demande.profiles?.phone ?? "-"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
