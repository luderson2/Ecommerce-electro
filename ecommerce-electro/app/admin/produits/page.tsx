export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";

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

export default async function AdminProduitsPage() {
  const supabase = await createClient();
  const { data: products, error } = (await supabase
    .from("products")
    .select("id, name, slug, price, brand, stock, is_active, product_images(url, sort_order)")
    .order("created_at", { ascending: false })) as unknown as {
    data: ProduitLigne[] | null;
    error: { message: string } | null;
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products?.length ?? 0} produit{(products?.length ?? 0) !== 1 ? "s" : ""} au total
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                Image
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Marque
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prix
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Stock
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {!products?.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground text-sm">
                  Aucun produit pour le moment.{" "}
                  <Link href="/admin/produits/nouveau" className="text-primary underline">
                    Créer le premier produit
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const imageUrl = product.product_images
                  ?.slice()
                  .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
                const stockFaible = product.stock <= 5;

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
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Nom */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground leading-tight">{product.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 font-mono">{product.slug}</p>
                    </td>

                    {/* Marque */}
                    <td className="px-4 py-3 text-foreground">{product.brand}</td>

                    {/* Prix */}
                    <td className="px-4 py-3 font-medium text-foreground tabular-nums">
                      {formatPrix(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium tabular-nums ${
                          stockFaible ? "text-red-600" : "text-foreground"
                        }`}
                      >
                        {product.stock}
                      </span>
                      {stockFaible && product.stock > 0 && (
                        <span className="ml-1.5 text-xs text-red-500">Stock faible</span>
                      )}
                      {product.stock === 0 && (
                        <span className="ml-1.5 text-xs text-red-500">Épuisé</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            product.is_active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
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
