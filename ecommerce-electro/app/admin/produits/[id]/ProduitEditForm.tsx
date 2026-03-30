"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { modifierProduit, supprimerProduit } from "@/lib/actions/produits";
import { slugify } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface Props {
  produit: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    brand: string;
    stock: number;
    is_active: boolean;
  };
}

export default function ProduitEditForm({ produit }: Props) {
  const [state, formAction, isPending] = useActionState(modifierProduit, null);
  const [slug, setSlug] = useState(produit.slug);
  const [isActive, setIsActive] = useState(produit.is_active);
  const [confirmerSuppr, setConfirmerSuppr] = useState(false);

  function handleNomChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value));
  }

  return (
    <div className="space-y-8">

      {/* ── Formulaire modifier ── */}
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={produit.id} />

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
            id="name"
            name="name"
            required
            defaultValue={produit.name}
            onChange={handleNomChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">
            Slug (URL)
            <span className="text-muted-foreground text-xs font-normal ml-2">— généré automatiquement</span>
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-surface text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono transition-colors"
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
            defaultValue={produit.description ?? ""}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
          />
        </div>

        {/* Prix + Marque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
              Prix (CAD) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">$</span>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={produit.price}
                className="w-full pl-7 pr-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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
              defaultValue={produit.brand}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Stock */}
        <div className="sm:w-1/2">
          <label htmlFor="stock" className="block text-sm font-medium text-foreground mb-1.5">
            Stock <span className="text-red-500">*</span>
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={produit.stock}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Toggle is_active */}
        <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Produit actif</p>
            <p className="text-xs text-muted-foreground mt-0.5">Visible sur le catalogue public</p>
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
            {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          <Link
            href="/admin/produits"
            className="px-6 py-2 rounded-md text-sm font-medium text-foreground border border-border hover:bg-surface transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>

      {/* ── Zone suppression ── */}
      <div className="border border-red-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 bg-red-50">
          <h3 className="text-sm font-semibold text-red-700">Zone de danger</h3>
          <p className="text-xs text-red-600 mt-0.5">
            La suppression est irréversible. Les commandes liées à ce produit ne seront pas supprimées.
          </p>
        </div>
        <div className="px-5 py-4 bg-white">
          {!confirmerSuppr ? (
            <button
              type="button"
              onClick={() => setConfirmerSuppr(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Supprimer ce produit
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-700">
                Confirmer la suppression ?
              </p>
              <div className="flex items-center gap-3">
                <form action={supprimerProduit}>
                  <input type="hidden" name="id" value={produit.id} />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
                  >
                    Oui, supprimer définitivement
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setConfirmerSuppr(false)}
                  className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded-md hover:bg-surface transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
