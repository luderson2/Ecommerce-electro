import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageSquare, User, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { SavStatus } from "@/types";
import StatutSavForm from "./StatutSavForm";

const BADGE: Record<SavStatus, string> = {
  ouvert:   "bg-yellow-100 text-yellow-800",
  en_cours: "bg-blue-100 text-blue-800",
  resolu:   "bg-green-100 text-green-800",
  ferme:    "bg-gray-100 text-gray-600",
};

const LABEL: Record<SavStatus, string> = {
  ouvert:   "Ouvert",
  en_cours: "En cours",
  resolu:   "Résolu",
  ferme:    "Fermé",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DemandeDetail = {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  description: string;
  status: SavStatus;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string | null;
    address: string | null;
  } | null;
};

export default async function AdminSavDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: demande } = (await supabase
    .from("service_requests")
    .select("id, user_id, order_id, subject, description, status, created_at, profiles(full_name, phone, address)")
    .eq("id", id)
    .single()) as unknown as { data: DemandeDetail | null };

  if (!demande) notFound();

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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE[demande.status]}`}>
              {LABEL[demande.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Soumise le {formatDate(demande.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* ── Colonne principale ── */}
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

        {/* ── Colonne latérale ── */}
        <div className="space-y-6">

          {/* Changer le statut */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">Statut de la demande</h2>
            </div>
            <div className="px-5 py-4">
              <StatutSavForm demandeId={demande.id} statutActuel={demande.status} />
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
                  {demande.profiles?.full_name ?? "—"}
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
                  <p className="text-muted-foreground italic">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                <p className="font-medium text-foreground">
                  {demande.profiles?.phone ?? "—"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
