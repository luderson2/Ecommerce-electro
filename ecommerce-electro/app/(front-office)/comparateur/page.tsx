"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check, GitCompareArrows, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatPrix } from "@/lib/utils";

interface ProduitComparateur {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  stock: number;
  description: string | null;
  product_images: { url: string; sort_order: number }[];
}

interface ProduitSimple {
  id: string;
  name: string;
  brand: string;
}

export default function ComparateurPage() {
  const [tousLesProduits, setTousLesProduits] = useState<ProduitSimple[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [produits, setProduits] = useState<ProduitComparateur[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, brand")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        const liste = data ?? [];
        setTousLesProduits(liste);
        // Présélectionner les 2 premiers
        const ids = liste.slice(0, 2).map((p) => p.id);
        setCompareIds(ids);
        setChargement(false);
      });
  }, []);

  useEffect(() => {
    if (compareIds.length === 0) {
      setProduits([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, slug, brand, price, stock, description, product_images(url, sort_order)")
      .in("id", compareIds)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => setProduits((data ?? []) as any));
  }, [compareIds]);

  const retirer = (id: string) => setCompareIds((ids) => ids.filter((i) => i !== id));
  const ajouter = (id: string) => {
    if (compareIds.length < 3 && !compareIds.includes(id)) {
      setCompareIds((ids) => [...ids, id]);
    }
  };

  const disponibles = tousLesProduits.filter((p) => !compareIds.includes(p.id));

  const lignes = [
    { label: "Marque", valeur: (p: ProduitComparateur) => p.brand },
    { label: "Prix", valeur: (p: ProduitComparateur) => formatPrix(p.price) },
    {
      label: "Disponibilité",
      valeur: (p: ProduitComparateur) =>
        p.stock > 0 ? (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="h-4 w-4" /> En stock
          </span>
        ) : (
          <span className="flex items-center gap-1 text-destructive text-sm">
            <X className="h-4 w-4" /> Épuisé
          </span>
        ),
    },
    {
      label: "Description",
      valeur: (p: ProduitComparateur) => (
        <span className="text-xs text-muted-foreground line-clamp-3">{p.description ?? "—"}</span>
      ),
    },
  ];

  if (chargement) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Chargement…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Comparer les produits</h1>
        <p className="text-sm text-muted-foreground mt-1">Comparez jusqu&apos;à 3 produits côte à côte</p>
      </div>

      {/* Sélecteur d'ajout */}
      {compareIds.length < 3 && disponibles.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">Ajouter un produit :</span>
          <select
            className="text-sm border border-border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
            defaultValue=""
            onChange={(e) => { if (e.target.value) { ajouter(e.target.value); e.target.value = ""; } }}
          >
            <option value="" disabled>Choisir un produit…</option>
            {disponibles.map((p) => (
              <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>
            ))}
          </select>
        </div>
      )}

      {produits.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-border">
          <GitCompareArrows className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium mb-4">Aucun produit à comparer.</p>
          <Button asChild>
            <Link href="/catalogue">Parcourir le catalogue</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            {/* En-têtes produits */}
            <div
              className="grid gap-4 mb-4"
              style={{ gridTemplateColumns: `160px repeat(${produits.length}, 1fr)` }}
            >
              <div />
              {produits.map((p) => {
                const imgUrl = [...(p.product_images ?? [])]
                  .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
                return (
                  <Card key={p.id} className="relative border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => retirer(p.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-3 pt-8">
                      <div className="relative aspect-square bg-surface rounded-md overflow-hidden mb-3">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={p.name} fill className="object-contain p-3" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">{p.brand}</p>
                      <Link href={`/catalogue/${p.slug}`}>
                        <p className="text-sm font-medium hover:text-primary transition-colors line-clamp-2 mb-3">
                          {p.name}
                        </p>
                      </Link>
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-white"
                        size="sm"
                        disabled={p.stock === 0}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                        Ajouter
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {/* Slot vide si < 3 produits */}
              {compareIds.length < 3 && (
                <div className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center min-h-[200px] text-muted-foreground gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                  <Plus className="h-8 w-8" />
                  <span className="text-xs text-center px-2">Ajouter un produit</span>
                </div>
              )}
            </div>

            {/* Tableau de comparaison */}
            <Card className="border overflow-hidden">
              <CardHeader className="bg-surface py-3">
                <CardTitle className="text-base">Comparatif</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lignes.map(({ label, valeur }, i) => (
                  <div
                    key={label}
                    className={`grid border-b last:border-b-0 ${i % 2 === 0 ? "" : "bg-surface/50"}`}
                    style={{ gridTemplateColumns: `160px repeat(${produits.length}, 1fr)` }}
                  >
                    <div className="p-3 font-semibold text-sm text-foreground bg-surface/80 border-r">{label}</div>
                    {produits.map((p) => (
                      <div key={p.id} className="p-3 text-sm">
                        {valeur(p)}
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
