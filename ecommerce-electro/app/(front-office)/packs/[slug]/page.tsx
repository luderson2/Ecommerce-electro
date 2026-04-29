import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, Package, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrix } from "@/lib/utils";
import PackActions from "@/components/packs/PackActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: pack } = await supabase
    .from("packs")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!pack) return { title: "Pack introuvable" };

  return {
    title: `${pack.name} - Pack électroménager`,
    description: pack.description ?? `Découvrez le pack ${pack.name} chez ÉlectroMétropolitain.`,
    alternates: {
      canonical: `/packs/${slug}`,
    },
    openGraph: {
      title: `${pack.name} - Pack électroménager`,
      description: pack.description ?? `Découvrez le pack ${pack.name}.`,
    },
  };
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Le paramètre "slug" contient l'id du pack (les packs n'ont pas de slug en BD)
  const { slug } = await params;
  const supabase = await createClient();

  const { data: pack } = await supabase
    .from("packs")
    .select(`
      id, slug, name, description, price,
      pack_products(
        products(id, name, slug, price, brand, stock, product_images(url, sort_order))
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!pack) notFound();

  type PackProduit = {
    id: string;
    name: string;
    slug: string;
    price: number;
    brand: string;
    stock: number;
    product_images: { url: string; sort_order: number }[];
  };

  const produits = (pack.pack_products ?? [])
    .map((pp: { products: PackProduit | null }) => pp.products)
    .filter((p): p is PackProduit => p !== null);
  const totalOriginal = produits.reduce((sum, p) => sum + Number(p.price), 0);
  const economie = totalOriginal > pack.price ? totalOriginal - pack.price : 0;
  const pct = totalOriginal > 0 ? Math.round((economie / totalOriginal) * 100) : 0;

  // Image du premier produit du pack
  const imageUrl = produits[0]?.product_images
    ?.slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  // Répartir le prix du pack proportionnellement entre les produits
  const packActionProducts = produits.map((p) => ({
    id: p.id,
    name: p.name,
    price: totalOriginal > 0
      ? Math.round((p.price / totalOriginal) * pack.price * 100) / 100
      : p.price,
    stock: p.stock,
    image: [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? "",
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const safeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  const packJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pack.name,
    description: pack.description ?? undefined,
    image: imageUrl ? [imageUrl] : [],
    sku: pack.id,
    category: "Pack électroménager",
    offers: {
      "@type": "Offer",
      price: pack.price,
      priceCurrency: "CAD",
      availability:
        produits.length > 0 && produits.every((p: { stock: number }) => p.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/packs/${pack.slug}`,
    },
    isRelatedTo: produits.map(
      (p: { name: string; slug: string; brand: string; price: number }) => ({
        "@type": "Product",
        name: p.name,
        brand: {
          "@type": "Brand",
          name: p.brand,
        },
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "CAD",
          url: `${siteUrl}/catalogue/${p.slug}`,
        },
      })
    ),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(packJsonLd) }}
      />
      <Link
        href="/packs"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux packs
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 mb-14">
        {/* Visuel */}
        <div className="relative aspect-square bg-surface rounded-xl border border-border overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={pack.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-10" priority unoptimized={imageUrl.includes("placehold.co")} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl">📦</span>
            </div>
          )}
          {pct > 0 && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 text-base px-3 py-1">
              -{pct} %
            </Badge>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-5">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Package className="h-3 w-3 mr-1" />
              Offre ensemble · {produits.length} produit{produits.length !== 1 ? "s" : ""}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{pack.name}</h1>
            {pack.description && (
              <p className="text-muted-foreground leading-relaxed">{pack.description}</p>
            )}
          </div>

          <Separator />

          <div className="bg-surface rounded-xl p-6 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-accent">{formatPrix(pack.price)}</span>
              {totalOriginal > pack.price && (
                <span className="text-lg text-muted-foreground line-through">{formatPrix(totalOriginal)}</span>
              )}
            </div>
            {economie > 0 && (
              <p className="text-green-600 font-semibold">
                Vous économisez {formatPrix(economie)} ({pct} % de rabais)
              </p>
            )}
            <ul className="space-y-2">
              {[
                "Livraison gratuite incluse",
                "Garantie complète sur tous les produits",
                "Installation professionnelle disponible",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <PackActions products={packActionProducts} />
          </div>
        </div>
      </div>

      {/* Produits inclus */}
      {produits.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-5">
            Produits inclus ({produits.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {produits.map((p: { id: string; name: string; slug: string; price: number; brand: string; product_images: { url: string; sort_order: number }[] }) => {
              const imgUrl = [...(p.product_images ?? [])]
                .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
              return (
                <div key={p.id} className="border border-border rounded-lg overflow-hidden bg-white">
                  <div className="relative aspect-square bg-surface">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={p.name} fill sizes="(max-width: 640px) 100vw, 300px" className="object-contain p-4" unoptimized={imgUrl.includes("placehold.co")} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">{p.brand}</p>
                    <Link href={`/catalogue/${p.slug}`}>
                      <h3 className="font-medium text-sm hover:text-primary transition-colors line-clamp-2 mb-2">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-accent">{formatPrix(p.price)}</span>
                      <Badge variant="secondary" className="text-xs">Inclus</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Détail des prix */}
      <Card className="max-w-md mx-auto border">
        <CardHeader>
          <CardTitle className="text-lg">Détail des prix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {produits.map((p: { id: string; name: string; price: number }) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate pr-4">{p.name}</span>
              <span>{formatPrix(p.price)}</span>
            </div>
          ))}
          <Separator />
          {totalOriginal > pack.price && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total original</span>
                <span className="line-through">{formatPrix(totalOriginal)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Rabais ensemble</span>
                <span>-{formatPrix(economie)}</span>
              </div>
              <Separator />
            </>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Prix du pack</span>
            <span className="text-accent">{formatPrix(pack.price)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
