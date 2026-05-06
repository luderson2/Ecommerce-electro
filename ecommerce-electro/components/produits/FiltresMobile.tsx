"use client";

import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CatalogueFilters from "./CatalogueFilters";

interface Categorie {
  id: string;
  name: string;
  slug: string;
}

interface FiltresActifs {
  categorie?: string;
  marque?: string;
  prix_min?: string;
  prix_max?: string;
  en_stock: boolean;
  washer_type?: "reguliere" | "frontale";
  stove_type?: "ceramique" | "serpentin";
  finish?: "stainless" | "blanc" | "noir";
}

interface Props {
  categories: Categorie[];
  marques: string[];
  filtresActifs: FiltresActifs;
}

export default function FiltresMobile({ categories, marques, filtresActifs }: Props) {
  const hasFilters = !!(
    filtresActifs.categorie ||
    filtresActifs.marque ||
    filtresActifs.prix_min ||
    filtresActifs.prix_max ||
    filtresActifs.en_stock ||
    filtresActifs.washer_type ||
    filtresActifs.stove_type ||
    filtresActifs.finish
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {hasFilters && (
            <span className="h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtres</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <CatalogueFilters
            categories={categories}
            marques={marques}
            filtresActifs={filtresActifs}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
