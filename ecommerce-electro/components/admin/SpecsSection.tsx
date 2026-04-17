"use client";

import { useState, useMemo } from "react";
import { Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface Spec {
  cle: string;
  valeur: string;
}

const SUGGESTIONS = [
  "Capacité",
  "Classe énergie",
  "Dimensions",
  "Poids",
  "Couleur",
  "Garantie",
  "Puissance",
  "Voltage",
  "Wi-Fi",
  "Bluetooth",
  "Marque",
];

interface SpecsSectionProps {
  productId: string;
  initialSpecs: Record<string, string>;
}

export default function SpecsSection({ productId, initialSpecs }: SpecsSectionProps) {
  const [specs, setSpecs] = useState<Spec[]>(
    Object.entries(initialSpecs).map(([cle, valeur]) => ({ cle, valeur }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const addSpec = () => {
    setSpecs((prev) => [...prev, { cle: "", valeur: "" }]);
    setSaved(false);
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const updateSpec = (index: number, field: "cle" | "valeur", value: string) => {
    setSpecs((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );
    setSaved(false);
  };

  const save = async () => {
    setIsSaving(true);
    setError(null);

    // Build JSONB object - skip lines with empty key
    const specsObj: Record<string, string> = {};
    for (const { cle, valeur } of specs) {
      if (cle.trim()) {
        specsObj[cle.trim()] = valeur.trim();
      }
    }

    const { error } = await supabase
      .from("products")
      .update({ specs: specsObj })
      .eq("id", productId);

    if (error) {
      setError("Impossible de sauvegarder les specs. Vérifiez que la colonne specs existe.");
    } else {
      setSaved(true);
      // Clean up empty lines after save
      setSpecs(Object.entries(specsObj).map(([cle, valeur]) => ({ cle, valeur })));
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">
          Spécifications techniques
        </h3>
        <p className="text-xs text-muted-foreground">
          Chaque ligne est une paire clé / valeur (ex : &ldquo;Capacité&rdquo; → &ldquo;28 pi³&rdquo;).
          Utilisée dans le comparateur.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
          {error}
        </div>
      )}

      {/* Suggestions de clés */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              if (!specs.find((sp) => sp.cle === s)) {
                setSpecs((prev) => [...prev, { cle: s, valeur: "" }]);
                setSaved(false);
              }
            }}
            disabled={!!specs.find((sp) => sp.cle === s)}
            className="px-2 py-0.5 text-xs border border-dashed border-border rounded-full text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + {s}
          </button>
        ))}
      </div>

      {/* Lignes de specs */}
      <div className="space-y-2">
        {specs.map((spec, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Clé (ex: Capacité)"
              value={spec.cle}
              onChange={(e) => updateSpec(index, "cle", e.target.value)}
              className="flex-1 h-8 text-sm"
            />
            <span className="text-muted-foreground text-sm shrink-0">→</span>
            <Input
              placeholder="Valeur (ex: 28 pi³)"
              value={spec.valeur}
              onChange={(e) => updateSpec(index, "valeur", e.target.value)}
              className="flex-1 h-8 text-sm"
            />
            <button
              type="button"
              onClick={() => removeSpec(index)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              aria-label="Supprimer cette spec"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {specs.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Aucune spec. Cliquez sur un raccourci ci-dessus ou ajoutez une ligne.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSpec}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une spec
        </Button>

        {specs.length > 0 && (
          <Button
            type="button"
            size="sm"
            onClick={save}
            disabled={isSaving}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Sauvegarde…" : saved ? "Sauvegardé âœ“" : "Sauvegarder les specs"}
          </Button>
        )}
      </div>
    </div>
  );
}
