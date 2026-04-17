"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface ProduitSimple {
  id: string;
  name: string;
  brand: string;
}

interface AccessoiresSectionProps {
  productId: string;
  allProducts: ProduitSimple[];
  initialAccessoryIds: string[];
}

export default function AccessoiresSection({
  productId,
  allProducts,
  initialAccessoryIds,
}: AccessoiresSectionProps) {
  const [accessoryIds, setAccessoryIds] = useState<string[]>(initialAccessoryIds);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // Produits déjà sélectionnés comme accessoires
  const selectedProducts = useMemo(
    () => allProducts.filter((p) => accessoryIds.includes(p.id)),
    [allProducts, accessoryIds]
  );

  // Produits disponibles (hors produit courant, hors déjà sélectionnés, filtrés par recherche)
  const availableProducts = useMemo(() => {
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.id !== productId &&
        !accessoryIds.includes(p.id) &&
        (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
    );
  }, [allProducts, accessoryIds, productId, search]);

  const addAccessory = async (accessoryId: string) => {
    setLoadingId(accessoryId);
    setError(null);

    const { error } = await supabase
      .from("product_accessories")
      .insert({ product_id: productId, accessory_id: accessoryId });

    if (error) {
      setError("Impossible d&apos;ajouter cet accessoire.");
    } else {
      setAccessoryIds((prev) => [...prev, accessoryId]);
      setSearch("");
    }

    setLoadingId(null);
  };

  const removeAccessory = async (accessoryId: string) => {
    setLoadingId(accessoryId);
    setError(null);

    const { error } = await supabase
      .from("product_accessories")
      .delete()
      .eq("product_id", productId)
      .eq("accessory_id", accessoryId);

    if (error) {
      setError("Impossible de retirer cet accessoire.");
    } else {
      setAccessoryIds((prev) => prev.filter((id) => id !== accessoryId));
    }

    setLoadingId(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Accessoires associés</h3>
        <p className="text-xs text-muted-foreground">
          Produits suggérés en complément de celui-ci sur la fiche produit.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
          {error}
        </div>
      )}

      {/* Accessoires sélectionnés */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((p) => (
            <div
              key={p.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm"
            >
              <span className="font-medium">{p.name}</span>
              <span className="text-primary/60 text-xs">{p.brand}</span>
              <button
                type="button"
                onClick={() => removeAccessory(p.id)}
                disabled={loadingId === p.id}
                className="hover:text-destructive transition-colors ml-0.5 disabled:opacity-50"
                aria-label={`Retirer ${p.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recherche + liste déroulante */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit à associer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        {search.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
            {availableProducts.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Aucun résultat pour &ldquo;{search}&rdquo;
              </p>
            ) : (
              availableProducts.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addAccessory(p.id)}
                  disabled={loadingId === p.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
                >
                  <span className="font-medium truncate">{p.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{p.brand}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedProducts.length === 0 && search.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Aucun accessoire associé. Utilisez la recherche ci-dessus pour en ajouter.
        </p>
      )}
    </div>
  );
}
