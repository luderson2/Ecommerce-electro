import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RabaisForm from "@/components/admin/RabaisForm";

export default async function AdminEditRabaisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: rabais }, { data: produits }, { data: packs }] = await Promise.all([
    supabase
      .from("discounts")
      .select("id, discount_type, value, starts_at, ends_at, is_active, product_id, pack_id")
      .eq("id", id)
      .single(),
    supabase
      .from("products")
      .select("id, name, brand")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("packs")
      .select("id, name")
      .order("name"),
  ]);

  if (!rabais) notFound();

  const rabaisInitial = {
    id: rabais.id,
    cible_type: (rabais.product_id ? "product" : "pack") as "product" | "pack",
    cible_id: (rabais.product_id ?? rabais.pack_id) as string,
    value: rabais.value,
    starts_at: rabais.starts_at,
    ends_at: rabais.ends_at,
    is_active: rabais.is_active,
  };

  const nomCible = rabais.product_id
    ? (produits ?? []).find((p) => p.id === rabais.product_id)?.name
    : (packs ?? []).find((p) => p.id === rabais.pack_id)?.name;

  return (
    <div className="max-w-xl">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/rabais" className="hover:text-foreground transition-colors">
          Rabais
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium truncate max-w-[280px]">
          {nomCible ?? "Modifier"}
        </span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground mb-8">Modifier le rabais</h1>

      <div className="bg-white rounded-lg border border-border p-6">
        <RabaisForm
          produits={produits ?? []}
          packs={packs ?? []}
          rabais={rabaisInitial}
        />
      </div>
    </div>
  );
}
