"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { Upload, X, GripVertical, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageItem {
  id: string;
  url: string;
  sort_order: number;
}

interface ImageSectionProps {
  productId: string;
  initialImages: ImageItem[];
}

export default function ImageSection({ productId, initialImages }: ImageSectionProps) {
  const [images, setImages] = useState<ImageItem[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const handleUpload = useCallback(
    async (files: FileList) => {
      setIsUploading(true);
      setError(null);

      const newImages: ImageItem[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} n&apos;est pas une image valide.`);
          continue;
        }

        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, file, { upsert: false });

        if (uploadError) {
          setError(`Erreur lors de l&apos;envoi : ${uploadError.message}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(path);

        const sortOrder = images.length + newImages.length;

        const { data: imageData, error: insertError } = await supabase
          .from("product_images")
          .insert({ product_id: productId, url: publicUrl, sort_order: sortOrder })
          .select("id, url, sort_order")
          .single();

        if (insertError || !imageData) {
          setError(`Erreur lors de l&apos;enregistrement.`);
          await supabase.storage.from("products").remove([path]);
          continue;
        }

        newImages.push(imageData as ImageItem);
      }

      setImages((prev) => [...prev, ...newImages]);
      setIsUploading(false);
    },
    [images, productId, supabase]
  );

  const handleDelete = useCallback(
    async (image: ImageItem) => {
      const path = image.url.split("/storage/v1/object/public/products/")[1];
      if (path) {
        await supabase.storage.from("products").remove([path]);
      }

      await supabase.from("product_images").delete().eq("id", image.id);

      const remaining = images.filter((i) => i.id !== image.id);
      const reordered = remaining.map((img, idx) => ({ ...img, sort_order: idx }));
      setImages(reordered);

      await Promise.all(
        reordered.map((img) =>
          supabase
            .from("product_images")
            .update({ sort_order: img.sort_order })
            .eq("id", img.id)
        )
      );
    },
    [images, supabase]
  );

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOver.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null) return;
    if (dragItem.current === dragOver.current) {
      dragItem.current = null;
      dragOver.current = null;
      return;
    }

    const reordered = [...images];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOver.current, 0, dragged);

    const updated = reordered.map((img, idx) => ({ ...img, sort_order: idx }));
    setImages(updated);

    dragItem.current = null;
    dragOver.current = null;

    await Promise.all(
      updated.map((img) =>
        supabase
          .from("product_images")
          .update({ sort_order: img.sort_order })
          .eq("id", img.id)
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Images du produit</h3>
        <p className="text-xs text-muted-foreground">
          Glissez pour réordonner. La première image est l&apos;image principale affichée dans le catalogue.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="relative group aspect-square bg-surface rounded-lg border border-border overflow-hidden cursor-grab active:cursor-grabbing select-none"
            >
              <Image
                src={img.url}
                alt={`Image ${index + 1}`}
                fill
                sizes="150px"
                className="object-contain p-2 pointer-events-none"
              />

              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  <Star className="h-2.5 w-2.5" />
                  Principale
                </div>
              )}

              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/80 backdrop-blur-sm rounded p-0.5 shadow-sm">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(img)}
                className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-white rounded-full p-0.5 hover:bg-red-700"
                aria-label="Supprimer l&apos;image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-8 cursor-pointer transition-colors ${
          isUploading
            ? "border-primary/40 bg-primary/5 cursor-not-allowed"
            : "border-border hover:border-primary/40 hover:bg-surface"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          disabled={isUploading}
        />
        <Upload
          className={`h-7 w-7 ${
            isUploading ? "text-primary animate-pulse" : "text-muted-foreground"
          }`}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isUploading ? "Envoi en cours…" : "Cliquez pour ajouter des images"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            PNG, JPG, WebP - plusieurs fichiers acceptés
          </p>
        </div>
      </label>
    </div>
  );
}
