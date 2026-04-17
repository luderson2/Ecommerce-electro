"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Check, GitCompareArrows, ShoppingCart, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatPrix } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

type CellVal = { text: string; raw: string; node?: React.ReactNode };

interface ProduitComparateur {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  stock: number;
  description: string | null;
  specs: Record<string, string>;
  product_images: { url: string; sort_order: number }[];
}

interface ProduitSimple {
  id: string;
  name: string;
  brand: string;
}

function ComparateurContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  const idsParam = searchParams.get("ids");
  const compareIds = useMemo(
    () => (idsParam ? idsParam.split(",").slice(0, 3) : []),
    [idsParam]
  );

  const [tousLesProduits, setTousLesProduits] = useState<ProduitSimple[]>([]);
  const [produits, setProduits] = useState<ProduitComparateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Charger la liste de tous les produits
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase
          .from("products")
          .select("id, name, brand")
          .eq("is_active", true)
          .order("name");
        setTousLesProduits(data ?? []);
      } catch {
        // Erreur silencieuse - on reste avec une liste vide
      } finally {
        setChargement(false);
      }
    };
    load();
  }, []);

  // Présélectionner les 2 premiers produits si aucun id dans l'URL
  useEffect(() => {
    if (!idsParam && tousLesProduits.length >= 1) {
      const defaults = tousLesProduits.slice(0, 2).map((p) => p.id);
      router.replace(`/comparateur?ids=${defaults.join(",")}`, { scroll: false });
    }
  // idsParam intentionnellement hors deps : on déclenche uniquement quand
  // tousLesProduits bascule de [] à non vide
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tousLesProduits]);

  // Charger les données complètes des produits comparés (avec specs)
  useEffect(() => {
    if (compareIds.length === 0) {
      setProduits([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("products")
      .select(
        "id, name, slug, brand, price, stock, description, specs, product_images(url, sort_order)"
      )
      .in("id", compareIds)
      .then(({ data }) => setProduits((data ?? []) as ProduitComparateur[]));
  }, [compareIds]);

  const retirer = useCallback(
    (id: string) => {
      const next = compareIds.filter((i) => i !== id);
      router.replace(
        next.length > 0 ? `/comparateur?ids=${next.join(",")}` : `/comparateur`,
        { scroll: false }
      );
    },
    [compareIds, router]
  );

  const ajouter = useCallback(
    (id: string) => {
      if (compareIds.length >= 3 || compareIds.includes(id)) return;
      const next = [...compareIds, id];
      router.replace(`/comparateur?ids=${next.join(",")}`, { scroll: false });
    },
    [compareIds, router]
  );

  const handleAddToCart = async (produit: ProduitComparateur) => {
    if (!user) {
      router.push("/connexion");
      return;
    }
    const imageUrl = [...(produit.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? "";
    setAddingId(produit.id);
    await addToCart({ id: produit.id, name: produit.name, price: produit.price, image: imageUrl });
    setAddingId(null);
  };

  const disponibles = tousLesProduits.filter((p) => !compareIds.includes(p.id));

  // Construire les clés de specs - union de toutes les specs des produits comparés
  const specKeys = [
    ...new Set(produits.flatMap((p) => Object.keys(p.specs ?? {}))),
  ];

  // Lignes fixes du tableau
  const lignesFixees: { label: string; valeurs: (ps: ProduitComparateur[]) => CellVal[] }[] = [
    {
      label: "Marque",
      valeurs: (ps) => ps.map((p) => ({ text: p.brand, raw: p.brand })),
    },
    {
      label: "Prix",
      valeurs: (ps: ProduitComparateur[]) =>
        ps.map((p) => ({ text: formatPrix(p.price), raw: String(p.price) })),
    },
    {
      label: "Disponibilité",
      valeurs: (ps: ProduitComparateur[]) =>
        ps.map((p) => ({
          text: p.stock > 0 ? "En stock" : "Épuisé",
          raw: p.stock > 0 ? "En stock" : "Épuisé",
          node:
            p.stock > 0 ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="h-4 w-4" /> En stock
              </span>
            ) : (
              <span className="flex items-center gap-1 text-destructive text-sm font-medium">
                <X className="h-4 w-4" /> Épuisé
              </span>
            ),
        })),
    },
    {
      label: "Description",
      valeurs: (ps: ProduitComparateur[]) =>
        ps.map((p) => ({
          text: p.description ?? "-",
          raw: p.description ?? "",
          node: (
            <span className="text-xs text-muted-foreground line-clamp-3">
              {p.description ?? "-"}
            </span>
          ),
        })),
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
        <p className="text-sm text-muted-foreground mt-1">
          Comparez jusqu&apos;à 3 produits côte à côte
        </p>
      </div>

      {/* Sélecteur d'ajout */}
      {compareIds.length < 3 && disponibles.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">Ajouter un produit :</span>
          <select
            className="text-sm border border-border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                ajouter(e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="" disabled>
              Choisir un produit…
            </option>
            {disponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} - {p.name}
              </option>
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
              style={{ gridTemplateColumns: `180px repeat(${produits.length}, 1fr)` }}
            >
              <div />
              {produits.map((p) => {
                const imgUrl = [...(p.product_images ?? [])]
                  .sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
                const inCart = isInCart(p.id);
                const isAdding = addingId === p.id;

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
                          <Image
                            src={imgUrl}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 200px"
                            className="object-contain p-3"
                            unoptimized={imgUrl.includes("placehold.co")}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">
                        {p.brand}
                      </p>
                      <Link href={`/catalogue/${p.slug}`}>
                        <p className="text-sm font-medium hover:text-primary transition-colors line-clamp-2 mb-3">
                          {p.name}
                        </p>
                      </Link>
                      <Button
                        className="w-full"
                        size="sm"
                        disabled={p.stock === 0 || isAdding}
                        variant={inCart ? "secondary" : "default"}
                        onClick={() => handleAddToCart(p)}
                      >
                        {isAdding ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {p.stock === 0
                          ? "Épuisé"
                          : inCart
                          ? "Dans le panier"
                          : "Ajouter au panier"}
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
                {/* Lignes fixes */}
                {lignesFixees.map(({ label, valeurs }, i) => {
                  const vals = valeurs(produits);
                  const rawValues = vals.map((v) => v.raw);
                  const toutesPareil = rawValues.every((v) => v === rawValues[0]);

                  return (
                    <LigneTableau
                      key={label}
                      label={label}
                      produits={produits}
                      diferente={!toutesPareil}
                      zebra={i % 2 !== 0}
                    >
                      {vals.map((v, j) => (
                        <td key={j} className="p-3 text-sm">
                          {v.node ?? v.text}
                        </td>
                      ))}
                    </LigneTableau>
                  );
                })}

                {/* Séparateur specs */}
                {specKeys.length > 0 && (
                  <div
                    className="grid border-b bg-surface/80"
                    style={{
                      gridTemplateColumns: `180px repeat(${produits.length}, 1fr)`,
                    }}
                  >
                    <div className="p-3 col-span-full">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Spécifications techniques
                      </span>
                    </div>
                  </div>
                )}

                {/* Lignes specs dynamiques */}
                {specKeys.map((cle, i) => {
                  const vals = produits.map((p) => p.specs?.[cle] ?? "-");
                  const toutesPareil = vals.every((v) => v === vals[0]);

                  return (
                    <LigneTableau
                      key={cle}
                      label={cle}
                      produits={produits}
                      diferente={!toutesPareil}
                      zebra={i % 2 !== 0}
                    >
                      {vals.map((val, j) => (
                        <td
                          key={j}
                          className={`p-3 text-sm ${
                            !toutesPareil
                              ? "font-semibold text-primary"
                              : "text-foreground"
                          } ${val === "-" ? "text-muted-foreground" : ""}`}
                        >
                          {val}
                        </td>
                      ))}
                    </LigneTableau>
                  );
                })}

                {specKeys.length === 0 && produits.length > 0 && (
                  <div
                    className="grid border-b"
                    style={{
                      gridTemplateColumns: `180px repeat(${produits.length}, 1fr)`,
                    }}
                  >
                    <div className="p-3 col-span-full text-xs text-muted-foreground italic">
                      Aucune spécification technique renseignée pour ces produits.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function LigneTableau({
  label,
  produits,
  diferente,
  zebra,
  children,
}: {
  label: string;
  produits: ProduitComparateur[];
  diferente: boolean;
  zebra: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid border-b last:border-b-0 ${
        diferente ? "bg-amber-50" : zebra ? "bg-surface/50" : ""
      }`}
      style={{ gridTemplateColumns: `180px repeat(${produits.length}, 1fr)` }}
    >
      <div
        className={`p-3 text-sm font-semibold border-r flex items-center gap-1.5 ${
          diferente ? "text-amber-800 bg-amber-50" : "text-foreground bg-surface/80"
        }`}
      >
        {diferente && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
        {label}
      </div>
      {children}
    </div>
  );
}

export default function ComparateurPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Chargement…
        </div>
      }
    >
      <ComparateurContent />
    </Suspense>
  );
}
