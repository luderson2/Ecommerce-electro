export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CategorieForm from "@/components/admin/CategorieForm";

export default async function AdminEditCategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: categorie } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("id", id)
    .single();

  if (!categorie) notFound();

  return (
    <div className="max-w-xl">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/categories" className="hover:text-foreground transition-colors">
          Catégories
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">{categorie.name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground mb-8">Modifier la catégorie</h1>

      <div className="bg-white rounded-lg border border-border p-6">
        <CategorieForm categorie={categorie} />
      </div>
    </div>
  );
}
