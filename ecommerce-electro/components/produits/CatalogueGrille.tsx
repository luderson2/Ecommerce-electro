"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard, { type ProduitCarte } from "./ProductCard";

interface CatalogueGrilleProps {
  produits: ProduitCarte[];
}

export default function CatalogueGrille({ produits }: CatalogueGrilleProps) {
  const router = useRouter();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const goToComparateur = () => {
    router.push(`/comparateur?ids=${compareIds.join(",")}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {produits.map((produit) => (
          <ProductCard
            key={produit.id}
            produit={produit}
            onCompareToggle={toggle}
            isInCompare={compareIds.includes(produit.id)}
          />
        ))}
      </div>

      {/* Barre flottante de comparaison */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background rounded-full px-5 py-3 shadow-2xl">
          <GitCompareArrows className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            {compareIds.length} produit{compareIds.length > 1 ? "s" : ""} sélectionné
            {compareIds.length > 1 ? "s" : ""}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={goToComparateur}
            disabled={compareIds.length < 2}
            className="rounded-full text-foreground"
          >
            Comparer
          </Button>
          <button
            onClick={() => setCompareIds([])}
            className="hover:opacity-70 transition-opacity ml-1"
            aria-label="Vider la sélection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
