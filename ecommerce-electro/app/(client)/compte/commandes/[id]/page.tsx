export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Package } from "lucide-react";
import { formatDateLong, formatPrix } from "@/lib/utils";
import { ORDER_BADGE, ORDER_LABEL } from "@/lib/constants/statuts";
import { DELIVERY_BADGE, DELIVERY_LABEL } from "@/lib/constants/statuts";
import type { OrderStatus, DeliveryStatus } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_image: string | null;
};

type Delivery = {
  id: string;
  status: DeliveryStatus;
  scheduled_date: string | null;
  delivered_at: string | null;
  notes: string | null;
};

type OrderDetail = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  subtotal: number | null;
  tax: number | null;
  shipping: number | null;
  stripe_payment_id: string | null;
  created_at: string;
  order_items: OrderItem[];
  deliveries: Delivery[];
};

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), deliveries(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const o = order as unknown as OrderDetail;
  const delivery = o.deliveries?.[0] ?? null;

  const subtotal = o.subtotal ?? o.order_items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto py-10 px-4">
        {/* Fil d'Ariane */}
        <Link
          href="/compte/commandes"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Mes commandes
        </Link>

        {/* En-tête */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Commande
            </p>
            <h1 className="text-2xl font-bold font-mono">
              #{o.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Passée le {formatDateLong(o.created_at, true)}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_BADGE[o.status]}`}
          >
            {ORDER_LABEL[o.status]}
          </span>
        </div>

        <div className="space-y-6">
          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package size={16} className="text-muted-foreground" />
                Articles commandés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {o.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="relative h-14 w-14 flex-shrink-0 rounded-md bg-secondary/40 overflow-hidden">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-contain p-1"
                          unoptimized={item.product_image.includes("placehold")}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qté : {item.quantity} × {formatPrix(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm shrink-0">
                      {formatPrix(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Récapitulatif montants */}
              <div className="px-6 py-4 bg-surface/50 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{formatPrix(subtotal)}</span>
                </div>
                {o.tax != null && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes (TPS + TVQ)</span>
                    <span>{formatPrix(o.tax)}</span>
                  </div>
                )}
                {o.shipping != null && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span>{o.shipping === 0 ? "Gratuite" : formatPrix(o.shipping)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total payé</span>
                  <span>{formatPrix(o.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Livraison */}
          {delivery && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${DELIVERY_BADGE[delivery.status]}`}
                  >
                    {DELIVERY_LABEL[delivery.status]}
                  </span>
                </div>
                {delivery.scheduled_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date prévue</span>
                    <span>{formatDateLong(delivery.scheduled_date)}</span>
                  </div>
                )}
                {delivery.delivered_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Livrée le</span>
                    <span>{formatDateLong(delivery.delivered_at, true)}</span>
                  </div>
                )}
                {delivery.notes && (
                  <p className="text-muted-foreground italic text-xs border-t pt-3">
                    {delivery.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/compte/sav/nouveau`}
              className="text-sm text-primary hover:underline"
            >
              Un problème avec cette commande ? Contacter le SAV
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
