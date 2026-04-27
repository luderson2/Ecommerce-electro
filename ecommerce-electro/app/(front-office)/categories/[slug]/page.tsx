import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { type ProduitCarte } from "@/components/produits/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

async function getCategory(slug: string) {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  return { supabase, category };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getCategory(slug);

  if (!category) {
    return {
      title: "Catégorie introuvable",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} à Montréal`;
  const description =
    category.description ??
    `Magasinez nos ${category.name.toLowerCase()} avec livraison rapide au Québec.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    openGraph: {
      title: `${title} | ÉlectroMétropolitain`,
      description,
      type: "website",
    },
  };
}

export default async function CategoriePage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { supabase, category } = await getCategory(slug);

  if (!category) notFound();

  const { data: links } = await supabase
    .from("product_categories")
    .select("product_id")
    .eq("category_id", category.id);

  const ids = (links ?? []).map((link) => link.product_id);

  const { data: products } = ids.length
    ? await supabase
        .from("products")
        .select("id, name, slug, price, brand, stock, product_images(url, sort_order)")
        .eq("is_active", true)
        .in("id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };

  const produits = (products ?? []) as ProduitCarte[];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const safeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} - ÉlectroMétropolitain`,
    itemListElement: produits.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/catalogue/${product.slug}`,
      name: product.name,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }}
      />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Fil d'Ariane">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/catalogue" className="hover:text-foreground">
              Catalogue
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase text-primary">
          Électroménagers au Québec
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {category.name}
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {category.description ??
            `Découvrez notre sélection de ${category.name.toLowerCase()} disponibles pour la livraison au Québec.`}
        </p>
      </header>

      {produits.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-14 text-center">
          <p className="font-medium text-foreground">
            Aucun produit actif dans cette catégorie pour le moment.
          </p>
          <Button asChild className="mt-5">
            <Link href="/catalogue">Voir tout le catalogue</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {produits.length} produit{produits.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" asChild>
              <Link href={`/catalogue?categorie=${category.slug}`}>
                Filtrer dans le catalogue
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {produits.map((produit) => (
              <ProductCard key={produit.id} produit={produit} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
