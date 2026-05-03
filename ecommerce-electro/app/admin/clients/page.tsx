export const dynamic = "force-dynamic";

import Link from "next/link";
import { Users, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";

type Role = "client" | "admin" | "employee";

type ProfilLigne = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address_street: string | null;
  address_city: string | null;
  role: Role;
  created_at: string;
  orders: {
    id: string;
    total_amount: number;
    status: string;
  }[];
};

const ROLES: { value: Role | "tous"; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "client", label: "Clients" },
  { value: "admin", label: "Admins" },
  { value: "employee", label: "Employés" },
];

const BADGE_ROLE: Record<Role, string> = {
  client: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
  employee: "bg-teal-100 text-teal-700",
};

const LABEL_ROLE: Record<Role, string> = {
  client: "Client",
  admin: "Admin",
  employee: "Employé",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const filtreRole = role && role !== "tous" ? (role as Role) : null;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone, address_street, address_city, role, created_at, orders(id, total_amount, status)")
    .order("created_at", { ascending: false });

  if (filtreRole) {
    query = query.eq("role", filtreRole);
  }

  const { data: profils, error } = await query.returns<ProfilLigne[]>();

  const roleActif = role ?? "tous";
  const nbClients = profils?.filter((p) => p.role === "client").length ?? 0;

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profils?.length ?? 0} compte{(profils?.length ?? 0) !== 1 ? "s" : ""}
            {filtreRole ? ` · filtrés par "${LABEL_ROLE[filtreRole]}"` : " au total"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground">
          <Users size={15} className="shrink-0" />
          <span>{nbClients} client{nbClients !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Filtres par rôle */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ROLES.map((r) => (
          <Link
            key={r.value}
            href={r.value === "tous" ? "/admin/clients" : `/admin/clients?role=${r.value}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              roleActif === r.value
                ? "bg-primary text-white"
                : "bg-surface text-muted-foreground hover:bg-border"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          Erreur lors du chargement des clients : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Téléphone
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rôle
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Membre depuis
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Commandes
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total dépensé
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(profils ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  Aucun compte trouvé.
                </td>
              </tr>
            ) : (
              (profils ?? []).map((profil) => {
                const nbCommandes = profil.orders?.length ?? 0;
                const totalDepense = (profil.orders ?? [])
                  .filter((o) => o.status !== "annulee")
                  .reduce((sum, o) => sum + o.total_amount, 0);
                const nomComplet = [profil.first_name, profil.last_name].filter(Boolean).join(" ");
                const nomAffiche = nomComplet || profil.email || "-";

                return (
                  <tr key={profil.id} className="hover:bg-surface/60 transition-colors">
                    {/* Nom */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">
                        {nomAffiche}
                      </p>
                      {profil.email && nomComplet && (
                        <p className="text-xs text-muted-foreground mt-0.5 break-all">
                          {profil.email}
                        </p>
                      )}
                      {profil.address_street && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {[profil.address_street, profil.address_city].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </td>

                    {/* Téléphone */}
                    <td className="px-5 py-3 text-muted-foreground">
                      {profil.phone ?? <span className="italic">-</span>}
                    </td>

                    {/* Rôle */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_ROLE[profil.role]}`}>
                        {LABEL_ROLE[profil.role]}
                      </span>
                    </td>

                    {/* Membre depuis */}
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(profil.created_at)}
                    </td>

                    {/* Nb commandes */}
                    <td className="px-5 py-3">
                      {nbCommandes > 0 ? (
                        <span className="font-medium text-foreground">
                          {nbCommandes} commande{nbCommandes !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Aucune</span>
                      )}
                    </td>

                    {/* Total dépensé */}
                    <td className="px-5 py-3 font-semibold text-foreground tabular-nums">
                      {totalDepense > 0 ? formatPrix(totalDepense) : <span className="font-normal text-muted-foreground italic">-</span>}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3 text-right">
                      {nbCommandes > 0 && (
                        <Link
                          href={`/admin/commandes?user_id=${profil.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <ShoppingCart size={12} />
                          Commandes
                        </Link>
                      )}
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
