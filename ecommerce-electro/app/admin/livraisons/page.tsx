export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryStatus } from "@/types";

type LivraisonLigne = {
  id: string;
  status: DeliveryStatus;
  scheduled_date: string | null;
  delivered_at: string | null;
  created_at: string;
  orders: {
    id: string;
    total_amount: number;
    profiles: { full_name: string } | null;
  } | null;
};

const STATUTS: { value: DeliveryStatus | "tous"; label: string }[] = [
  { value: "tous",      label: "Toutes" },
  { value: "planifiee", label: "Planifiées" },
  { value: "en_transit", label: "En transit" },
  { value: "livree",    label: "Livrées" },
  { value: "echec",     label: "Échec" },
];

const BADGE: Record<DeliveryStatus, string> = {
  planifiee:  "bg-blue-100 text-blue-800",
  en_transit: "bg-orange-100 text-orange-800",
  livree:     "bg-green-100 text-green-800",
  echec:      "bg-red-100 text-red-800",
};

const LABEL: Record<DeliveryStatus, string> = {
  planifiee:  "Planifiée",
  en_transit: "En transit",
  livree:     "Livrée",
  echec:      "Échec",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminLivraisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtreStatut = statut && statut !== "tous" ? (statut as DeliveryStatus) : null;

  const supabase = await createClient();

  let query = supabase
    .from("deliveries")
    .select("id, status, scheduled_date, delivered_at, created_at, orders(id, total_amount, profiles(full_name))")
    .order("created_at", { ascending: false });

  if (filtreStatut) {
    query = query.eq("status", filtreStatut);
  }

  const { data: livraisons, error } = await query as unknown as {
    data: LivraisonLigne[] | null;
    error: { message: string } | null;
  };

  const statutActif = statut ?? "tous";

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Livraisons</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {livraisons?.length ?? 0} livraison{(livraisons?.length ?? 0) !== 1 ? "s" : ""}
          {filtreStatut ? ` · filtrées par "${LABEL[filtreStatut]}"` : " au total"}
        </p>
      </div>

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUTS.map((s) => (
          <Link
            key={s.value}
            href={s.value === "tous" ? "/admin/livraisons" : `/admin/livraisons?statut=${s.value}`}
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
          Erreur lors du chargement des livraisons : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Commande
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Client
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date prévue
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Livrée le
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(livraisons ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  Aucune livraison trouvée.
                </td>
              </tr>
            ) : (
              (livraisons ?? []).map((livraison) => (
                <tr key={livraison.id} className="hover:bg-surface/60 transition-colors">
                  {/* Commande */}
                  <td className="p-0">
                    <Link href={`/admin/livraisons/${livraison.id}`} className="flex items-center px-5 py-3">
                      {livraison.orders ? (
                        <span className="font-mono text-xs font-semibold text-primary">
                          #{livraison.orders.id.slice(0, 8).toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">—</span>
                      )}
                    </Link>
                  </td>

                  {/* Client */}
                  <td className="p-0">
                    <Link href={`/admin/livraisons/${livraison.id}`} className="flex items-center px-5 py-3 text-muted-foreground">
                      {livraison.orders?.profiles?.full_name ?? <span className="italic">Inconnu</span>}
                    </Link>
                  </td>

                  {/* Date prévue */}
                  <td className="p-0">
                    <Link href={`/admin/livraisons/${livraison.id}`} className="flex items-center px-5 py-3 text-muted-foreground">
                      {livraison.scheduled_date
                        ? formatDate(livraison.scheduled_date)
                        : <span className="italic">Non planifiée</span>}
                    </Link>
                  </td>

                  {/* Livrée le */}
                  <td className="p-0">
                    <Link href={`/admin/livraisons/${livraison.id}`} className="flex items-center px-5 py-3 text-muted-foreground">
                      {livraison.delivered_at
                        ? formatDate(livraison.delivered_at)
                        : <span className="italic">—</span>}
                    </Link>
                  </td>

                  {/* Statut */}
                  <td className="p-0">
                    <Link href={`/admin/livraisons/${livraison.id}`} className="flex items-center px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE[livraison.status]}`}>
                        {LABEL[livraison.status]}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
