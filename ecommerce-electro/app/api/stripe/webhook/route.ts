import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmerCommandePayeeDepuisSession } from "@/lib/payments/orders";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook Stripe non configure." }, { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Déduplication: insert d'abord l'event.id ; si 23505 (unique violation), c'est un replay.
  const { error: insertError } = await admin
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, event_type: event.type });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe webhook] dedup insert failed:", insertError);
    return NextResponse.json({ error: "Enregistrement evenement impossible." }, { status: 500 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      await confirmerCommandePayeeDepuisSession(event.data.object);
    } catch (error) {
      console.error("[stripe webhook] confirmation failed:", error);
      // On retire la ligne pour permettre un retry Stripe avec le même event.id.
      await admin.from("stripe_webhook_events").delete().eq("event_id", event.id);
      return NextResponse.json({ error: "Confirmation impossible." }, { status: 500 });
    }
  }

  await admin
    .from("stripe_webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("event_id", event.id);

  return NextResponse.json({ received: true });
}
