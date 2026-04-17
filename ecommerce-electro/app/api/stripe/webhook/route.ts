import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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

  if (event.type === "checkout.session.completed") {
    try {
      await confirmerCommandePayeeDepuisSession(event.data.object);
    } catch (error) {
      console.error("[stripe webhook] confirmation failed:", error);
      return NextResponse.json({ error: "Confirmation impossible." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
