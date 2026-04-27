import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY n'est pas defini dans les variables d'environnement.");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});
