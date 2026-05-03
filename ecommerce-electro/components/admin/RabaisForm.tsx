"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { creerRabais, modifierRabais } from "@/lib/actions/rabais";

type Produit = { id: string; name: string; brand: string };
type Pack = { id: string; name: string };

type RabaisInitial = {
  id: string;
  cible_type: "product" | "pack";
  cible_id: string;
  value: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

type Props = {
  produits: Produit[];
  packs: Pack[];
  rabais?: RabaisInitial;
};

const inputClass =
  "w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function RabaisForm({ produits, packs, rabais }: Props) {
  const isEdit = !!rabais;
  const action = isEdit ? modifierRabais : creerRabais;
  const [state, formAction, isPending] = useActionState(action, null);

  const [cibleType, setCibleType] = useState<"product" | "pack">(rabais?.cible_type ?? "product");
  const [cibleId, setCibleId] = useState(rabais?.cible_id ?? "");
  const [sansDateFin, setSansDateFin] = useState(!rabais?.ends_at);
  const [isActive, setIsActive] = useState(rabais?.is_active ?? true);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={rabais.id} />}
      <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {/* Type de cible */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Appliquer sur <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
            cibleType === "product"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-white text-foreground hover:bg-surface"
          }`}>
            <input
              type="radio"
              name="cible_type"
              value="product"
              checked={cibleType === "product"}
              onChange={() => { setCibleType("product"); setCibleId(""); }}
              className="sr-only"
            />
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              cibleType === "product" ? "border-primary" : "border-border"
            }`}>
              {cibleType === "product" && <span className="w-2 h-2 rounded-full bg-primary" />}
            </span>
            <span className="text-sm font-medium">Produit</span>
          </label>
          <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
            cibleType === "pack"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-white text-foreground hover:bg-surface"
          }`}>
            <input
              type="radio"
              name="cible_type"
              value="pack"
              checked={cibleType === "pack"}
              onChange={() => { setCibleType("pack"); setCibleId(""); }}
              className="sr-only"
            />
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              cibleType === "pack" ? "border-primary" : "border-border"
            }`}>
              {cibleType === "pack" && <span className="w-2 h-2 rounded-full bg-primary" />}
            </span>
            <span className="text-sm font-medium">Pack</span>
          </label>
        </div>
      </div>

      {/* Sélecteur produit ou pack */}
      <div>
        <label htmlFor="cible_id_select" className="block text-sm font-medium text-foreground mb-1.5">
          {cibleType === "product" ? "Produit" : "Pack"} <span className="text-red-500">*</span>
        </label>
        <input type="hidden" name="cible_id" value={cibleId} />
        {cibleType === "product" ? (
          <select
            id="cible_id_select"
            value={cibleId}
            onChange={(e) => setCibleId(e.target.value)}
            className={inputClass}
          >
            <option value="">- Choisir un produit -</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.brand})
              </option>
            ))}
          </select>
        ) : (
          <select
            id="cible_id_select"
            value={cibleId}
            onChange={(e) => setCibleId(e.target.value)}
            className={inputClass}
          >
            <option value="">- Choisir un pack -</option>
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Type de rabais (fixé à percentage) */}
      <input type="hidden" name="discount_type" value="percentage" />

      {/* Valeur */}
      <div className="sm:w-1/2">
        <label htmlFor="value" className="block text-sm font-medium text-foreground mb-1.5">
          Valeur du rabais <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="value"
            name="value"
            type="number"
            min="1"
            max="100"
            step="1"
            required
            defaultValue={rabais?.value ?? ""}
            placeholder="Ex : 15"
            className={`${inputClass} pr-8`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
            %
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date de début */}
        <div>
          <label htmlFor="starts_at" className="block text-sm font-medium text-foreground mb-1.5">
            Date de début
            <span className="text-muted-foreground text-xs font-normal ml-1">(optionnel)</span>
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="date"
            defaultValue={toDateInput(rabais?.starts_at ?? null)}
            className={inputClass}
          />
        </div>

        {/* Date de fin */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="ends_at" className="text-sm font-medium text-foreground">
              Date de fin
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sansDateFin}
                onChange={(e) => setSansDateFin(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border accent-primary"
              />
              <span className="text-xs text-muted-foreground">Sans limite</span>
            </label>
          </div>
          <input
            id="ends_at"
            name="ends_at"
            type="date"
            disabled={sansDateFin}
            defaultValue={toDateInput(rabais?.ends_at ?? null)}
            className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        </div>
      </div>

      {/* Toggle is_active */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Rabais actif</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Le rabais sera appliqué immédiatement sur la cible sélectionnée
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
            : isEdit
            ? "Enregistrer les modifications"
            : "Créer le rabais"}
        </button>
        <Link
          href="/admin/rabais"
          className="px-6 py-2 rounded-md text-sm font-medium text-foreground border border-border hover:bg-surface transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
