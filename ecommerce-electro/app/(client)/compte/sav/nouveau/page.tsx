export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SavForm from "./SavForm";

export default async function NouvelleDemandesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?redirect=/compte/sav/nouveau");

  const { data: commandes } = await supabase
    .from("orders")
    .select("id, created_at, total_amount")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto py-10 px-4">
        <Link
          href="/compte/sav"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Mes demandes SAV
        </Link>
        <h1 className="text-3xl font-bold mb-8">Nouvelle demande SAV</h1>
        <SavForm commandes={commandes ?? []} />
      </main>
      <Footer />
    </>
  );
}
