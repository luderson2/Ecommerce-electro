import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RabaisForm from "@/components/admin/RabaisForm";

export default async function AdminNouveauRabaisPage() {
  const supabase = await createClient();

  const [{ data: produits }, { data: packs }] = await Promise.all([
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

  return (
    <div className="max-w-xl">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/rabais" className="hover:text-foreground transition-colors">
          Rabais
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">Nouveau rabais</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground mb-8">Nouveau rabais</h1>

      <div className="bg-white rounded-lg border border-border p-6">
        <RabaisForm
          produits={produits ?? []}
          packs={packs ?? []}
        />
      </div>
    </div>
  );
}
