export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, User, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix, formatDateLong } from "@/lib/utils";
import { DELIVERY_BADGE, DELIVERY_LABEL } from "@/lib/constants/statuts";
import type { DeliveryStatus } from "@/types";
import StatutLivraisonForm from "./StatutLivraisonForm";

type LivraisonDetail = {
  id: string;
  status: DeliveryStatus;
  scheduled_date: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  orders: {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
      address_street: string | null;
      address_city: string | null;
      address_province: string | null;
      address_postal_code: string | null;
    } | null;
  } | null;
};

export default async function AdminLivraisonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: livraisonRaw } = await supabase
    .from("deliveries")
    .select(`
      id, status, scheduled_date, delivered_at, notes, created_at,
      orders(id, user_id, total_amount, status, profiles(first_name, last_name, phone, address_street, address_city, address_province, address_postal_code))
    `)
    .eq("id", id)
    .single();

  if (!livraisonRaw) notFound();
  const livraison = livraisonRaw as unknown as LivraisonDetail;

  const userId = livraison.orders?.user_id;
  const email = userId
    ? ((await supabase.rpc("get_user_email", { user_id: userId })).data as string | null)
    : null;

  return (
    <div className="w-full">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/livraisons" className="hover:text-foreground transition-colors">
          Livraisons
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium font-mono">
          {livraison.orders ? `#${livraison.orders.id.slice(0, 8).toUpperCase()}` : livraison.id.slice(0, 8).toUpperCase()}
        </span>
      </nav>

      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              Livraison - commande{" "}
              {livraison.orders
                ? `#${livraison.orders.id.slice(0, 8).toUpperCase()}`
                : "inconnue"}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${DELIVERY_BADGE[livraison.status]}`}>
              {DELIVERY_LABEL[livraison.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Créée le {formatDateLong(livraison.created_at, true)}
          </p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* â”€â”€ Colonne principale â”€â”€ */}
        <div className="space-y-6 min-w-0">

          {/* Détails livraison */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Truck size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Détails</h2>
            </div>
            <div className="px-5 py-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Date prévue</p>
                  <p className="font-medium text-foreground">
                    {livraison.scheduled_date
                      ? formatDateLong(livraison.scheduled_date)
                      : <span className="italic text-muted-foreground">Non planifiée</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Livrée le</p>
                  <p className="font-medium text-foreground">
                    {livraison.delivered_at
                      ? formatDateLong(livraison.delivered_at, true)
                      : <span className="italic text-muted-foreground">-</span>}
                  </p>
                </div>
              </div>
              {livraison.orders?.profiles?.address_street && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Adresse de livraison</p>
                  <p className="font-medium text-foreground">
                    {[livraison.orders.profiles.address_street, livraison.orders.profiles.address_city, livraison.orders.profiles.address_province, livraison.orders.profiles.address_postal_code].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {livraison.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes du livreur</p>
                  <p className="bg-surface rounded-md px-3 py-2 text-foreground whitespace-pre-wrap">
                    {livraison.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Commande liée */}
          {livraison.orders && (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <ShoppingCart size={16} className="text-muted-foreground" />
                <h2 className="font-semibold text-foreground text-sm">Commande liée</h2>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <Link
                  href={`/admin/commandes/${livraison.orders.id}`}
                  className="font-mono text-sm font-semibold text-primary hover:underline"
                >
                  #{livraison.orders.id.slice(0, 8).toUpperCase()}
                </Link>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatPrix(livraison.orders.total_amount)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* â”€â”€ Colonne latérale â”€â”€ */}
        <div className="space-y-6">

          {/* Modifier la livraison */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">Modifier la livraison</h2>
            </div>
            <div className="px-5 py-4">
              <StatutLivraisonForm
                livraisonId={livraison.id}
                statutActuel={livraison.status}
                scheduledDate={livraison.scheduled_date}
                notes={livraison.notes}
              />
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
                  {[livraison.orders?.profiles?.first_name, livraison.orders?.profiles?.last_name].filter(Boolean).join(" ") || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Courriel</p>
                {email ? (
                  <a href={`mailto:${email}`} className="font-medium text-primary hover:underline break-all">
                    {email}
                  </a>
                ) : (
                  <p className="text-muted-foreground italic">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                <p className="font-medium text-foreground">
                  {livraison.orders?.profiles?.phone ?? "-"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
