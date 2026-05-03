"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface Categorie {
  id: string;
  name: string;
  slug: string;
}

interface FiltresActifs {
  categorie?: string;
  marque?: string;
  prix_min?: string;
  prix_max?: string;
  en_stock: boolean;
}

interface Props {
  categories: Categorie[];
  marques: string[];
  filtresActifs: FiltresActifs;
}

export default function CatalogueFilters({ categories, marques, filtresActifs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      startTransition(() => {
        router.push(`/catalogue?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categorie");
    params.delete("marque");
    params.delete("prix_min");
    params.delete("prix_max");
    params.delete("en_stock");
    startTransition(() => {
      router.push(`/catalogue?${params.toString()}`, { scroll: false });
    });
  };

  const hasFilters = !!(
    filtresActifs.categorie ||
    filtresActifs.marque ||
    filtresActifs.prix_min ||
    filtresActifs.prix_max ||
    filtresActifs.en_stock
  );

  return (
    <div className={`bg-white rounded-lg border border-border p-5 space-y-5 transition-opacity ${isPending ? "opacity-60 pointer-events-none" : "opacity-100"}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filtres</h2>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-accent font-semibold hover:underline"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* En stock */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <span className="text-sm font-medium text-foreground">En stock seulement</span>
        <button
          role="switch"
          aria-checked={filtresActifs.en_stock}
          aria-label="Afficher seulement les produits en stock"
          onClick={() => updateParam("en_stock", filtresActifs.en_stock ? null : "1")}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            filtresActifs.en_stock ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              filtresActifs.en_stock ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Catégories */}
      {categories.length > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Catégorie
          </h3>
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => updateParam("categorie", null)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                  !filtresActifs.categorie
                    ? "font-semibold text-primary bg-primary/8"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                Toutes les catégories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() =>
                    updateParam(
                      "categorie",
                      filtresActifs.categorie === cat.slug ? null : cat.slug
                    )
                  }
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                    filtresActifs.categorie === cat.slug
                      ? "font-semibold text-primary bg-primary/8"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Marques */}
      {marques.length > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Marque
          </h3>
          <ul className="space-y-2">
            {marques.map((m) => (
              <li key={m}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filtresActifs.marque === m}
                    onChange={() =>
                      updateParam("marque", filtresActifs.marque === m ? null : m)
                    }
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {m}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prix */}
      <div className="border-t border-border pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Prix (CAD)
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs select-none">
              $
            </span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              defaultValue={filtresActifs.prix_min ?? ""}
              onBlur={(e) => updateParam("prix_min", e.target.value || null)}
              className="w-full pl-6 pr-2 py-1.5 border border-border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <span className="text-muted-foreground text-sm shrink-0">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs select-none">
              $
            </span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              defaultValue={filtresActifs.prix_max ?? ""}
              onBlur={(e) => updateParam("prix_max", e.target.value || null)}
              className="w-full pl-6 pr-2 py-1.5 border border-border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
