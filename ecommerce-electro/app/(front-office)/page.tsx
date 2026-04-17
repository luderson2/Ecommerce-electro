import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* Hero */}
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4 bg-accent text-white border-0">Nouveautés</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance leading-tight">
                Des appareils de qualité pour votre maison
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-md leading-relaxed">
                Découvrez notre sélection d&apos;électroménagers de marques reconnues. Livraison gratuite sur les commandes de 500 $ et plus.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0" asChild>
                  <Link href="/catalogue">
                    Magasiner <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/packs">Voir les packs</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/3] bg-white/10 rounded-xl overflow-hidden hidden md:block">
              <Image
                src="/placeholder.svg"
                alt="Électroménagers ElectroMétropolitain"
                fill
                className="object-contain p-10 opacity-80"
              />
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const packProduits = (pack.pack_products ?? []).map((pp: any) => pp.products).filter(Boolean);
              const totalOriginal = packProduits.reduce((sum: number, p: { price: number }) => sum + Number(p.price), 0);
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
