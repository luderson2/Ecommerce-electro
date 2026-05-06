export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SupprimerRabaisButton from "./SupprimerRabaisButton";

type RabaisLigne = {
  id: string;
  discount_type: string;
  value: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  product_id: string | null;
  pack_id: string | null;
  products: { name: string } | null;
  packs: { name: string } | null;
};

type StatutRabais = "actif" | "inactif" | "expire";

function getStatut(r: RabaisLigne): StatutRabais {
  if (r.ends_at && new Date(r.ends_at) < new Date()) return "expire";
  if (!r.is_active) return "inactif";
  return "actif";
}

const FILTRES = [
  { value: "tous",    label: "Tous" },
  { value: "actif",   label: "Actifs" },
  { value: "inactif", label: "Inactifs" },
  { value: "expire",  label: "Expirés" },
] as const;

const BADGE_STATUT: Record<StatutRabais, string> = {
  actif:   "bg-green-100 text-green-700",
  inactif: "bg-gray-100 text-gray-600",
  expire:  "bg-red-100 text-red-700",
};

const LABEL_STATUT: Record<StatutRabais, string> = {
  actif:   "Actif",
  inactif: "Inactif",
  expire:  "Expiré",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminRabaisPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filtreStatut = statut && statut !== "tous" ? statut : null;

  const supabase = await createClient();

  const { data: tousLesRabais, error } = await supabase
    .from("discounts")
    .select("id, discount_type, value, starts_at, ends_at, is_active, product_id, pack_id, products(name), packs(name)")
    .order("created_at", { ascending: false })
    .returns<RabaisLigne[]>();

  const rabais = filtreStatut
    ? (tousLesRabais ?? []).filter((r) => getStatut(r) === filtreStatut)
    : (tousLesRabais ?? []);

  const filtreActif = statut ?? "tous";

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rabais</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rabais.length} rabais
            {filtreStatut ? ` · filtrés "${LABEL_STATUT[filtreStatut as StatutRabais]}"` : " au total"}
          </p>
        </div>
        <Link
          href="/admin/rabais/nouveau"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Nouveau rabais
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTRES.map((f) => (
          <Link
            key={f.value}
            href={f.value === "tous" ? "/admin/rabais" : `/admin/rabais?statut=${f.value}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filtreActif === f.value
                ? "bg-primary text-white"
                : "bg-surface text-muted-foreground hover:bg-border"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          Erreur lors du chargement : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[750px]">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cible
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Valeur
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Début
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fin
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rabais.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  Aucun rabais trouvé.
                </td>
              </tr>
            ) : (
              rabais.map((r) => {
                const s = getStatut(r);
                const nomCible = r.products?.name ?? r.packs?.name ?? "-";
                const typeCible = r.product_id ? "Produit" : "Pack";

                return (
                  <tr key={r.id} className="hover:bg-surface/60 transition-colors">
                    {/* Cible */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground truncate max-w-[220px]">{nomCible}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{typeCible}</p>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-3">
                      {r.discount_type === "percentage" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-burgundy-100 text-burgundy-800">
                          Pourcentage
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                          Montant fixe
                        </span>
                      )}
                    </td>

                    {/* Valeur */}
                    <td className="px-5 py-3">
                      <span className="font-bold text-accent tabular-nums text-base">
                        {r.discount_type === "percentage" ? `-${r.value}%` : `-${r.value} $`}
                      </span>
                    </td>

                    {/* Date début */}
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.starts_at ? formatDate(r.starts_at) : <span className="italic">Immédiat</span>}
                    </td>

                    {/* Date fin */}
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.ends_at ? formatDate(r.ends_at) : <span className="italic">Sans limite</span>}
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_STATUT[s]}`}>
                        {LABEL_STATUT[s]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/rabais/${r.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-foreground border border-border hover:bg-surface transition-colors"
                        >
                          <Pencil size={12} />
                          Modifier
                        </Link>
                        <SupprimerRabaisButton id={r.id} nomCible={nomCible} />
                      </div>
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
