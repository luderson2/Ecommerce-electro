"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { X, Plus } from "lucide-react";
import { creerPack, modifierPack } from "@/lib/actions/packs";

type Produit = { id: string; name: string; brand: string };

type Props = {
  mode: "creation" | "edition";
  packId?: string;
  defaultValues?: {
    name?: string;
    description?: string;
    price?: number;
    is_active?: boolean;
  };
  produitsDisponibles: Produit[];
  produitsInitiaux?: Produit[];
};

export default function PackForm({
  mode,
  packId,
  defaultValues,
  produitsDisponibles,
  produitsInitiaux = [],
}: Props) {
  const action = mode === "creation" ? creerPack : modifierPack;
  const [state, formAction, isPending] = useActionState(action, null);

  const [isActive, setIsActive] = useState(defaultValues?.is_active ?? true);
  const [produitsSelectionnes, setProduitsSelectionnes] = useState<Produit[]>(produitsInitiaux);
  const [selectValue, setSelectValue] = useState("");

  const produitsRestants = produitsDisponibles.filter(
    (p) => !produitsSelectionnes.some((s) => s.id === p.id)
  );

  function ajouterProduit(id: string) {
    const produit = produitsDisponibles.find((p) => p.id === id);
    if (produit) {
      setProduitsSelectionnes((prev) => [...prev, produit]);
      setSelectValue("");
    }
  }

  function retirerProduit(id: string) {
    setProduitsSelectionnes((prev) => prev.filter((p) => p.id !== id));
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edition" && <input type="hidden" name="id" value={packId} />}

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {/* Nom */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
          Nom du pack <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="Ex: Duo Laveuse & Sécheuse LG"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          placeholder="Description du pack, avantages..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Prix */}
      <div className="sm:w-1/2">
        <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
          Prix (CAD) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
            $
          </span>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.price}
            placeholder="0.00"
            className={`${inputClass} pl-7`}
          />
        </div>
      </div>

      {/* Sélecteur de produits */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Produits inclus
        </label>

        {/* Champs cachés pour les produits sélectionnés */}
        {produitsSelectionnes.map((p) => (
          <input key={p.id} type="hidden" name="product_ids" value={p.id} />
        ))}

        {/* Liste des produits sélectionnés */}
        {produitsSelectionnes.length > 0 && (
          <div className="mb-3 space-y-2">
            {produitsSelectionnes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2 bg-primary/5 border border-primary/20 rounded-md"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <button
                  type="button"
                  onClick={() => retirerProduit(p.id)}
                  className="ml-3 shrink-0 p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
                  title="Retirer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dropdown pour ajouter */}
        {produitsRestants.length > 0 ? (
          <div className="flex gap-2">
            <select
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              className={`${inputClass} flex-1`}
            >
              <option value="">- Choisir un produit à ajouter -</option>
              {produitsRestants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => selectValue && ajouterProduit(selectValue)}
              disabled={!selectValue}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Plus size={14} />
              Ajouter
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Tous les produits disponibles sont déjà sélectionnés.
          </p>
        )}
      </div>

      {/* Toggle is_active */}
      <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Pack actif</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Le pack sera visible sur le catalogue public
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          role="switch"
          aria-checked={isActive}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            isActive ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? "Enregistrement…"
            : mode === "creation"
            ? "Créer le pack"
            : "Enregistrer les modifications"}
        </button>
        <Link
          href="/admin/packs"
          className="px-6 py-2 rounded-md text-sm font-medium text-foreground border border-border hover:bg-surface transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
