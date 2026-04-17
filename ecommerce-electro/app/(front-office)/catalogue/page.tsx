export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import CatalogueFilters from "@/components/produits/CatalogueFilters";
import FiltresMobile from "@/components/produits/FiltresMobile";
import CatalogueGrille from "@/components/produits/CatalogueGrille";
import { type ProduitCarte } from "@/components/produits/ProductCard";
import TriSelect from "@/components/produits/TriSelect";

export const metadata: Metadata = {
  title: "Catalogue électroménagers à Montréal",
  description: "Parcourez notre sélection complète d'électroménagers : réfrigérateurs, laveuses, cuisinières, lave-vaisselle et plus encore.",
  alternates: {
    canonical: "/catalogue",
  },
};

interface SearchParams {
  categorie?: string;
  marque?: string;
  prix_min?: string;
  prix_max?: string;
  en_stock?: string;
  tri?: string;
}

async function getCatalogueData(params: SearchParams) {
  const supabase = await createClient();

  // Catégories pour les filtres
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  // Marques distinctes
  const { data: marqueRows } = await supabase
    .from("products")
    .select("brand")
    .eq("is_active", true);

  const marques = [...new Set((marqueRows ?? []).map((r) => r.brand))].sort();

  // Produits avec filtres
  let query = supabase
    .from("products")
    .select("id, name, slug, price, brand, stock, product_images(url, sort_order)")
    .eq("is_active", true);

  if (params.categorie) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categorie)
      .single();
    if (cat) {
      const { data: pcRows } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", cat.id);
      const ids = (pcRows ?? []).map((r) => r.product_id);
      // Si la catégorie existe mais est vide, forcer un résultat vide
      query = ids.length > 0 ? query.in("id", ids) : query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    }
  }

  if (params.marque) query = query.eq("brand", params.marque);
  if (params.prix_min) query = query.gte("price", parseFloat(params.prix_min));
  if (params.prix_max) query = query.lte("price", parseFloat(params.prix_max));
  if (params.en_stock === "1") query = query.gt("stock", 0);

  switch (params.tri) {
    case "prix_asc":
      query = query.order("price", { ascending: true });
      break;
    case "prix_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: produits } = await query;

  return {
    produits: (produits ?? []) as ProduitCarte[],
    categories: categories ?? [],
    marques,
  };
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { produits, categories, marques } = await getCatalogueData(params);

  const filtresActifs = {
    categorie: params.categorie,
    marque: params.marque,
    prix_min: params.prix_min,
    prix_max: params.prix_max,
    en_stock: params.en_stock === "1",
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {produits.length} produit{produits.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Bouton filtres mobile */}
        <div className="md:hidden">
          <Suspense>
            <FiltresMobile
              categories={categories}
              marques={marques}
              filtresActifs={filtresActifs}
            />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar filtres desktop */}
        <aside className="hidden md:block w-56 lg:w-60 xl:w-64 shrink-0 sticky top-24">
          <Suspense>
            <CatalogueFilters
              categories={categories}
              marques={marques}
              filtresActifs={filtresActifs}
            />
          </Suspense>
        </aside>

        {/* Grille produits */}
        <div className="flex-1 min-w-0">
          {/* Barre tri */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {produits.length} résultat{produits.length !== 1 ? "s" : ""}
            </span>
            <Suspense>
              <TriSelect tri={params.tri ?? "recents"} />
            </Suspense>
          </div>

          {produits.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-lg border border-border">
              <p className="text-muted-foreground font-medium">Aucun produit ne correspond à vos critères.</p>
            </div>
          ) : (
            <CatalogueGrille produits={produits} />
          )}
        </div>
      </div>
    </div>
  );
}
