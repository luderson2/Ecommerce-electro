"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { creerCategorie, modifierCategorie } from "@/lib/actions/categories";
import { slugify } from "@/lib/utils";

type CategorieInitiale = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export default function CategorieForm({ categorie }: { categorie?: CategorieInitiale }) {
  const isEdit = !!categorie;
  const action = isEdit ? modifierCategorie : creerCategorie;

  const [state, formAction, isPending] = useActionState(action, null);
  const [slug, setSlug] = useState(categorie?.slug ?? "");

  function handleNomChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit) setSlug(slugify(e.target.value));
  }

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={categorie.id} />}

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {/* Nom */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={categorie?.name ?? ""}
          onChange={handleNomChange}
          placeholder="Ex: Réfrigération"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">
          Slug (URL)
          <span className="text-muted-foreground text-xs font-normal ml-2">- généré automatiquement</span>
        </label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="refrigeration"
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
          rows={3}
          defaultValue={categorie?.description ?? ""}
          placeholder="Description courte de la catégorie…"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
        />
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
            : isEdit
            ? "Enregistrer les modifications"
            : "Créer la catégorie"}
        </button>
        <Link
          href="/admin/categories"
          className="px-6 py-2 rounded-md text-sm font-medium text-foreground border border-border hover:bg-surface transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
