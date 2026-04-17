"use client";

import { useActionState, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, X, Star, Loader2, CheckCircle2 } from "lucide-react";
import { creerProduit, modifierProduit } from "@/lib/actions/produits";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

type ProduitInitial = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  brand: string;
  stock: number;
  is_active: boolean;
};

interface Props {
  produit?: ProduitInitial;
  /** UUID pré-généré côté serveur pour la création (permet l'upload avant soumission) */
  productId?: string;
}

export default function ProduitForm({ produit, productId }: Props) {
  const isEdit = !!produit;
  const id = produit?.id ?? productId;
  const action = isEdit ? modifierProduit : creerProduit;

  const [state, formAction, isPending] = useActionState<
    { error?: string; success?: boolean; produitId?: string } | null,
    FormData
  >(action, null);
  const [slug, setSlug] = useState(produit?.slug ?? "");
  const [isActive, setIsActive] = useState(produit?.is_active ?? true);
  const [formKey, setFormKey] = useState(0);

  // â”€â”€ Image upload (création uniquement) â”€â”€
  const [uploadedImages, setUploadedImages] = useState<{ url: string; path: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  // Réinitialiser le formulaire après une création réussie
  useEffect(() => {
    if (!isEdit && state?.success) {
      setSlug("");
      setIsActive(true);
      setUploadedImages([]);
      setUploadError(null);
      setFormKey((k) => k + 1);
    }
  }, [state?.success, isEdit]);

  function handleNomChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit) setSlug(slugify(e.target.value));
  }

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !id) return;
      setIsUploading(true);
      setUploadError(null);

      try {
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) {
            setUploadError(`${file.name} n'est pas une image valide.`);
            continue;
          }
          if (file.size > 5 * 1024 * 1024) {
            setUploadError(`${file.name} dépasse la limite de 5 Mo.`);
            continue;
          }

          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: storageError } = await supabase.storage
            .from("products")
            .upload(path, file, { upsert: false });

          if (storageError) {
            setUploadError(`Erreur d'envoi : ${storageError.message}`);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
          setUploadedImages((prev) => [...prev, { url: publicUrl, path }]);
        }
      } catch (err: unknown) {
        setUploadError(`Erreur inattendue : ${err instanceof Error ? err.message : "inconnue"}`);
      } finally {
        e.target.value = "";
        setIsUploading(false);
      }
    },
    [id, supabase]
  );

  const handleRemoveImage = useCallback(
    async (path: string) => {
      await supabase.storage.from("products").remove([path]);
      setUploadedImages((prev) => prev.filter((img) => img.path !== path));
    },
    [supabase]
  );

  return (
    <form key={formKey} action={formAction} className="space-y-6">
      {/* Champs cachés */}
      {isEdit && <input type="hidden" name="id" value={produit.id} />}
      {!isEdit && id && <input type="hidden" name="id" value={id} />}
      {/* URLs des images uploadées transmises à l'action */}
      {!isEdit && uploadedImages.map((img, i) => (
        <input key={i} type="hidden" name="image_url" value={img.url} />
      ))}

      {!isEdit && state?.success && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
          <div>
            <p className="font-medium">Produit créé avec succès !</p>
            <p className="text-green-700 mt-0.5">
              Vous pouvez créer un autre produit ou{" "}
              <Link href={`/admin/produits/${state.produitId}`} className="underline font-medium">
                modifier ce produit
              </Link>.
            </p>
          </div>
        </div>
      )}

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {/* â”€â”€ Nom â”€â”€ */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
          Nom du produit <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={produit?.name ?? ""}
          onChange={handleNomChange}
          placeholder="Ex : Réfrigérateur LG 30 po Portes Françaises"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* â”€â”€ Slug â”€â”€ */}
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
          placeholder="refrigerateur-lg-portes-francaises"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-surface text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono transition-colors"
        />
      </div>

      {/* â”€â”€ Description â”€â”€ */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={produit?.description ?? ""}
          placeholder="Description du produit, caractéristiques principales…"
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
        />
      </div>

      {/* â”€â”€ Prix + Marque â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
            Prix (CAD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">$</span>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={produit?.price ?? ""}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-foreground mb-1.5">
            Marque <span className="text-red-500">*</span>
          </label>
          <input
            id="brand"
            name="brand"
            required
            defaultValue={produit?.brand ?? ""}
            placeholder="Ex : LG, Samsung, Whirlpool"
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* â”€â”€ Stock â”€â”€ */}
      <div className="sm:w-1/2">
        <label htmlFor="stock" className="block text-sm font-medium text-foreground mb-1.5">
          Stock <span className="text-red-500">*</span>
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          required
          defaultValue={produit?.stock ?? 0}
          className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* â”€â”€ Toggle actif â”€â”€ */}
      <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Produit actif</p>
          <p className="text-xs text-muted-foreground mt-0.5">Visible sur le catalogue public</p>
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

      {/* â”€â”€ Upload images (création uniquement) â”€â”€ */}
      {!isEdit && id && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-0.5">
              Images du produit
            </p>
            <p className="text-xs text-muted-foreground">
              La première image sera l&apos;image principale dans le catalogue. D&apos;autres images pourront être ajoutées après création.
            </p>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
              {uploadError}
            </div>
          )}

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {uploadedImages.map((img, index) => (
                <div
                  key={img.path}
                  className="relative group aspect-square bg-surface rounded-lg border border-border overflow-hidden"
                >
                  <Image
                    src={img.url}
                    alt={`Image ${index + 1}`}
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                    unoptimized
                  />
                  {index === 0 && (
                    <div className="absolute top-1 left-1 flex items-center gap-1 bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      <Star className="h-2.5 w-2.5" />
                      Principale
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.path)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-white rounded-full p-0.5 hover:bg-red-700"
                    aria-label="Supprimer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-7 cursor-pointer transition-colors ${
              isUploading
                ? "border-primary/40 bg-primary/5 cursor-not-allowed"
                : "border-border hover:border-primary/40 hover:bg-surface"
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || isPending}
            />
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isUploading ? "Envoi en cours…" : "Cliquez pour ajouter des images"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, WebP · max 5 Mo par fichier
              </p>
            </div>
          </label>
        </div>
      )}

      {/* â”€â”€ Actions â”€â”€ */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending
            ? "Enregistrement…"
            : isEdit
            ? "Enregistrer les modifications"
            : "Créer le produit"}
        </button>
        <Link
          href="/admin/produits"
          className="px-6 py-2 rounded-md text-sm font-medium text-foreground border border-border hover:bg-surface transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
