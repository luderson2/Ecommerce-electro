import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { type ProduitCarte } from "@/components/produits/ProductCard";
import CatalogueFilters from "@/components/produits/CatalogueFilters";
import TriSelect from "@/components/produits/TriSelect";

type SearchParams = Promise<{
  categorie?: string;
  marque?: string;
  prix_min?: string;
  prix_max?: string;
  en_stock?: string;
  tri?: string;
}>;

export const metadata = {
  title: "Catalogue",
  description:
    "Parcourez notre catalogue d'électroménagers : réfrigérateurs, laveuses, cuisinières et plus. Livraison au Québec.",
};

export default async function CataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  const categorieSlug = params.categorie;
  const marque = params.marque;
  const prixMin = params.prix_min ? parseFloat(params.prix_min) : undefined;
  const prixMax = params.prix_max ? parseFloat(params.prix_max) : undefined;
  const enStock = params.en_stock === "1";
  const tri = params.tri ?? "recents";

  // ── Données sidebar (catégories + marques) ────────────────────────────────
  const [categoriesResult, brandsResult] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("products").select("brand").eq("is_active", true),
  ]);

  const categories = categoriesResult.data ?? [];
  const marques = [
    ...new Set(
      (brandsResult.data ?? []).map((p: { brand: string }) => p.brand)
    ),
  ].sort() as string[];

  // ── Filtre catégorie via product_categories ───────────────────────────────
  let idsCategorie: string[] | null = null;
  if (categorieSlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorieSlug)
      .single();

    if (cat) {
      const { data: liens } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", cat.id);
      idsCategorie = (liens ?? []).map((l: { product_id: string }) => l.product_id);
    }
  }

  // ── Requête produits ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("products")
    .select("id, name, slug, price, brand, stock, product_images(url, sort_order)")
    .eq("is_active", true);

  if (enStock) query = query.gt("stock", 0);
  if (prixMin !== undefined) query = query.gte("price", prixMin);
  if (prixMax !== undefined) query = query.lte("price", prixMax);
  if (marque) query = query.eq("brand", marque);
  if (idsCategorie !== null) {
    query =
      idsCategorie.length > 0
        ? query.in("id", idsCategorie)
        : query.in("id", ["___vide___"]);
  }

  switch (tri) {
    case "prix_asc":
      query = query.order("price", { ascending: true });
      break;
    case "prix_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products, error } = (await query) as {
    data: ProduitCarte[] | null;
    error: { message: string } | null;
  };

  const nbResultats = products?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Titre page */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {categorieSlug
            ? (categories.find((c) => c.slug === categorieSlug)?.name ?? "Catalogue")
            : "Catalogue"}
        </h1>
        <p className="text-sm text-muted mt-1">
          Électroménagers livrés partout au Québec
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar filtres ───────────────────────────────────────────── */}
        <aside className="w-full lg:w-64 shrink-0">
          <Suspense>
            <CatalogueFilters
              categories={categories}
              marques={marques}
              filtresActifs={{
                categorie: categorieSlug,
                marque,
                prix_min: params.prix_min,
                prix_max: params.prix_max,
                en_stock: enStock,
              }}
            />
          </Suspense>
        </aside>

        {/* ── Contenu principal ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Barre résultats + tri */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
            <p className="text-sm text-muted">
              <span className="font-semibold text-foreground tabular-nums">{nbResultats}</span>{" "}
              produit{nbResultats !== 1 ? "s" : ""}
              {marque && (
                <span className="ml-1">
                  — <span className="font-medium text-foreground">{marque}</span>
                </span>
              )}
            </p>
            <Suspense>
              <TriSelect tri={tri} />
            </Suspense>
          </div>

          {/* Erreur Supabase */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-5">
              Erreur lors du chargement : {error.message}
            </div>
          )}

          {/* Grille ou état vide */}
          {nbResultats === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-lg font-semibold text-foreground">Aucun produit trouvé</p>
              <p className="text-sm text-muted mt-1 max-w-xs">
                Essayez de modifier ou de réinitialiser vos filtres pour voir plus de résultats.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products?.map((produit) => (
                <ProductCard key={produit.id} produit={produit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
