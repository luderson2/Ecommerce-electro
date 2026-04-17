"use client";

import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Categorie {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategoriesSectionProps {
  productId: string;
  allCategories: Categorie[];
  initialCategoryIds: string[];
}

export default function CategoriesSection({
  productId,
  allCategories,
  initialCategoryIds,
}: CategoriesSectionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialCategoryIds);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const toggle = async (categoryId: string) => {
    setLoadingId(categoryId);
    setError(null);

    const isSelected = selectedIds.includes(categoryId);

    if (isSelected) {
      const { error } = await supabase
        .from("product_categories")
        .delete()
        .eq("product_id", productId)
        .eq("category_id", categoryId);

      if (error) {
        setError("Impossible de dissocier la catégorie.");
      } else {
        setSelectedIds((prev) => prev.filter((id) => id !== categoryId));
      }
    } else {
      const { error } = await supabase
        .from("product_categories")
        .insert({ product_id: productId, category_id: categoryId });

      if (error) {
        setError("Impossible d&apos;associer la catégorie.");
      } else {
        setSelectedIds((prev) => [...prev, categoryId]);
      }
    }

    setLoadingId(null);
  };

  const parents = useMemo(
    () => allCategories.filter((c) => !c.parent_id),
    [allCategories]
  );
  const childrenOf = useMemo(
    () => (parentId: string) =>
      allCategories.filter((c) => c.parent_id === parentId),
    [allCategories]
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Catégories</h3>
        <p className="text-xs text-muted-foreground">
          Cliquez sur un badge pour associer ou dissocier ce produit d&apos;une catégorie.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
          {error}
        </div>
      )}

      {allCategories.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Aucune catégorie disponible.{" "}
          <a href="/admin/categories/nouvelle" className="text-primary underline">
            Créer une catégorie
          </a>
        </p>
      ) : (
        <div className="space-y-3">
          {parents.map((parent) => {
            const children = childrenOf(parent.id);
            return (
              <div key={parent.id}>
                {/* Badge catégorie parente */}
                <BadgeButton
                  label={parent.name}
                  selected={selectedIds.includes(parent.id)}
                  loading={loadingId === parent.id}
                  onClick={() => toggle(parent.id)}
                  size="md"
                />

                {/* Sous-catégories */}
                {children.length > 0 && (
                  <div className="ml-5 mt-1.5 flex flex-wrap gap-1.5">
                    {children.map((child) => (
                      <BadgeButton
                        key={child.id}
                        label={child.name}
                        selected={selectedIds.includes(child.id)}
                        loading={loadingId === child.id}
                        onClick={() => toggle(child.id)}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} catégorie{selectedIds.length > 1 ? "s" : ""} associée
          {selectedIds.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function BadgeButton({
  label,
  selected,
  loading,
  onClick,
  size,
}: {
  label: string;
  selected: boolean;
  loading: boolean;
  onClick: () => void;
  size: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 border rounded-full font-medium transition-colors disabled:opacity-50 ${
        size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      } ${
        selected
          ? "bg-primary text-white border-primary"
          : "bg-white text-foreground border-border hover:border-primary/50 hover:bg-surface"
      }`}
    >
      {selected && <Check className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />}
      {label}
    </button>
  );
}
