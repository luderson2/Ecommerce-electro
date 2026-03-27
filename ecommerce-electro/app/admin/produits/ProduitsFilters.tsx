"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";

interface Props {
  marques: string[];
  filtresActifs: {
    q?: string;
    marque?: string;
    statut?: string;
    stock?: string;
  };
}

const STATUTS = [
  { value: "",        label: "Tous" },
  { value: "actif",   label: "Actifs" },
  { value: "inactif", label: "Inactifs" },
];

const STOCKS = [
  { value: "",       label: "Tous" },
  { value: "faible", label: "Stock faible" },
  { value: "epuise", label: "Épuisés" },
];

export default function ProduitsFilters({ marques, filtresActifs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      startTransition(() => router.push(`/admin/produits?${params.toString()}`));
    },
    [router, searchParams]
  );

  const hasFilters = !!(filtresActifs.q || filtresActifs.marque || filtresActifs.statut || filtresActifs.stock);

  return (
    <div className="bg-white border border-border rounded-lg p-4 mb-5 space-y-4">
      <div className="flex flex-wrap gap-3 items-end">

        {/* Recherche */}
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Recherche
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nom du produit…"
              defaultValue={filtresActifs.q ?? ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
              }}
              onBlur={(e) => update("q", e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Marque */}
        <div className="min-w-36">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Marque
          </label>
          <select
            value={filtresActifs.marque ?? ""}
            onChange={(e) => update("marque", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            <option value="">Toutes</option>
            {marques.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Statut
          </label>
          <div className="flex gap-1">
            {STATUTS.map((s) => (
              <button
                key={s.value}
                onClick={() => update("statut", s.value)}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors border ${
                  (filtresActifs.statut ?? "") === s.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:bg-surface"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Stock
          </label>
          <div className="flex gap-1">
            {STOCKS.map((s) => (
              <button
                key={s.value}
                onClick={() => update("stock", s.value)}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors border ${
                  (filtresActifs.stock ?? "") === s.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:bg-surface"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={() => router.push("/admin/produits")}
            className="px-3 py-2 text-xs font-semibold text-accent hover:underline self-end"
          >
            Tout effacer
          </button>
        )}
      </div>
    </div>
  );
}
