import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProduitForm from "@/components/admin/ProduitForm";

export default function NouveauProduitPage() {
  return (
    <div className="max-w-2xl">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/produits" className="hover:text-foreground transition-colors">
          Produits
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">Nouveau produit</span>
      </nav>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Nouveau produit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Remplissez les informations du produit. Les champs marqués{" "}
          <span className="text-red-500">*</span> sont obligatoires.
        </p>
      </div>

      {/* Carte formulaire */}
      <div className="bg-white rounded-lg border border-border p-6">
        <ProduitForm />
      </div>
    </div>
  );
}
