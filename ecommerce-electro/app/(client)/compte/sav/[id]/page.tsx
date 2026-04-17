export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { formatDateLong } from "@/lib/utils";
import { SAV_BADGE, SAV_LABEL } from "@/lib/constants/statuts";
import type { SavStatus } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SavDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: demande } = await supabase
    .from("service_requests")
    .select("id, subject, description, status, created_at, order_id, user_id")
    .eq("id", id)
    .single();

  if (!demande || demande.user_id !== user.id) notFound();

  const status = demande.status as SavStatus;

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

        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-2xl font-bold leading-tight">{demande.subject}</h1>
          <span
            className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${SAV_BADGE[status]}`}
          >
            {SAV_LABEL[status]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Soumise le {formatDateLong(demande.created_at, true)}
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {demande.description}
            </p>
          </CardContent>
        </Card>

        {demande.order_id && (
          <Card className="mt-4">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-1">Commande liée</p>
              <Link
                href={`/compte/commandes/${demande.order_id}`}
                className="font-mono font-semibold text-primary hover:underline text-sm"
              >
                #{demande.order_id.slice(0, 8).toUpperCase()}
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </>
  );
}
