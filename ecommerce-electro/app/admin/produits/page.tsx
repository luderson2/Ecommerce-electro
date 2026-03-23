import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";
import ProduitsFilters from "./ProduitsFilters";

type ProduitLigne = {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: string;
  stock: number;
  is_active: boolean;
  product_images: { url: string; sort_order: number }[];
};

type SearchParams = Promise<{
  q?: string;
  marque?: string;
  statut?: string;
  stock?: string;
}>;

export default async function AdminProduitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // ── Marques pour le filtre ────────────────────────────────────────────────
  const { data: brandsData } = await supabase.from("products").select("brand");
  const marques = [...new Set((brandsData ?? []).map((p: { brand: string }) => p.brand))].sort() as string[];

  // ── Requête produits avec filtres ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("products")
    .select("id, name, slug, price, brand, stock, is_active, product_images(url, sort_order)")
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }
  if (params.marque) {
    query = query.eq("brand", params.marque);
  }
  if (params.statut === "actif") {
    query = query.eq("is_active", true);
  } else if (params.statut === "inactif") {
    query = query.eq("is_active", false);
  }
  if (params.stock === "epuise") {
    query = query.eq("stock", 0);
  } else if (params.stock === "faible") {
    query = query.gt("stock", 0).lte("stock", 5);
  }

  const { data: products, error } = (await query) as unknown as {
    data: ProduitLigne[] | null;
    error: { message: string } | null;
  };

  const nb = products?.length ?? 0;

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produits</h1>
          <p className="text-sm text-muted mt-0.5">
            <span className="font-semibold text-foreground">{nb}</span>{" "}
            produit{nb !== 1 ? "s" : ""}
            {params.q && (
              <span className="ml-1">
                — résultats pour <span className="font-medium text-foreground">«{params.q}»</span>
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Nouveau produit
        </Link>
      </div>

      {/* Filtres */}
      <Suspense>
        <ProduitsFilters
          marques={marques}
          filtresActifs={{
            q: params.q,
            marque: params.marque,
            statut: params.statut,
            stock: params.stock,
          }}
        />
      </Suspense>

      {/* Erreur Supabase */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
          Erreur lors du chargement des produits : {error.message}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider w-16">
                Image
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Marque
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Prix
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Stock
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {!products?.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted text-sm">
                  Aucun produit trouvé.{" "}
                  {!params.q && !params.marque && !params.statut && !params.stock && (
                    <Link href="/admin/produits/nouveau" className="text-primary underline">
                      Créer le premier produit
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const imageUrl = product.product_images
                  ?.slice()
                  .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
                const stockFaible = product.stock > 0 && product.stock <= 5;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-surface/60 transition-colors"
                  >
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 bg-surface rounded-md overflow-hidden flex items-center justify-center border border-border">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Nom */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground leading-tight">{product.name}</p>
                      <p className="text-muted text-xs mt-0.5 font-mono">{product.slug}</p>
                    </td>

                    {/* Marque */}
                    <td className="px-4 py-3 text-foreground">{product.brand}</td>

                    {/* Prix */}
                    <td className="px-4 py-3 font-medium text-foreground tabular-nums">
                      {formatPrix(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span className={`font-medium tabular-nums ${product.stock === 0 || stockFaible ? "text-red-600" : "text-foreground"}`}>
                        {product.stock}
                      </span>
                      {stockFaible && (
                        <span className="ml-1.5 text-xs text-red-500">Stock faible</span>
                      )}
                      {product.stock === 0 && (
                        <span className="ml-1.5 text-xs text-red-500">Épuisé</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        {product.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/produits/${product.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                      >
                        Modifier →
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
