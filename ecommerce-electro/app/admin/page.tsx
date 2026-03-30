export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/StatCard";
import { Package, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { formatPrix } from "@/lib/utils";
import Link from "next/link";
import type { OrderStatus } from "@/types";
import ChartCAMensuel from "@/components/admin/ChartCAMensuel";
import { AlertTriangle } from "lucide-react";

const SEUIL_STOCK_BAS = 5;

const statutLabels: Record<OrderStatus, string> = {
  en_attente: "En attente",
  payee: "Payée",
  en_preparation: "En préparation",
  livraison: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
};

const statutStyles: Record<OrderStatus, string> = {
  en_attente: "bg-orange-100 text-orange-700",
  payee: "bg-blue-100 text-blue-700",
  en_preparation: "bg-purple-100 text-purple-700",
  livraison: "bg-cyan-100 text-cyan-700",
  livree: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-700",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalProduits },
    { count: totalCommandes },
    { count: commandesEnAttente },
    { data: chiffreAffaires },
    { data: dernieresCommandes },
    donneesMensuelles,
    { data: stockBas },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "en_attente"),
    supabase
      .from("orders")
      .select("total_amount")
      .neq("status", "annulee"),
    supabase
      .from("orders")
      .select("id, status, total_amount, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("orders")
      .select("total_amount, created_at")
      .neq("status", "annulee")
      .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString()),
    supabase
      .from("products")
      .select("id, name, brand, stock")
      .eq("is_active", true)
      .lte("stock", SEUIL_STOCK_BAS)
      .order("stock", { ascending: true })
      .limit(10),
  ]);

  // Agréger le CA par mois (6 derniers mois)
  const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const caMensuel = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return { annee: date.getFullYear(), moisIndex: date.getMonth(), mois: moisLabels[date.getMonth()], ca: 0 };
  });

  for (const commande of donneesMensuelles?.data ?? []) {
    const d = new Date(commande.created_at);
    const entree = caMensuel.find(
      (m) => m.annee === d.getFullYear() && m.moisIndex === d.getMonth()
    );
    if (entree) entree.ca += commande.total_amount;
  }

  const ca = chiffreAffaires?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Produits actifs"
          value={String(totalProduits ?? 0)}
          icon={Package}
        />
        <StatCard
          label="Commandes totales"
          value={String(totalCommandes ?? 0)}
          icon={ShoppingCart}
        />
        <StatCard
          label="Chiffre d'affaires"
          value={formatPrix(ca)}
          sous_label="Commandes non annulées"
          icon={DollarSign}
          variante="success"
        />
        <StatCard
          label="En attente"
          value={String(commandesEnAttente ?? 0)}
          sous_label="Commandes à traiter"
          icon={Clock}
          variante={commandesEnAttente && commandesEnAttente > 0 ? "warning" : "default"}
        />
      </div>

      {/* Dernières commandes */}
      <div className="mt-8 bg-white rounded-lg border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Dernières commandes</h2>
          <Link
            href="/admin/commandes"
            className="text-xs text-primary hover:underline font-medium"
          >
            Voir tout →
          </Link>
        </div>

        {!dernieresCommandes || dernieresCommandes.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">
            Aucune commande pour l&apos;instant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="text-left px-5 py-3 font-semibold">Commande</th>
                  <th className="text-left px-5 py-3 font-semibold">Client</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Statut</th>
                  <th className="text-right px-5 py-3 font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dernieresCommandes.map((commande) => {
                  const statut = commande.status as OrderStatus;
                  const client = Array.isArray(commande.profiles)
                    ? commande.profiles[0]?.full_name
                    : (commande.profiles as { full_name: string } | null)?.full_name;
                  return (
                    <tr key={commande.id} className="hover:bg-surface transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/commandes/${commande.id}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          #{commande.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {client ?? <span className="text-muted-foreground italic">Inconnu</span>}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(commande.created_at).toLocaleDateString("fr-CA", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statutStyles[statut]}`}>
                          {statutLabels[statut]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {formatPrix(commande.total_amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alertes stock bas */}
      {stockBas && stockBas.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-orange-200 bg-orange-50/40 rounded-t-lg">
            <AlertTriangle size={16} className="text-orange-600 shrink-0" />
            <h2 className="font-semibold text-foreground">
              Stock bas
              <span className="ml-2 text-xs font-normal text-orange-600">
                ({stockBas.length} produit{stockBas.length > 1 ? "s" : ""} ≤ {SEUIL_STOCK_BAS} unités)
              </span>
            </h2>
            <Link
              href="/admin/produits"
              className="ml-auto text-xs text-primary hover:underline font-medium"
            >
              Gérer les produits →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {stockBas.map((produit) => (
              <li key={produit.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{produit.name}</p>
                  <p className="text-xs text-muted-foreground">{produit.brand}</p>
                </div>
                <span
                  className={`ml-4 shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${
                    produit.stock === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {produit.stock === 0 ? "Rupture" : `${produit.stock} restant${produit.stock > 1 ? "s" : ""}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Graphique CA mensuel */}
      <div className="mt-6 bg-white rounded-lg border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Chiffre d&apos;affaires — 6 derniers mois</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Commandes non annulées uniquement</p>
        </div>
        <div className="px-5 py-4">
          <ChartCAMensuel donnees={caMensuel.map(({ mois, ca }) => ({ mois, ca }))} />
        </div>
      </div>
    </div>
  );
}
