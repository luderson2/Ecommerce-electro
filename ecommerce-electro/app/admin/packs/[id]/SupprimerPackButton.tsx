"use client";

import { useActionState } from "react";
import { supprimerPack } from "@/lib/actions/packs";
import { Trash2 } from "lucide-react";

export default function SupprimerPackButton({ id, nom }: { id: string; nom: string }) {
  const [state, formAction, isPending] = useActionState(supprimerPack, null);

  if (state?.error) {
    return (
      <span className="text-xs text-red-600 max-w-[200px] text-right">{state.error}</span>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Supprimer le pack "${nom}" ?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 size={12} />
        {isPending ? "…" : "Supprimer"}
      </button>
    </form>
  );
}
