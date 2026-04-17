import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProduitForm from "@/components/admin/ProduitForm";
import ImageSection from "@/components/admin/ImageSection";
import CategoriesSection from "@/components/admin/CategoriesSection";
import SpecsSection from "@/components/admin/SpecsSection";
import AccessoiresSection from "@/components/admin/AccessoiresSection";
import SupprimerProduitButton from "./SupprimerProduitButton";

export const dynamic = "force-dynamic";

export default async function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: produit },
    { data: images },
    { data: allCategories },
    { data: productCategories },
    { data: allProducts },
    { data: accessories },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, description, price, brand, stock, is_active, specs")
      .eq("id", id)
      .single(),
    supabase
      .from("product_images")
      .select("id, url, sort_order")
      .eq("product_id", id)
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id, name, parent_id")
      .order("name"),
    supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", id),
    supabase
      .from("products")
      .select("id, name, brand")
      .eq("is_active", true)
      .neq("id", id)
      .order("name"),
    supabase
      .from("product_accessories")
      .select("accessory_id")
      .eq("product_id", id),
  ]);

  if (!produit) notFound();

  const initialCategoryIds = (productCategories ?? []).map((r) => r.category_id);
  const initialAccessoryIds = (accessories ?? []).map((r) => r.accessory_id);
  const initialSpecs: Record<string, string> = produit.specs ?? {};

  return (
    <div className="max-w-2xl">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/produits" className="hover:text-foreground transition-colors">
          Produits
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium truncate">{produit.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modifier le produit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Les champs marqués <span className="text-red-500">*</span> sont obligatoires.
          </p>
        </div>
        <SupprimerProduitButton id={produit.id} nom={produit.name} />
      </div>

      {/* 1 — Informations de base */}
      <Section title="Informations générales">
        <ProduitForm produit={produit} />
      </Section>

      {/* 2 — Images */}
      <Section title="Images">
        <ImageSection productId={produit.id} initialImages={images ?? []} />
      </Section>

      {/* 3 — Catégories */}
      <Section title="Catégories">
        <CategoriesSection
          productId={produit.id}
          allCategories={allCategories ?? []}
          initialCategoryIds={initialCategoryIds}
        />
      </Section>

      {/* 4 — Specs techniques */}
      <Section title="Spécifications techniques">
        <SpecsSection productId={produit.id} initialSpecs={initialSpecs} />
      </Section>

      {/* 5 — Accessoires */}
      <Section title="Accessoires">
        <AccessoiresSection
          productId={produit.id}
          allProducts={allProducts ?? []}
          initialAccessoryIds={initialAccessoryIds}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-border p-6 mt-6 first:mt-0">
      <h2 className="text-base font-semibold text-foreground mb-5 pb-3 border-b border-border">
        {title}
      </h2>
      {children}
    </div>
  );
}
