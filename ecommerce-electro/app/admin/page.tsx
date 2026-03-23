import Link from "next/link";
import { TrendingUp, ShoppingCart, Package, Users, AlertTriangle, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrix } from "@/lib/utils";
import StatCard from "@/components/admin/StatCard";
import type { OrderStatus } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const statutCommande: Record<OrderStatus, { label: string; classe: string }> = {
  en_attente:    { label: "En attente",     classe: "bg-yellow-100 text-yellow-700" },
  payee:         { label: "Payée",          classe: "bg-blue-100 text-blue-700" },
  en_preparation:{ label: "En préparation", classe: "bg-orange-100 text-orange-700" },
  livraison:     { label: "En livraison",   classe: "bg-purple-100 text-purple-700" },
  livree:        { label: "Livrée",         classe: "bg-green-100 text-green-700" },
  annulee:       { label: "Annulée",        classe: "bg-red-100 text-red-700" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-CA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);
  const debutMoisISO = debutMois.toISOString();

  const [
    { data: ventesData },
    { count: commandesMois },
    { count: produitsActifs },
    { count: clientsTotal },
    { data: stockFaible },
    { data: commandesRecentes },
    { count: savOuverts },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount")
      .in("status", ["payee", "livraison", "livree"])
      .gte("created_at", debutMoisISO),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", debutMoisISO),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client"),
    supabase
      .from("products")
      .select("id, name, brand, stock")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(8),
    supabase
      .from("orders")
      .select("id, status, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["ouvert", "en_cours"]),
  ]);

  const ventesMois = (ventesData ?? []).reduce(
    (acc: number, o: { total_amount: number }) => acc + o.total_amount,
    0
  );

  const moisCourant = new Intl.DateTimeFormat("fr-CA", { month: "long", year: "numeric" })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted mt-0.5">{moisCourant}</p>
      </div>

      {/* KPI — 4 cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Ventes du mois"
          value={formatPrix(ventesMois)}
          sous_label="Commandes payées / livrées"
          icon={TrendingUp}
          variante="success"
        />
        <StatCard
          label="Commandes du mois"
          value={String(commandesMois ?? 0)}
          sous_label="Toutes transactions"
          icon={ShoppingCart}
        />
        <StatCard
          label="Produits actifs"
          value={String(produitsActifs ?? 0)}
          sous_label="Visibles sur le catalogue"
          icon={Package}
        />
        <StatCard
          label="Clients inscrits"
          value={String(clientsTotal ?? 0)}
          sous_label="Comptes actifs"
          icon={Users}
        />
      </div>

      {/* Alertes SAV */}
      {(savOuverts ?? 0) > 0 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
          <Wrench size={18} className="text-orange-600 shrink-0" />
          <p className="text-sm text-orange-800">
            <span className="font-semibold">{savOuverts} demande{(savOuverts ?? 0) > 1 ? "s" : ""} SAV</span>
            {" "}en attente de traitement.{" "}
            <Link href="/admin/sav" className="underline font-medium">
              Voir les tickets →
            </Link>
          </p>
        </div>
      )}

      {/* Grille — Stock faible + Commandes récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Stock faible */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h2 className="text-sm font-semibold text-foreground">Stock critique</h2>
              <span className="text-xs text-muted">(≤ 5 unités)</span>
            </div>
            <Link
              href="/admin/produits"
              className="text-xs text-primary font-medium hover:underline"
            >
              Voir tous →
            </Link>
          </div>

          {!stockFaible?.length ? (
            <p className="px-5 py-8 text-sm text-muted text-center">
              Aucun produit en stock critique.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stockFaible.map((produit: { id: string; name: string; brand: string; stock: number }) => (
                <li key={produit.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{produit.name}</p>
                    <p className="text-xs text-muted">{produit.brand}</p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                        produit.stock === 0
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {produit.stock === 0 ? "Épuisé" : `${produit.stock} restant${produit.stock > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Commandes récentes</h2>
            <Link
              href="/admin/commandes"
              className="text-xs text-primary font-medium hover:underline"
            >
              Voir toutes →
            </Link>
          </div>

          {!commandesRecentes?.length ? (
            <p className="px-5 py-8 text-sm text-muted text-center">
              Aucune commande pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {commandesRecentes.map((commande: { id: string; status: string; total_amount: number; created_at: string }) => {
                const statut = statutCommande[commande.status as OrderStatus] ?? {
                  label: commande.status,
                  classe: "bg-gray-100 text-gray-600",
                };
                return (
                  <li key={commande.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground font-mono">
                        #{commande.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted">{formatDate(commande.created_at)}</p>
                    </div>
                    <div className="ml-4 shrink-0 flex items-center gap-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statut.classe}`}>
                        {statut.label}
                      </span>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatPrix(commande.total_amount)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Liens rapides */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/produits/nouveau"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            + Nouveau produit
          </Link>
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-2 border border-border bg-white text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-surface transition-colors"
          >
            Gérer les commandes
          </Link>
          <Link
            href="/admin/livraisons"
            className="inline-flex items-center gap-2 border border-border bg-white text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-surface transition-colors"
          >
            Planifier les livraisons
          </Link>
          <Link
            href="/admin/sav"
            className="inline-flex items-center gap-2 border border-border bg-white text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-surface transition-colors"
          >
            Tickets SAV
          </Link>
        </div>
      </div>
    </div>
  );
}
