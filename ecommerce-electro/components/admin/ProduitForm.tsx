"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { creerProduit } from "@/lib/actions/produits";
import { slugify } from "@/lib/utils";

const initialState = null;

export default function ProduitForm() {
  const [state, formAction, isPending] = useActionState(creerProduit, initialState);
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const nameRef = useRef<HTMLInputElement>(null);

  function handleNomChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value));
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Erreur globale */}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {/* Nom */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
          Nom du produit <span className="text-red-500">*</span>
        </label>
        <input
          ref={nameRef}
          id="name"
          name="name"
          required
          onChange={handleNomChange}
          placeholder="Ex: Réfrigérateur LG 30po Portes Françaises"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">
          Slug (URL)
          <span className="text-muted text-xs font-normal ml-2">— généré automatiquement</span>
        </label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="refrigerateur-lg-portes-francaises"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-surface text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono transition-colors"
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
          rows={4}
          placeholder="Description du produit, caractéristiques principales..."
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
        />
      </div>

      {/* Prix + Marque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
            Prix (CAD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm select-none">
              $
            </span>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-foreground mb-1.5">
            Marque <span className="text-red-500">*</span>
          </label>
          <input
            id="brand"
            name="brand"
            required
            placeholder="Ex: LG, Samsung, Whirlpool"
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Stock */}
      <div className="sm:w-1/2">
        <label htmlFor="stock" className="block text-sm font-medium text-foreground mb-1.5">
          Stock initial <span className="text-red-500">*</span>
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          required
          defaultValue={0}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Champ caché pour is_active */}
      <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />

      {/* Toggle is_active */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Produit actif</p>
          <p className="text-xs text-muted mt-0.5">
            Le produit sera visible sur le catalogue public
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
          className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Enregistrement…" : "Créer le produit"}
        </button>
        <a
          href="/admin/produits"
          className="px-6 py-2 rounded-md text-sm font-medium text-foreground border border-border hover:bg-surface transition-colors"
        >
          Annuler
        </a>
      </div>
    </form>
  );
}
