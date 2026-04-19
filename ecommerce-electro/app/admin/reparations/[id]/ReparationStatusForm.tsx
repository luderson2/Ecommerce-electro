"use client";

import { useActionState } from "react";
import { changerStatutReparation } from "@/lib/actions/reparation";
import type { ReparationStatus } from "@/types";

const STATUTS: { value: ReparationStatus; label: string }[] = [
  { value: "nouveau", label: "Nouveau" },
  { value: "contacte", label: "Contacté" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "annule", label: "Annulé" },
];

export default function ReparationStatusForm({
  demandeId,
  statutActuel,
  notesActuelles,
}: {
  demandeId: string;
  statutActuel: ReparationStatus;
  notesActuelles: string | null;
}) {
  const [state, formAction, isPending] = useActionState(changerStatutReparation, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={demandeId} />

      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          Statut mis à jour.
        </p>
      )}

      <select
        name="statut"
        defaultValue={statutActuel}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {STATUTS.map((statut) => (
          <option key={statut.value} value={statut.value}>
            {statut.label}
          </option>
        ))}
      </select>

      <textarea
        name="notes_admin"
        defaultValue={notesActuelles ?? ""}
        rows={5}
        placeholder="Notes internes"
        className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {isPending ? "Enregistrement..." : "Mettre à jour"}
      </button>
    </form>
  );
}
