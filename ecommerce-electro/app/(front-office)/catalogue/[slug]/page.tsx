import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrix } from "@/lib/utils";
import ProductCard, { type ProduitCarte } from "@/components/produits/ProductCard";
import ProductActions from "@/components/produits/ProductActions";

type ProductCategory = { id: string; name: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: produit } = await supabase
    .from("products")
    .select("name, description, brand, product_images(url, sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!produit) return { title: "Produit introuvable", robots: { index: false } };

  const image = [...(produit.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;

  return {
    title: `${produit.name} - ${produit.brand}`,
    description:
      produit.description ??
      `Découvrez le ${produit.name} de ${produit.brand} chez ÉlectroMétropolitain.`,
    alternates: {
      canonical: `/catalogue/${slug}`,
    },
    openGraph: {
      title: `${produit.name} - ${produit.brand}`,
      description:
        produit.description ?? `Découvrez le ${produit.name} de ${produit.brand}.`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: produit } = await supabase
    .from("products")
    .select(`
      id, name, slug, description, price, brand, stock, is_active,
      product_images(url, sort_order),
      product_categories(category_id, categories(id, name, slug))
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!produit) notFound();

  const images = [...(produit.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order);

  const categories = (produit.product_categories ?? [])
    .map((pc) => pc.categories)
    .filter(Boolean) as ProductCategory[];

  const epuise = produit.stock === 0;
  const primaryImage = images[0]?.url ?? "/placeholder.svg";

  let similaires: ProduitCarte[] = [];
  if (categories.length > 0) {
    const { data: pcRows } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", categories[0].id)
      .neq("product_id", produit.id)
      .limit(4);

    if (pcRows && pcRows.length > 0) {
      const ids = pcRows.map((r) => r.product_id);
      const { data: sim } = await supabase
        .from("products")
        .select("id, name, slug, price, brand, stock, product_images(url, sort_order)")
        .in("id", ids)
        .eq("is_active", true);
      similaires = (sim ?? []) as ProduitCarte[];
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produit.name,
    brand: {
      "@type": "Brand",
      name: produit.brand,
    },
    description: produit.description ?? undefined,
    image: images.map((image) => image.url),
    sku: produit.id,
    offers: {
      "@type": "Offer",
      price: produit.price,
      priceCurrency: "CAD",
      availability: epuise
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `${siteUrl}/catalogue/${produit.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${siteUrl}/catalogue` },
      ...(categories[0]
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: categories[0].name,
              item: `${siteUrl}/categories/${categories[0].slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: categories[0] ? 4 : 3,
        name: produit.name,
        item: `${siteUrl}/catalogue/${produit.slug}`,
      },
    ],
  };

  // Échapper `</` pour éviter qu'une valeur produit ne ferme prématurément la balise <script>
  const safeJsonLd = (data: unknown) =>
    JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      <nav className="text-sm text-muted-foreground mb-6" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-2 flex-wrap">
          <li><Link href="/" className="hover:text-foreground transition-colors">Accueil</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/catalogue" className="hover:text-foreground transition-colors">Catalogue</Link></li>
          {categories[0] && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/categories/${categories[0].slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {categories[0].name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li className="text-foreground truncate max-w-[200px]">{produit.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        <div className="space-y-3">
          <div className="relative aspect-square bg-surface rounded-lg border border-border overflow-hidden">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={produit.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <span className="text-sm font-semibold">ÉlectroMétropolitain</span>
                <span className="text-sm">Pas d&apos;image</span>
              </div>
            )}
            {epuise && (
              <Badge className="absolute top-4 left-4 bg-red-600 text-white">Épuisé</Badge>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 flex-shrink-0 rounded-md border border-border overflow-hidden bg-surface"
                >
                  <Image src={img.url} alt={`${produit.name} vue ${i + 1}`} fill sizes="80px" className="object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {produit.brand}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{produit.name}</h1>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`}>
                  <Badge variant="secondary" className="hover:bg-primary/10 transition-colors">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <Separator />

          <p className="text-3xl font-bold text-accent">{formatPrix(produit.price)}</p>

          <div className="flex items-center gap-2">
            {!epuise ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  En stock{produit.stock <= 5 ? ` - ${produit.stock} restant${produit.stock > 1 ? "s" : ""}` : ""}
                </span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">Rupture de stock</span>
              </>
            )}
          </div>

          {produit.description && (
            <>
              <Separator />
              <p className="text-muted-foreground leading-relaxed">{produit.description}</p>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <ProductActions
              product={{
                id: produit.id,
                name: produit.name,
                price: produit.price,
                image: primaryImage,
              }}
              disabled={epuise}
            />
            <Button variant="outline" className="w-full" size="lg" asChild>
              <Link href="/catalogue">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au catalogue
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {similaires.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similaires.map((p) => (
              <ProductCard key={p.id} produit={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
