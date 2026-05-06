"use client";

import { useActionState } from "react";
import { changerStatutCommande } from "@/lib/actions/commandes";
import type { OrderStatus } from "@/types";

const STATUTS: { value: OrderStatus; label: string }[] = [
  { value: "en_attente",     label: "En attente" },
  { value: "payee",          label: "Payée" },
  { value: "en_preparation", label: "En préparation" },
  { value: "livraison",      label: "En livraison" },
  { value: "livree",         label: "Livrée" },
  { value: "annulee",        label: "Annulée" },
];

export default function StatutForm({
  commandeId,
  statutActuel,
}: {
  commandeId: string;
  statutActuel: string;
}) {
  const [state, formAction, isPending] = useActionState(changerStatutCommande, null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={commandeId} />

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
        className="w-full bg-primary text-white py-2 rounded-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        {isPending ? "Enregistrement…" : "Mettre à jour"}
      </button>
    </form>
  );
}
