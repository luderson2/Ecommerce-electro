import ComparateurClient, { type ProduitComparateur } from "./ComparateurClient";
import { createClient } from "@/lib/supabase/server";

type ComparateurPageProps = {
  searchParams: Promise<{ ids?: string }>;
};

export default async function ComparateurPage({ searchParams }: ComparateurPageProps) {
  const { ids } = await searchParams;
  const requestedIds = ids
    ? ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, brand, price, stock, description, specs, product_images(url, sort_order)")
    .eq("is_active", true)
    .order("name");

  const produitsDisponibles = (data ?? []) as ProduitComparateur[];
  const availableIds = new Set(produitsDisponibles.map((p) => p.id));
  const initialIds =
    ids !== undefined
      ? requestedIds.filter((id) => availableIds.has(id))
      : produitsDisponibles.slice(0, 2).map((p) => p.id);

  return (
    <ComparateurClient
      produitsDisponibles={produitsDisponibles}
      initialIds={initialIds}
      shouldSyncUrl={ids === undefined && initialIds.length > 0}
    />
  );
}
