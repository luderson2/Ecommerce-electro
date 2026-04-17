"use client";

import { useActionState } from "react";
import { supprimerCategorie } from "@/lib/actions/categories";
import { Trash2 } from "lucide-react";

export default function SupprimerCategorieButton({
  id,
  nom,
  nbProduits,
}: {
  id: string;
  nom: string;
  nbProduits: number;
}) {
  const [state, formAction, isPending] = useActionState(supprimerCategorie, null);

  if (state?.error) {
    return (
      <span className="text-xs text-red-600 max-w-[200px] text-right">
        {state.error}
      </span>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Supprimer la catégorie "${nom}" ?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending || nbProduits > 0}
        title={nbProduits > 0 ? `${nbProduits} produit(s) lié(s)` : "Supprimer"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 size={12} />
        {isPending ? "…" : "Supprimer"}
      </button>
    </form>
  );
}
