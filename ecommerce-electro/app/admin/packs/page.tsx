import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";

type PackLigne = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  pack_products: { count: number }[];
};

export default async function AdminPacksPage() {
  const supabase = await createClient();

  const { data: packs, error } = (await supabase
    .from("packs")
    .select("id, name, description, price, is_active, pack_products(count)")
    .order("name")) as unknown as {
    data: PackLigne[] | null;
    error: { message: string } | null;
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Packs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {packs?.length ?? 0} pack{(packs?.length ?? 0) !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/admin/packs/nouveau"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Nouveau pack
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          Erreur lors du chargement : {error.message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Produits
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prix
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(packs ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground text-sm">
                  Aucun pack trouvé.{" "}
                  <Link href="/admin/packs/nouveau" className="text-primary hover:underline">
                    Créer le premier pack
                  </Link>
                </td>
              </tr>
            ) : (
              (packs ?? []).map((pack) => {
                const nbProduits = pack.pack_products?.[0]?.count ?? 0;
                const desc = pack.description
                  ? pack.description.length > 60
                    ? pack.description.slice(0, 60) + "…"
                    : pack.description
                  : "—";

                return (
                  <tr key={pack.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{pack.name}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs">{desc}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {nbProduits} produit{nbProduits !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground tabular-nums">
                      {formatPrix(pack.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          pack.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {pack.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/packs/${pack.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-surface transition-colors text-foreground"
                      >
                        <Pencil size={12} />
                        Modifier
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
