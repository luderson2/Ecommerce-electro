export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, CreditCard, Truck, User, Package, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix, formatDateLong } from "@/lib/utils";
import { ORDER_BADGE, ORDER_LABEL, DELIVERY_BADGE, DELIVERY_LABEL } from "@/lib/constants/statuts";
import type { OrderStatus } from "@/types";
import StatutForm from "./StatutForm";

type CommandeDetail = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  subtotal: number | null;
  tax: number | null;
  shipping: number | null;
  stripe_payment_id: string | null;
  created_at: string;
  shipping_address_street: string | null;
  shipping_address_apartment: string | null;
  shipping_address_city: string | null;
  shipping_address_province: string | null;
  shipping_address_postal_code: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    products: {
      name: string;
      brand: string;
      slug: string;
      product_images: { url: string; sort_order: number }[];
    } | null;
  }[];
  deliveries: {
    id: string;
    status: string;
    scheduled_date: string | null;
    delivered_at: string | null;
    notes: string | null;
  }[];
};

export default async function AdminCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: commandeRaw } = await supabase
    .from("orders")
    .select(`
      id, user_id, status, total_amount, subtotal, tax, shipping, stripe_payment_id, created_at,
      shipping_address_street, shipping_address_apartment, shipping_address_city, shipping_address_province, shipping_address_postal_code,
      profiles(first_name, last_name, phone),
      order_items(id, quantity, unit_price, products(name, brand, slug, product_images(url, sort_order))),
      deliveries(id, status, scheduled_date, delivered_at, notes)
    `)
    .eq("id", id)
    .single();

  if (!commandeRaw) notFound();
  const commande = commandeRaw as unknown as CommandeDetail;

  const { data: emailData } = await supabase.rpc("get_user_email", { user_id: commande.user_id });
  const email = emailData as string | null;

  const sousTotal = commande.subtotal ?? commande.order_items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  const livraison = commande.deliveries[0] ?? null;

  return (
    <div className="w-full">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/commandes" className="hover:text-foreground transition-colors">
          Commandes
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium font-mono">
          #{commande.id.slice(0, 8).toUpperCase()}
        </span>
      </nav>

      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              Commande #{commande.id.slice(0, 8).toUpperCase()}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_BADGE[commande.status]}`}>
              {ORDER_LABEL[commande.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Passée le {formatDateLong(commande.created_at, true)}
          </p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
        {/* ── Colonne principale ── */}
        <div className="space-y-6 min-w-0">

          {/* Articles commandés */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Package size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">
                Articles ({commande.order_items.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {commande.order_items.map((item) => {
                const images = [...(item.products?.product_images ?? [])].sort(
                  (a, b) => a.sort_order - b.sort_order
                );
                const imageUrl = images[0]?.url ?? null;
                const subtotal = item.unit_price * item.quantity;
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-14 h-14 rounded-md bg-surface border border-border overflow-hidden shrink-0">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.products?.name ?? ""}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full p-1"
                          unoptimized={imageUrl.includes("placehold.co")}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.products?.name ?? "Produit supprimé"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.products?.brand} · {item.quantity} × {formatPrix(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground tabular-nums text-sm shrink-0">
                      {formatPrix(subtotal)}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* Récapitulatif totaux */}
            <div className="border-t border-border px-5 py-4 space-y-2 bg-surface/50">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sous-total</span>
                <span className="tabular-nums">{formatPrix(sousTotal)}</span>
              </div>
              {commande.tax != null && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxes (TPS + TVQ)</span>
                  <span className="tabular-nums">{formatPrix(commande.tax)}</span>
                </div>
              )}
              {commande.shipping != null && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Livraison</span>
                  <span className={commande.shipping === 0 ? "text-green-600 font-medium" : "tabular-nums"}>
                    {commande.shipping === 0 ? "Gratuite" : formatPrix(commande.shipping)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                <span>Total</span>
                <span className="tabular-nums">{formatPrix(commande.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Livraison */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Truck size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Livraison</h2>
            </div>
            {livraison ? (
              <div className="px-5 py-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${DELIVERY_BADGE[livraison.status as keyof typeof DELIVERY_BADGE] ?? "bg-gray-100 text-gray-700"}`}>
                    {DELIVERY_LABEL[livraison.status as keyof typeof DELIVERY_LABEL] ?? livraison.status}
                  </span>
                </div>
                {livraison.scheduled_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date prévue</span>
                    <span className="font-medium text-foreground">
                      {formatDateLong(livraison.scheduled_date)}
                    </span>
                  </div>
                )}
                {livraison.delivered_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livré le</span>
                    <span className="font-medium text-foreground">
                      {formatDateLong(livraison.delivered_at, true)}
                    </span>
                  </div>
                )}
                {commande.shipping_address_street && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Adresse</span>
                    <span className="font-medium text-foreground text-right">
                      {[
                        commande.shipping_address_street,
                        commande.shipping_address_apartment,
                        commande.shipping_address_city,
                        commande.shipping_address_province,
                        commande.shipping_address_postal_code,
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {livraison.notes && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Notes du livreur
                    </p>
                    <p className="text-foreground bg-surface rounded-md px-3 py-2 text-sm">
                      {livraison.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                Aucune livraison associée à cette commande.
              </div>
            )}
          </div>

        </div>

        {/* ── Colonne latérale ── */}
        <div className="space-y-6">

          {/* Changer le statut */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">Statut de la commande</h2>
            </div>
            <div className="px-5 py-4">
              <StatutForm commandeId={commande.id} statutActuel={commande.status} />
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
                  {[commande.profiles?.first_name, commande.profiles?.last_name].filter(Boolean).join(" ") || "—"}
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
                  {commande.profiles?.phone ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Adresse de livraison</p>
                <p className="font-medium text-foreground">
                  {commande.shipping_address_street
                    ? [
                        commande.shipping_address_street,
                        commande.shipping_address_apartment,
                        commande.shipping_address_city,
                        commande.shipping_address_province,
                        commande.shipping_address_postal_code,
                      ].filter(Boolean).join(', ')
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Paiement Stripe */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <CreditCard size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Paiement</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Montant facturé</p>
                <p className="font-bold text-foreground text-lg tabular-nums">
                  {formatPrix(commande.total_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Référence Stripe</p>
                {commande.stripe_payment_id ? (
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-foreground break-all bg-surface px-2 py-1.5 rounded border border-border">
                      {commande.stripe_payment_id}
                    </p>
                    <a
                      href={`https://dashboard.stripe.com/payments/${commande.stripe_payment_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      Voir sur Stripe
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Non disponible</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
