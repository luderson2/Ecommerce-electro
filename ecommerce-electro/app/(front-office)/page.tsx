import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // ISR : revalide toutes les heures
import Link from "next/link";
import { ArrowRight, Truck, Shield, Headphones, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrix } from "@/lib/utils";
import ProductCard, { type ProduitCarte } from "@/components/produits/ProductCard";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: produits },
    { data: categories },
    { data: packs },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, price, brand, stock, product_images(url, sort_order)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("categories")
      .select("id, name, slug, description")
      .order("name"),
    supabase
      .from("packs")
      .select(`
        id, slug, name, description, price,
        pack_products(products(id, name, price, brand, stock, product_images(url, sort_order)))
      `)
      .eq("is_active", true)
      .limit(3),
  ]);

  const produitsVedette = (produits ?? []) as ProduitCarte[];
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "ÉlectroMétropolitain",
    description: "Boutique d'électroménagers avec livraison au Québec.",
    areaServed: "Québec",
    email: "support@electrometropolitain.ca",
    telephone: "+1-514-123-4567",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Montréal",
      addressRegion: "QC",
      addressCountry: "CA",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Hero */}
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-14">

            {/* Bloc texte */}
            <div className="lg:max-w-[620px]">
              {/* Eyebrow géographique */}
              <div className="flex items-center gap-3 mb-9">
                <span className="h-px w-8 bg-white/20 shrink-0" />
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-white/40">
                  Montréal · Québec
                </span>
              </div>

              {/* Headline à contraste de graisse */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight mb-7">
                Des électroménagers<br />
                <span className="font-light text-white/40">de qualité,</span><br />
                livrés chez vous.
              </h1>

              <p className="text-white/60 text-base leading-relaxed mb-9 max-w-md">
                Sélection de marques reconnues, disponibles au Québec.
                Livraison gratuite sur les commandes de 500&nbsp;$ et plus.
              </p>

              {/* CTAs : bouton blanc + lien texte */}
              <div className="flex flex-wrap items-center gap-5">
                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-primary border-0 font-semibold"
                  asChild
                >
                  <Link href="/catalogue">
                    Magasiner <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  href="/packs"
                  className="text-sm text-white/50 hover:text-white underline-offset-4 hover:underline transition-colors"
                >
                  Voir les offres en ensemble
                </Link>
              </div>
            </div>

            {/* Grille stats 2×2 — desktop uniquement */}
            <div className="hidden lg:grid grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden shrink-0">
              {[
                { value: "13+", label: "produits disponibles" },
                { value: "500 $", label: "livraison offerte dès" },
                { value: "2 ans", label: "garantie incluse" },
                { value: "7j/7", label: "support dédié" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-primary px-6 py-5">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-[11px] text-white/40 mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Barre de confiance */}
      <section className="border-b bg-surface">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            {[
              { icon: Truck, label: "Livraison gratuite", sub: "dès 500 $" },
              { icon: Shield, label: "Garantie 2 ans", sub: "sur tous les produits" },
              { icon: Headphones, label: "Support 7j/7", sub: "assistance dédiée" },
              { icon: CreditCard, label: "Paiement sécurisé", sub: "transactions chiffrées" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-2">
                <Icon className="h-5 w-5 text-primary mb-1" />
                <span className="font-semibold text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories */}
      {(categories ?? []).length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Magasiner par catégorie</h2>
            <p className="text-muted-foreground text-sm mt-1">Trouvez l&apos;appareil parfait pour chaque pièce</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories ?? []).map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogue?categorie=${cat.slug}`}
                className="group border border-border rounded-lg p-4 text-center bg-white hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                  <span className="text-xl">📦</span>
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits en vedette */}
      {produitsVedette.length > 0 && (
        <section className="bg-surface border-y">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Produits en vedette</h2>
                <p className="text-muted-foreground text-sm mt-1">Nos appareils les plus récents</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex text-primary hover:text-primary/80" asChild>
                <Link href="/catalogue">
                  Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {produitsVedette.map((p) => (
                <ProductCard key={p.id} produit={p} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/catalogue">Voir tous les produits</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Packs */}
      {(packs ?? []).length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Offres en ensemble</h2>
              <p className="text-muted-foreground text-sm mt-1">Économisez en achetant ensemble</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex text-primary hover:text-primary/80" asChild>
              <Link href="/packs">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(packs ?? []).map((pack) => {
              const packProduits = (pack.pack_products ?? [])
                .map((pp: { products: { price: number } | null }) => pp.products)
                .filter((p): p is { price: number } => p !== null);
              const totalOriginal = packProduits.reduce((sum, p) => sum + Number(p.price), 0);
              const economie = totalOriginal > pack.price ? totalOriginal - pack.price : 0;

              return (
                <div key={pack.id} className="border border-border rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <div className="bg-surface p-6 flex items-center justify-center min-h-[140px]">
                    <span className="text-5xl">📦</span>
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2">Ensemble · {packProduits.length} produit{packProduits.length !== 1 ? "s" : ""}</Badge>
                    <h3 className="text-lg font-bold text-foreground mb-1">{pack.name}</h3>
                    {pack.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{pack.description}</p>
                    )}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-accent">{formatPrix(pack.price)}</span>
                      {totalOriginal > pack.price && (
                        <span className="text-sm text-muted-foreground line-through">{formatPrix(totalOriginal)}</span>
                      )}
                    </div>
                    {economie > 0 && (
                      <p className="text-sm text-green-600 font-medium mb-4">
                        Économisez {formatPrix(economie)}
                      </p>
                    )}
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white" asChild>
                      <Link href={`/packs/${pack.slug}`}>Voir le pack</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
