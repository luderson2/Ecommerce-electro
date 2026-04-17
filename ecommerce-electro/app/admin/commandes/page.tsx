export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Package, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix, formatDate } from "@/lib/utils";
import { ORDER_STATUTS, ORDER_BADGE, ORDER_LABEL } from "@/lib/constants/statuts";
import type { OrderStatus } from "@/types";

type CommandeLigne = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
  order_items: {
    id: string;
    products: {
      product_images: { url: string; sort_order: number }[];
    } | null;
  }[];
};

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; user_id?: string }>;
}) {
  const { statut, user_id } = await searchParams;
  const filtreStatut = statut && statut !== "tous" ? statut : null;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(`
      id, status, total_amount, created_at,
      profiles(first_name, last_name),
      order_items(id, products(product_images(url, sort_order)))
    `)
    .order("created_at", { ascending: false });

  if (filtreStatut) {
    query = query.eq("status", filtreStatut as OrderStatus);
  }

  if (user_id) {
    query = query.eq("user_id", user_id);
  }

  const { data: commandes, error } = await query.returns<CommandeLigne[]>();

  const statutActif = statut ?? "tous";

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {commandes?.length ?? 0} commande{(commandes?.length ?? 0) !== 1 ? "s" : ""}
          {filtreStatut ? ` · filtrées par "${ORDER_LABEL[filtreStatut as OrderStatus]}"` : " au total"}
        </p>
      </div>

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ORDER_STATUTS.map((s) => (
          <Link
            key={s.value}
            href={s.value === "tous" ? "/admin/commandes" : `/admin/commandes?statut=${s.value}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statutActif === s.value
                ? "bg-primary text-white"
                : "bg-surface text-muted-foreground hover:bg-border"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          Erreur lors du chargement des commandes : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="w-16 px-4 py-3" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                # Commande
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Client
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Articles
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(commandes ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground text-sm">
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              (commandes ?? []).map((commande) => {
                const nbArticles = commande.order_items?.length ?? 0;
                const client = [commande.profiles?.first_name, commande.profiles?.last_name].filter(Boolean).join(" ") || "Client inconnu";
                const premierItem = commande.order_items?.[0];
                const images = [...(premierItem?.products?.product_images ?? [])].sort(
                  (a, b) => a.sort_order - b.sort_order
                );
                const imageUrl = images[0]?.url ?? null;

                const joursAttente = Math.floor((Date.now() - new Date(commande.created_at).getTime()) / 86_400_000);
                const urgent = commande.status === "en_attente" && joursAttente >= 2;

                return (
                  <tr key={commande.id} className={`hover:bg-surface/60 transition-colors ${urgent ? "bg-orange-50/60" : ""}`}>
                    {/* Miniature */}
                    <td className="p-0 w-16">
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center justify-center px-3 py-2 h-full">
                        <div className="w-10 h-10 rounded-md bg-surface border border-border overflow-hidden shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt=""
                              width={40}
                              height={40}
                              className="object-contain w-full h-full p-0.5"
                              unoptimized={imageUrl.includes("placehold.co")}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package size={14} />
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    {/* # Commande */}
                    <td className="p-0">
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        #{commande.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    {/* Client */}
                    <td className="p-0">
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center px-4 py-3 font-medium text-foreground">
                        {client}
                      </Link>
                    </td>
                    {/* Date */}
                    <td className="p-0">
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center gap-1.5 px-4 py-3 text-muted-foreground">
                        {urgent && <AlertCircle size={13} className="text-orange-500 shrink-0" />}
                        <span className={urgent ? "text-orange-700 font-medium" : ""}>{formatDate(commande.created_at)}</span>
                        {urgent && <span className="text-xs text-orange-500">({joursAttente}j)</span>}
                      </Link>
                    </td>
                    {/* Articles */}
                    <td className="p-0">
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center px-4 py-3 text-muted-foreground">
                        {nbArticles} article{nbArticles !== 1 ? "s" : ""}
                      </Link>
                    </td>
                    {/* Total */}
                    <td className="p-0">
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center px-4 py-3 font-semibold text-foreground tabular-nums">
                        {formatPrix(commande.total_amount)}
                      </Link>
                    </td>
                    {/* Statut */}
                    <td className="p-0">
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_BADGE[commande.status]}`}>
                          {ORDER_LABEL[commande.status]}
                        </span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
