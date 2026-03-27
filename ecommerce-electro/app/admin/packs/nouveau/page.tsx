import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PackForm from "@/components/admin/PackForm";

export default async function NouveauPackPage() {
  const supabase = await createClient();

  const { data: produits } = await supabase
    .from("products")
    .select("id, name, brand")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="max-w-2xl">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/admin/packs" className="hover:text-foreground transition-colors">
          Packs
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium">Nouveau pack</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Nouveau pack</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Créez un pack en combinant plusieurs produits.{" "}
          Les champs marqués <span className="text-red-500">*</span> sont obligatoires.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <PackForm
          mode="creation"
          produitsDisponibles={produits ?? []}
        />
      </div>
    </div>
  );
}
