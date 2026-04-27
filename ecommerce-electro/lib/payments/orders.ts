import type Stripe from "stripe";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateLong, formatPrix } from "@/lib/utils";

type OrderEmailItem = {
  quantity: number;
  unit_price: number;
  product_name: string | null;
};

type OrderEmailDelivery = {
  scheduled_date: string | null;
};

type OrderEmailData = {
  id: string;
  user_id: string;
  total_amount: number;
  subtotal: number | null;
  tax: number | null;
  shipping: number | null;
  created_at: string;
  shipping_address_street: string | null;
  shipping_address_apartment: string | null;
  shipping_address_city: string | null;
  shipping_address_province: string | null;
  shipping_address_postal_code: string | null;
  shipping_address_country: string | null;
  order_items: OrderEmailItem[];
  deliveries: OrderEmailDelivery[];
};

function centsFromAmount(amount: number) {
  return Math.round(amount * 100);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAdresseLivraison(order: OrderEmailData) {
  return [
    order.shipping_address_street,
    order.shipping_address_apartment,
    order.shipping_address_city,
    order.shipping_address_province,
    order.shipping_address_postal_code,
    order.shipping_address_country,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildDelaiLivraison(order: OrderEmailData) {
  const scheduledDate = order.deliveries?.[0]?.scheduled_date;
  if (scheduledDate) {
    return `Livraison planifiee pour le ${formatDateLong(scheduledDate)}`;
  }

  if (order.shipping === 79.99) {
    return "Livraison express estimee sous 24 a 48 heures ouvrables";
  }

  if (order.shipping === 59.99) {
    return "Livraison sur rendez-vous, horaire a confirmer par notre equipe";
  }

  return "Livraison standard estimee sous 3 a 5 jours ouvrables";
}

async function envoyerEmailConfirmationCommande(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
  order: OrderEmailData
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return;
  }

  const { data: emailFromRpc } = await supabase.rpc("get_user_email", {
    user_id: order.user_id,
  });

  const recipientEmail =
    emailFromRpc ||
    session.customer_details?.email ||
    session.customer_email ||
    null;

  if (!recipientEmail) {
    return;
  }

  const subtotal =
    order.subtotal ??
    order.order_items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const deliveryText = buildDelaiLivraison(order);
  const addressText = formatAdresseLivraison(order);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orderUrl = `${siteUrl}/compte/commandes/${order.id}`;
  const resend = new Resend(resendApiKey);

  const itemsHtml = order.order_items
    .map((item) => {
      const productName = escapeHtml(item.product_name || "Produit");
      return `
        <tr>
          <td style="padding:8px 0;color:#111827">${productName}</td>
          <td style="padding:8px 0;color:#6b7280;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;color:#111827;text-align:right">${formatPrix(item.unit_price * item.quantity)}</td>
        </tr>
      `;
    })
    .join("");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@electrometropolitain.ca",
    to: recipientEmail,
    subject: `Confirmation de commande #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.5">
        <h1 style="font-size:24px;margin:0 0 12px">Merci pour votre commande</h1>
        <p style="margin:0 0 16px;color:#4b5563">
          Votre paiement a bien ete confirme le ${formatDateLong(order.created_at, true)}.
        </p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 20px">
          <p style="margin:0 0 8px"><strong>Numero de commande :</strong> #${escapeHtml(order.id.slice(0, 8).toUpperCase())}</p>
          <p style="margin:0 0 8px"><strong>Total paye :</strong> ${formatPrix(order.total_amount)}</p>
          <p style="margin:0"><strong>Delai de livraison :</strong> ${escapeHtml(deliveryText)}</p>
        </div>

        <h2 style="font-size:18px;margin:0 0 12px">Recapitulatif</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead>
            <tr>
              <th style="padding:0 0 8px;text-align:left;border-bottom:1px solid #e5e7eb">Article</th>
              <th style="padding:0 0 8px;text-align:center;border-bottom:1px solid #e5e7eb">Qte</th>
              <th style="padding:0 0 8px;text-align:right;border-bottom:1px solid #e5e7eb">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 20px">
          <p style="margin:0 0 8px"><strong>Sous-total :</strong> ${formatPrix(subtotal)}</p>
          ${
            order.tax != null
              ? `<p style="margin:0 0 8px"><strong>Taxes :</strong> ${formatPrix(order.tax)}</p>`
              : ""
          }
          ${
            order.shipping != null
              ? `<p style="margin:0 0 8px"><strong>Livraison :</strong> ${
                  order.shipping === 0 ? "Gratuite" : formatPrix(order.shipping)
                }</p>`
              : ""
          }
          <p style="margin:0"><strong>Total :</strong> ${formatPrix(order.total_amount)}</p>
        </div>

        ${
          addressText
            ? `
              <h2 style="font-size:18px;margin:0 0 12px">Adresse de livraison</h2>
              <p style="margin:0 0 20px;color:#4b5563">${escapeHtml(addressText)}</p>
            `
            : ""
        }

        <p style="margin:0 0 20px">
          <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">
            Voir ma commande
          </a>
        </p>

        <p style="margin:0;color:#6b7280;font-size:14px">
          Si vous avez une question, repondez a ce courriel ou contactez notre service client.
        </p>
      </div>
    `,
  });
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

  const { data: wasConfirmed, error: rpcError } = await supabase.rpc("confirmer_commande_payee", {
    p_order_id: orderId,
    p_stripe_session_id: session.id,
    p_payment_intent_id: paymentIntent,
  });

  if (rpcError) {
    throw new Error(rpcError.message || "Confirmation de commande impossible.");
  }

  // wasConfirmed === false : la commande était déjà payée (retry) — ne pas renvoyer l'email
  if (!wasConfirmed) {
    return { success: true, alreadyPaid: true };
  }

  const { data: confirmedOrder } = await supabase
    .from("orders")
    .select(
      `
        id,
        user_id,
        total_amount,
        subtotal,
        tax,
        shipping,
        created_at,
        shipping_address_street,
        shipping_address_apartment,
        shipping_address_city,
        shipping_address_province,
        shipping_address_postal_code,
        shipping_address_country,
        order_items(quantity, unit_price, product_name),
        deliveries(scheduled_date)
      `
    )
    .eq("id", orderId)
    .single<OrderEmailData>();

  if (confirmedOrder) {
    try {
      await envoyerEmailConfirmationCommande(supabase, session, confirmedOrder);
    } catch (emailError) {
      console.error("[order confirmation email] failed:", emailError);
    }
  }

  return { success: true, alreadyPaid: false };
}
