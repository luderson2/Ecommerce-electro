import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type CommandeLigne = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  profiles: { full_name: string } | null;
  order_items: {
    id: string;
    products: {
      product_images: { url: string; sort_order: number }[];
    } | null;
  }[];
};

const STATUTS: { value: OrderStatus | "tous"; label: string }[] = [
  { value: "tous", label: "Toutes" },
  { value: "en_attente", label: "En attente" },
  { value: "payee", label: "Payée" },
  { value: "en_preparation", label: "En préparation" },
  { value: "livraison", label: "En livraison" },
  { value: "livree", label: "Livrée" },
  { value: "annulee", label: "Annulée" },
];

const BADGE: Record<OrderStatus, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  payee: "bg-blue-100 text-blue-800",
  en_preparation: "bg-purple-100 text-purple-800",
  livraison: "bg-orange-100 text-orange-800",
  livree: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

const LABEL: Record<OrderStatus, string> = {
  en_attente: "En attente",
  payee: "Payée",
  en_preparation: "En préparation",
  livraison: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtreStatut = statut && statut !== "tous" ? statut : null;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(`
      id, status, total_amount, created_at,
      profiles(full_name),
      order_items(id, products(product_images(url, sort_order)))
    `)
    .order("created_at", { ascending: false });

  if (filtreStatut) {
    query = query.eq("status", filtreStatut);
  }

  const { data: commandes, error } = await query as unknown as {
    data: CommandeLigne[] | null;
    error: { message: string } | null;
  };

  const statutActif = statut ?? "tous";

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {commandes?.length ?? 0} commande{(commandes?.length ?? 0) !== 1 ? "s" : ""}
          {filtreStatut ? ` · filtrées par "${LABEL[filtreStatut as OrderStatus]}"` : " au total"}
        </p>
      </div>

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUTS.map((s) => (
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
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
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
                const client = commande.profiles?.full_name ?? "Client inconnu";
                const premierItem = commande.order_items?.[0];
                const images = [...(premierItem?.products?.product_images ?? [])].sort(
                  (a, b) => a.sort_order - b.sort_order
                );
                const imageUrl = images[0]?.url ?? null;

                return (
                  <tr key={commande.id} className="hover:bg-surface/60 transition-colors">
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
                      <Link href={`/admin/commandes/${commande.id}`} className="flex items-center px-4 py-3 text-muted-foreground">
                        {formatDate(commande.created_at)}
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE[commande.status]}`}>
                          {LABEL[commande.status]}
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
