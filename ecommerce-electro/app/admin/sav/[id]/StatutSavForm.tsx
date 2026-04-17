"use client";

import { useActionState } from "react";
import { changerStatutSAV } from "@/lib/actions/sav";
import type { SavStatus } from "@/types";

const STATUTS: { value: SavStatus; label: string }[] = [
  { value: "ouvert",   label: "Ouvert" },
  { value: "en_cours", label: "En cours" },
  { value: "resolu",   label: "Résolu" },
  { value: "ferme",    label: "Fermé" },
];

export default function StatutSavForm({
  demandeId,
  statutActuel,
}: {
  demandeId: string;
  statutActuel: string;
}) {
  const [state, formAction, isPending] = useActionState(changerStatutSAV, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={demandeId} />

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
          Statut mis à jour.
        </p>
      )}

      <select
        name="statut"
        defaultValue={statutActuel}
        className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        {STATUTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-2 rounded-md text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 transition-colors"
      >
        {isPending ? "Enregistrement…" : "Mettre à jour"}
      </button>
    </form>
  );
}
