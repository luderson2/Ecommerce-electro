"use client";

import { useActionState } from "react";
import { changerStatutLivraison } from "@/lib/actions/livraisons";
import type { DeliveryStatus } from "@/types";

const STATUTS: { value: DeliveryStatus; label: string }[] = [
  { value: "planifiee",  label: "Planifiée" },
  { value: "en_transit", label: "En transit" },
  { value: "livree",     label: "Livrée" },
  { value: "echec",      label: "Échec" },
];

export default function StatutLivraisonForm({
  livraisonId,
  statutActuel,
  scheduledDate,
  notes,
}: {
  livraisonId: string;
  statutActuel: string;
  scheduledDate: string | null;
  notes: string | null;
}) {
  const [state, formAction, isPending] = useActionState(changerStatutLivraison, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={livraisonId} />

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
          Livraison mise à jour.
        </p>
      )}

      {/* Statut */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Statut</label>
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
      </div>

      {/* Date prévue */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
          Date de livraison prévue
        </label>
        <input
          type="date"
          name="scheduled_date"
          defaultValue={scheduledDate ?? ""}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
          Notes du livreur
        </label>
        <textarea
          name="notes"
          defaultValue={notes ?? ""}
          rows={3}
          placeholder="Informations supplémentaires…"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

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
