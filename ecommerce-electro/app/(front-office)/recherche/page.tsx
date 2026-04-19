import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { type ProduitCarte } from "@/components/produits/ProductCard";
import { Button } from "@/components/ui/button";

type RecherchePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: RecherchePageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  return {
    title: query ? `Recherche : ${query}` : "Recherche",
    description: query
      ? `Résultats de recherche pour ${query} chez ÉlectroMétropolitain.`
      : "Recherchez un électroménager par nom, marque ou catégorie.",
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const safeQuery = query.replace(/[%_,]/g, " ");
  const supabase = await createClient();

  const { data: produits } = query
    ? await supabase
        .from("products")
        .select("id, name, slug, price, brand, stock, product_images(url, sort_order)")
        .eq("is_active", true)
        .or(`name.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
        .order("created_at", { ascending: false })
        .limit(24)
    : { data: [] };

  const results = (produits ?? []) as ProduitCarte[];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {query ? `Résultats pour "${query}"` : "Recherche"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {query
            ? `${results.length} produit${results.length !== 1 ? "s" : ""} trouvé${results.length !== 1 ? "s" : ""}.`
            : "Entrez un nom de produit ou une marque dans la barre de recherche."}
        </p>
      </header>

      {!query ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center">
          <p className="font-medium text-foreground">Commencez une recherche depuis le menu.</p>
          <Button asChild className="mt-5">
            <Link href="/catalogue">Voir le catalogue</Link>
          </Button>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center">
          <p className="font-medium text-foreground">Aucun produit ne correspond à votre recherche.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Essayez avec une marque, un type d&apos;appareil ou un mot plus court.
          </p>
          <Button asChild className="mt-5">
            <Link href="/catalogue">Parcourir le catalogue</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      )}
    </div>
  );
}
