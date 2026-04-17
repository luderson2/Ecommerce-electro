export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { SAV_STATUTS, SAV_BADGE, SAV_LABEL } from "@/lib/constants/statuts";
import type { SavStatus } from "@/types";

type DemandeLigne = {
  id: string;
  subject: string;
  status: SavStatus;
  created_at: string;
  order_id: string | null;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

export default async function AdminSavPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtreStatut = statut && statut !== "tous" ? (statut as SavStatus) : null;

  const supabase = await createClient();

  let query = supabase
    .from("service_requests")
    .select("id, subject, status, created_at, order_id, profiles(first_name, last_name)")
    .order("created_at", { ascending: false });

  if (filtreStatut) {
    query = query.eq("status", filtreStatut);
  }

  const { data: demandes, error } = await query.returns<DemandeLigne[]>();

  const statutActif = statut ?? "tous";

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Service après-vente</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {demandes?.length ?? 0} demande{(demandes?.length ?? 0) !== 1 ? "s" : ""}
          {filtreStatut ? ` · filtrées par "${SAV_LABEL[filtreStatut]}"` : " au total"}
        </p>
      </div>

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SAV_STATUTS.map((s) => (
          <Link
            key={s.value}
            href={s.value === "tous" ? "/admin/sav" : `/admin/sav?statut=${s.value}`}
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
          Erreur lors du chargement des demandes : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sujet
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Client
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Commande
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(demandes ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  Aucune demande trouvée.
                </td>
              </tr>
            ) : (
              (demandes ?? []).map((demande) => (
                <tr key={demande.id} className="hover:bg-surface/60 transition-colors">
                  {/* Sujet */}
                  <td className="p-0">
                    <Link
                      href={`/admin/sav/${demande.id}`}
                      className="flex items-center px-5 py-3 font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span className="truncate max-w-[260px]">{demande.subject}</span>
                    </Link>
                  </td>

                  {/* Client */}
                  <td className="p-0">
                    <Link href={`/admin/sav/${demande.id}`} className="flex items-center px-5 py-3 text-muted-foreground">
                      {[demande.profiles?.first_name, demande.profiles?.last_name].filter(Boolean).join(" ") || <span className="italic">Inconnu</span>}
                    </Link>
                  </td>

                  {/* Commande liée */}
                  <td className="p-0">
                    <Link href={`/admin/sav/${demande.id}`} className="flex items-center px-5 py-3">
                      {demande.order_id ? (
                        <span className="font-mono text-xs font-semibold text-primary">
                          #{demande.order_id.slice(0, 8).toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">—</span>
                      )}
                    </Link>
                  </td>

                  {/* Date */}
                  <td className="p-0">
                    <Link href={`/admin/sav/${demande.id}`} className="flex items-center px-5 py-3 text-muted-foreground">
                      {formatDate(demande.created_at)}
                    </Link>
                  </td>

                  {/* Statut */}
                  <td className="p-0">
                    <Link href={`/admin/sav/${demande.id}`} className="flex items-center px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${SAV_BADGE[demande.status]}`}>
                        {SAV_LABEL[demande.status]}
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
