import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";
import type { OrderStatus } from "@/types";

// ─── Config statuts ──────────────────────────────────────────────────────────

const STATUTS: { value: OrderStatus | "tous"; label: string; classe: string }[] = [
  { value: "tous",           label: "Toutes",          classe: "" },
  { value: "en_attente",     label: "En attente",      classe: "bg-yellow-100 text-yellow-700" },
  { value: "payee",          label: "Payées",          classe: "bg-blue-100 text-blue-700" },
  { value: "en_preparation", label: "En préparation",  classe: "bg-orange-100 text-orange-700" },
  { value: "livraison",      label: "En livraison",    classe: "bg-purple-100 text-purple-700" },
  { value: "livree",         label: "Livrées",         classe: "bg-green-100 text-green-700" },
  { value: "annulee",        label: "Annulées",        classe: "bg-red-100 text-red-700" },
];

function badgeStatut(statut: string) {
  const s = STATUTS.find((x) => x.value === statut);
  return s ?? { label: statut, classe: "bg-gray-100 text-gray-600" };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ─── Types ───────────────────────────────────────────────────────────────────

type CommandeLigne = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  stripe_payment_id: string | null;
  profiles: { full_name: string | null } | null;
  order_items: { id: string }[];
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, status, total_amount, created_at, stripe_payment_id, profiles(full_name), order_items(id)")
    .order("created_at", { ascending: false });

  if (statut && statut !== "tous") {
    query = query.eq("status", statut);
  }

  const { data: commandes, error } = (await query) as unknown as {
    data: CommandeLigne[] | null;
    error: { message: string } | null;
  };

  const filtreCourant = statut ?? "tous";
  const nbResultats = commandes?.length ?? 0;

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
        <p className="text-sm text-muted mt-0.5">
          {nbResultats} commande{nbResultats !== 1 ? "s" : ""}
          {filtreCourant !== "tous" && ` · filtre : ${badgeStatut(filtreCourant).label}`}
        </p>
      </div>

      {/* Tabs filtres statut */}
      <div className="flex flex-wrap gap-2">
        {STATUTS.map((s) => {
          const actif = filtreCourant === s.value;
          const href = s.value === "tous" ? "/admin/commandes" : `/admin/commandes?statut=${s.value}`;
          return (
            <Link
              key={s.value}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                actif
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-foreground border-border hover:bg-surface"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          Erreur : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Commande
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Client
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Articles
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Total
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {!commandes?.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted text-sm">
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              commandes.map((cmd) => {
                const badge = badgeStatut(cmd.status);
                return (
                  <tr
                    key={cmd.id}
                    className="border-b border-border last:border-0 hover:bg-surface/60 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        #{cmd.id.slice(0, 8).toUpperCase()}
                      </span>
                      {cmd.stripe_payment_id && (
                        <p className="text-xs text-muted font-mono mt-0.5 truncate max-w-[120px]">
                          {cmd.stripe_payment_id}
                        </p>
                      )}
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3 text-foreground">
                      {cmd.profiles?.full_name ?? <span className="text-muted italic">—</span>}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {formatDate(cmd.created_at)}
                    </td>

                    {/* Articles */}
                    <td className="px-4 py-3 text-foreground tabular-nums">
                      {cmd.order_items.length}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-semibold text-foreground tabular-nums whitespace-nowrap">
                      {formatPrix(cmd.total_amount)}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.classe}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/commandes/${cmd.id}`}
                        className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        Voir →
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
