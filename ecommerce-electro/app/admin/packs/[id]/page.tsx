export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PackForm from "@/components/admin/PackForm";
import SupprimerPackButton from "./SupprimerPackButton";

type PackDetail = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  pack_products: {
    products: { id: string; name: string; brand: string } | null;
  }[];
};

export default async function EditPackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: packRaw }, { data: produits }] = await Promise.all([
    supabase
      .from("packs")
      .select("id, name, description, price, is_active, pack_products(products(id, name, brand))")
      .eq("id", id)
      .single(),
    supabase
      .from("products")
      .select("id, name, brand")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (!packRaw) notFound();
  const pack = packRaw as unknown as PackDetail;

  const produitsInitiaux = pack.pack_products
    .map((pp) => pp.products)
    .filter((p): p is { id: string; name: string; brand: string } => p !== null);

  return (
    <div className="max-w-2xl">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/packs" className="hover:text-foreground transition-colors">
          Packs
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium truncate">{pack.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modifier le pack</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Les champs marqués <span className="text-red-500">*</span> sont obligatoires.
          </p>
        </div>
        <SupprimerPackButton id={pack.id} nom={pack.name} />
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <PackForm
          mode="edition"
          packId={pack.id}
          defaultValues={{
            name: pack.name,
            description: pack.description ?? undefined,
            price: pack.price,
            is_active: pack.is_active,
          }}
          produitsDisponibles={produits ?? []}
          produitsInitiaux={produitsInitiaux}
        />
      </div>
    </div>
  );
}
