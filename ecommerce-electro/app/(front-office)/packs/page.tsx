import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Packs électroménagers",
  description: "Économisez en achetant nos ensembles d'électroménagers sélectionnés pour vous.",
  alternates: {
    canonical: "/packs",
  },
};
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrix } from "@/lib/utils";

export default async function PacksPage() {
  const supabase = await createClient();

  const { data: packs } = await supabase
    .from("packs")
    .select(`
      id, slug, name, description, price,
      pack_products(products(id, price))
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Nos packs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {(packs ?? []).length} ensemble{(packs ?? []).length !== 1 ? "s" : ""} disponible{(packs ?? []).length !== 1 ? "s" : ""}
        </p>
      </div>

      {(packs ?? []).length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Aucun pack disponible pour le moment.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/catalogue">Parcourir le catalogue</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(packs ?? []).map((pack) => {
            const produits = (pack.pack_products ?? [])
              .map((pp: { products: { price: number } | null }) => pp.products)
              .filter((p): p is { price: number } => p !== null);
            const totalOriginal = produits.reduce((sum, p) => sum + Number(p.price), 0);
            const economie = totalOriginal > pack.price ? totalOriginal - pack.price : 0;
            const pct = totalOriginal > 0 ? Math.round((economie / totalOriginal) * 100) : 0;

            return (
              <div key={pack.id} className="border border-border rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all">
                <div className="bg-surface flex items-center justify-center py-10">
                  <span className="text-6xl">📦</span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      <Package className="h-3 w-3 mr-1" />
                      {produits.length} produit{produits.length !== 1 ? "s" : ""}
                    </Badge>
                    {pct > 0 && (
                      <Badge className="bg-red-500 text-white border-0">-{pct} %</Badge>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-foreground mb-2">{pack.name}</h2>
                  {pack.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{pack.description}</p>
                  )}

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-bold text-accent">{formatPrix(pack.price)}</span>
                    {totalOriginal > pack.price && (
                      <span className="text-sm text-muted-foreground line-through">{formatPrix(totalOriginal)}</span>
                    )}
                  </div>
                  {economie > 0 && (
                    <p className="text-xs text-green-600 font-medium mb-4">
                      Vous économisez {formatPrix(economie)}
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
      )}
    </div>
  );
}
