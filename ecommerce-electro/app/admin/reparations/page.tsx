export const dynamic = "force-dynamic";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import {
  REPARATION_BADGE,
  REPARATION_LABEL,
  REPARATION_STATUTS,
} from "@/lib/constants/statuts";
import type { ReparationStatus } from "@/types";

type DemandeReparationLigne = {
  id: string;
  nom: string;
  telephone: string;
  appareil: string;
  statut: ReparationStatus;
  created_at: string;
};

export default async function AdminReparationsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtreStatut =
    statut && statut !== "tous" ? (statut as ReparationStatus) : null;
  const supabase = createAdminClient();

  let query = supabase
    .from("demandes_reparation")
    .select("id, nom, telephone, appareil, statut, created_at")
    .order("created_at", { ascending: false });

  if (filtreStatut) {
    query = query.eq("statut", filtreStatut);
  }

  const { data: demandes, error } = await query.returns<DemandeReparationLigne[]>();
  const statutActif = statut ?? "tous";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Réparations</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {demandes?.length ?? 0} demande{(demandes?.length ?? 0) !== 1 ? "s" : ""}
          {filtreStatut
            ? ` · filtrées par "${REPARATION_LABEL[filtreStatut]}"`
            : " au total"}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {REPARATION_STATUTS.map((s) => (
          <Link
            key={s.value}
            href={
              s.value === "tous"
                ? "/admin/reparations"
                : `/admin/reparations?statut=${s.value}`
            }
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              statutActif === s.value
                ? "bg-primary text-white"
                : "bg-surface text-muted-foreground hover:bg-border"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur lors du chargement des demandes : {error.message}
        </div>
      )}

      <div className="overflow-hidden overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nom
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Téléphone
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Appareil
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(demandes ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-muted-foreground">
                  Aucune demande trouvée.
                </td>
              </tr>
            ) : (
              (demandes ?? []).map((demande) => (
                <tr key={demande.id} className="transition-colors hover:bg-surface/60">
                  <td className="p-0">
                    <Link
                      href={`/admin/reparations/${demande.id}`}
                      className="flex px-5 py-3 text-muted-foreground"
                    >
                      {formatDate(demande.created_at)}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link
                      href={`/admin/reparations/${demande.id}`}
                      className="flex px-5 py-3 font-medium text-foreground hover:text-primary"
                    >
                      {demande.nom}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link
                      href={`/admin/reparations/${demande.id}`}
                      className="flex px-5 py-3 text-muted-foreground"
                    >
                      {demande.telephone}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link
                      href={`/admin/reparations/${demande.id}`}
                      className="flex px-5 py-3 text-muted-foreground"
                    >
                      <span className="max-w-[260px] truncate">{demande.appareil}</span>
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={`/admin/reparations/${demande.id}`} className="flex px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${REPARATION_BADGE[demande.statut]}`}
                      >
                        {REPARATION_LABEL[demande.statut]}
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
