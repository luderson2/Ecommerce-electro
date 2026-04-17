export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight } from "lucide-react";
import { formatDate, formatPrix } from "@/lib/utils";
import { ORDER_BADGE, ORDER_LABEL } from "@/lib/constants/statuts";
import type { OrderStatus } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type OrderLigne = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items: {
    id: string;
    product_name: string | null;
    product_image: string | null;
    quantity: number;
  }[];
};

export default async function CommandesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?redirect=/compte/commandes");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at, order_items(id, product_name, product_image, quantity)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<OrderLigne[]>();

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Mes commandes</h1>

        {(orders ?? []).length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore passé de commande.</p>
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Magasiner
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(orders ?? []).map((order) => (
              <Link
                key={order.id}
                href={`/compte/commandes/${order.id}`}
                className="block border rounded-xl bg-white hover:bg-secondary/30 transition-colors group"
              >
                {/* En-tête */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div>
                    <p className="font-mono font-semibold text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_BADGE[order.status]}`}
                    >
                      {ORDER_LABEL[order.status]}
                    </span>
                    <span className="font-bold text-sm">{formatPrix(order.total_amount)}</span>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Articles */}
                <div className="px-6 py-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.order_items.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.id}
                        className="h-10 w-10 rounded-full border-2 border-white bg-secondary/40 overflow-hidden"
                      >
                        <Image
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name ?? ""}
                          width={40}
                          height={40}
                          className="object-contain p-0.5"
                        />
                      </div>
                    ))}
                    {order.order_items.length > 4 && (
                      <div className="h-10 w-10 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                        +{order.order_items.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.order_items.length} article{order.order_items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
