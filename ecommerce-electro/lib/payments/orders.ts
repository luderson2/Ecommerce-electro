import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function centsFromAmount(amount: number) {
  return Math.round(amount * 100);
}

export async function confirmerCommandePayeeDepuisSession(
  session: Stripe.Checkout.Session,
  expectedOrderId?: string,
  expectedUserId?: string
) {
  const orderId = session.metadata?.order_id;
  const userId = session.metadata?.user_id;

  if (!orderId || !userId) {
    throw new Error("Metadonnees Stripe manquantes.");
  }

  if (expectedOrderId && expectedOrderId !== orderId) {
    throw new Error("La session Stripe ne correspond pas a cette commande.");
  }

  if (expectedUserId && expectedUserId !== userId) {
    throw new Error("La session Stripe ne correspond pas a cet utilisateur.");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Le paiement n'a pas ete complete.");
  }

  if (session.currency !== "cad" || session.amount_total == null) {
    throw new Error("Montant Stripe invalide.");
  }

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, stripe_session_id, status")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Commande introuvable.");
  }

  if (order.user_id !== userId) {
    throw new Error("Utilisateur Stripe invalide pour cette commande.");
  }

  if (order.stripe_session_id !== session.id) {
    throw new Error("Session Stripe invalide pour cette commande.");
  }

  if (centsFromAmount(order.total_amount) !== session.amount_total) {
    throw new Error("Le montant Stripe ne correspond pas a la commande.");
  }

  if (order.status === "payee") {
    return { success: true, alreadyPaid: true };
  }

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? "");

  const { error: rpcError } = await supabase.rpc("confirmer_commande_payee", {
    p_order_id: orderId,
    p_stripe_session_id: session.id,
    p_payment_intent_id: paymentIntent,
  });

  if (rpcError) {
    throw new Error(rpcError.message || "Confirmation de commande impossible.");
  }

  return { success: true, alreadyPaid: false };
}
