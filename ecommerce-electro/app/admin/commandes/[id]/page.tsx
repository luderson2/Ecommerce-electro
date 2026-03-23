import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";
import StatutForm from "./StatutForm";
import type { OrderStatus, DeliveryStatus } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUTS_COMMANDE: Record<OrderStatus, { label: string; classe: string }> = {
  en_attente:     { label: "En attente",      classe: "bg-yellow-100 text-yellow-700" },
  payee:          { label: "Payée",           classe: "bg-blue-100 text-blue-700" },
  en_preparation: { label: "En préparation",  classe: "bg-orange-100 text-orange-700" },
  livraison:      { label: "En livraison",    classe: "bg-purple-100 text-purple-700" },
  livree:         { label: "Livrée",          classe: "bg-green-100 text-green-700" },
  annulee:        { label: "Annulée",         classe: "bg-red-100 text-red-700" },
};

const STATUTS_LIVRAISON: Record<DeliveryStatus, { label: string; classe: string }> = {
  planifiee:  { label: "Planifiée",    classe: "bg-blue-100 text-blue-700" },
  en_transit: { label: "En transit",   classe: "bg-purple-100 text-purple-700" },
  livree:     { label: "Livrée",       classe: "bg-green-100 text-green-700" },
  echec:      { label: "Échec",        classe: "bg-red-100 text-red-700" },
};

function formatDate(iso: string, avecHeure = false) {
  return new Intl.DateTimeFormat("fr-CA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(avecHeure ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

// ─── Types ───────────────────────────────────────────────────────────────────

type CommandeDetail = {
  id: string;
  status: string;
  total_amount: number;
  stripe_payment_id: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    products: { name: string; slug: string; brand: string } | null;
  }[];
  deliveries: {
    id: string;
    status: string;
    scheduled_date: string | null;
    delivered_at: string | null;
    notes: string | null;
  }[];
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, status, total_amount, stripe_payment_id, created_at,
      profiles(full_name, phone, address),
      order_items(id, quantity, unit_price, products(name, slug, brand)),
      deliveries(id, status, scheduled_date, delivered_at, notes)
    `)
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const commande = data as unknown as CommandeDetail;
  const badge = STATUTS_COMMANDE[commande.status as OrderStatus] ?? {
    label: commande.status,
    classe: "bg-gray-100 text-gray-600",
  };
  const livraison = commande.deliveries?.[0] ?? null;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Retour aux commandes
          </Link>
          <h1 className="text-2xl font-bold text-foreground font-mono">
            #{commande.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Passée le {formatDate(commande.created_at, true)}
          </p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold mt-6 ${badge.classe}`}>
          {badge.label}
        </span>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne gauche : articles ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Articles */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Package size={16} className="text-muted" />
              <h2 className="text-sm font-semibold text-foreground">
                Articles ({commande.order_items.length})
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-16">
                    Qté
                  </th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-28">
                    Prix unit.
                  </th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider w-28">
                    Sous-total
                  </th>
                </tr>
              </thead>
              <tbody>
                {commande.order_items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      {item.products ? (
                        <>
                          <p className="font-medium text-foreground">{item.products.name}</p>
                          <p className="text-xs text-muted">{item.products.brand}</p>
                        </>
                      ) : (
                        <span className="text-muted italic">Produit supprimé</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-3 text-right text-foreground tabular-nums">
                      {formatPrix(item.unit_price)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground tabular-nums">
                      {formatPrix(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface border-t border-border">
                  <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-foreground text-right">
                    Total
                  </td>
                  <td className="px-5 py-3 text-right text-lg font-bold text-accent tabular-nums">
                    {formatPrix(commande.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Livraison */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Truck size={16} className="text-muted" />
              <h2 className="text-sm font-semibold text-foreground">Livraison</h2>
            </div>
            <div className="px-5 py-4">
              {livraison ? (
                <dl className="space-y-3">
                  <div className="flex justify-between items-center">
                    <dt className="text-sm text-muted">Statut</dt>
                    <dd>
                      {(() => {
                        const b = STATUTS_LIVRAISON[livraison.status as DeliveryStatus] ?? {
                          label: livraison.status,
                          classe: "bg-gray-100 text-gray-600",
                        };
                        return (
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${b.classe}`}>
                            {b.label}
                          </span>
                        );
                      })()}
                    </dd>
                  </div>
                  {livraison.scheduled_date && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted">Date prévue</dt>
                      <dd className="text-sm font-medium text-foreground">
                        {formatDate(livraison.scheduled_date)}
                      </dd>
                    </div>
                  )}
                  {livraison.delivered_at && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted">Livrée le</dt>
                      <dd className="text-sm font-medium text-foreground">
                        {formatDate(livraison.delivered_at, true)}
                      </dd>
                    </div>
                  )}
                  {livraison.notes && (
                    <div className="pt-2 border-t border-border">
                      <dt className="text-xs text-muted mb-1">Notes</dt>
                      <dd className="text-sm text-foreground">{livraison.notes}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-muted">Aucune livraison planifiée pour cette commande.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Colonne droite : actions + client ── */}
        <div className="space-y-6">

          {/* Changer statut */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Changer le statut</h2>
            </div>
            <div className="px-5 py-4">
              <StatutForm commandeId={commande.id} statutActuel={commande.status} />
            </div>
          </div>

          {/* Client */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <User size={16} className="text-muted" />
              <h2 className="text-sm font-semibold text-foreground">Client</h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {commande.profiles?.full_name ?? "—"}
              </p>
              {commande.profiles?.phone && (
                <p className="text-sm text-muted">{commande.profiles.phone}</p>
              )}
              {commande.profiles?.address && (
                <p className="text-sm text-muted">{commande.profiles.address}</p>
              )}
            </div>
          </div>

          {/* Paiement */}
          {commande.stripe_payment_id && (
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Paiement Stripe</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-mono text-muted break-all">
                  {commande.stripe_payment_id}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
