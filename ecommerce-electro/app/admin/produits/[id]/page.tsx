import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProduitEditForm from "./ProduitEditForm";

export default async function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, brand, stock, is_active")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="max-w-2xl space-y-6">

      {/* En-tête */}
      <div>
        <Link
          href="/admin/produits"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Modifier le produit</h1>
        <p className="text-xs text-muted font-mono mt-0.5">{data.id}</p>
      </div>

      <ProduitEditForm produit={data} />
    </div>
  );
}
