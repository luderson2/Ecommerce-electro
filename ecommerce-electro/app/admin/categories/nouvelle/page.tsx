import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CategorieForm from "@/components/admin/CategorieForm";

export default function AdminNouvelleCategoriesPage() {
  return (
    <div className="max-w-xl">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/categories" className="hover:text-foreground transition-colors">
          Catégories
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">Nouvelle catégorie</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground mb-8">Nouvelle catégorie</h1>

      <div className="bg-white rounded-lg border border-border p-6">
        <CategorieForm />
      </div>
    </div>
  );
}
