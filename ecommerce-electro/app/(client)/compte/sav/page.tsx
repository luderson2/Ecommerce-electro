export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { SAV_BADGE, SAV_LABEL } from "@/lib/constants/statuts";
import type { SavStatus } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type DemandeLigne = {
  id: string;
  subject: string;
  status: SavStatus;
  created_at: string;
  order_id: string | null;
};

export default async function SavPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?redirect=/compte/sav");

  const { data: demandes } = await supabase
    .from("service_requests")
    .select("id, subject, status, created_at, order_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<DemandeLigne[]>();

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mes demandes SAV</h1>
            <p className="text-muted-foreground mt-1">
              {(demandes ?? []).length} demande
              {(demandes ?? []).length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button asChild>
            <Link href="/compte/sav/nouveau">Nouvelle demande</Link>
          </Button>
        </div>

        {(demandes ?? []).length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border">
            <p className="text-muted-foreground">Aucune demande pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(demandes ?? []).map((d) => (
              <Link
                key={d.id}
                href={`/compte/sav/${d.id}`}
                className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{d.subject}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDate(d.created_at)}
                    {d.order_id && (
                      <>
                        {" "}
                        &middot; Commande{" "}
                        <span className="font-mono">
                          #{d.order_id.slice(0, 8).toUpperCase()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={`ml-4 shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${SAV_BADGE[d.status]}`}
                >
                  {SAV_LABEL[d.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
