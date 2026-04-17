export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SupprimerCategorieButton from "./SupprimerCategorieButton";

type CategorieLigne = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_categories: { product_id: string }[];
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, product_categories(product_id)")
    .order("name")
    .returns<CategorieLigne[]>();

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {categories?.length ?? 0} catégorie{(categories?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/categories/nouvelle"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </Link>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          Erreur lors du chargement : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[550px]">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Slug
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Produits
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(categories ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  Aucune catégorie trouvée.
                </td>
              </tr>
            ) : (
              (categories ?? []).map((cat) => {
                const nbProduits = cat.product_categories?.length ?? 0;
                return (
                  <tr key={cat.id} className="hover:bg-surface/60 transition-colors">
                    {/* Nom */}
                    <td className="px-5 py-3 font-medium text-foreground">{cat.name}</td>

                    {/* Slug */}
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border">
                        {cat.slug}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3 text-muted-foreground max-w-[280px]">
                      {cat.description ? (
                        <span className="truncate block">{cat.description}</span>
                      ) : (
                        <span className="italic">-</span>
                      )}
                    </td>

                    {/* Nb produits */}
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        nbProduits > 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {nbProduits} produit{nbProduits !== 1 ? "s" : ""}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${cat.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-foreground border border-border hover:bg-surface transition-colors"
                        >
                          <Pencil size={12} />
                          Modifier
                        </Link>
                        <SupprimerCategorieButton id={cat.id} nom={cat.name} nbProduits={nbProduits} />
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
