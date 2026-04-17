'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Les prix ne viennent JAMAIS du client — on les recalcule depuis la DB
interface CartItem {
  product_id: string
  product_name: string
  product_image: string | null
  quantity: number
}

export type DeliveryMode = 'standard' | 'express' | 'scheduled'

interface ShippingAddress {
  street: string
  apartment: string | null
  city: string
  province: string
  postalCode: string
  country: string
}

export async function createCheckoutSession(
  cartItems: CartItem[],
  returnUrl: string,
  deliveryMode?: DeliveryMode,
  tipAmount?: number,
  shippingAddress?: ShippingAddress
) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Vous devez etre connecte pour passer une commande')
  }

  if (cartItems.length === 0) {
    throw new Error('Votre panier est vide')
  }

  // Valider les quantités côté client (nombres entiers positifs, max 99)
  for (const item of cartItems) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error('Quantité invalide')
    }
  }

  // ─── Prix et stock : toujours depuis la DB, jamais depuis le client ───
  const productIds = cartItems.map(item => item.product_id)

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, slug, price, stock, name')
    .in('id', productIds)
    .eq('is_active', true)

  if (productsError || !productsData) {
    throw new Error('Erreur lors de la récupération des produits')
  }

  const productMap: Record<string, { price: number; stock: number; slug: string; name: string }> = {}
  for (const p of productsData) {
    productMap[p.id] = { price: p.price, stock: p.stock, slug: p.slug, name: p.name }
  }

  // Vérifier que chaque produit existe et que le stock est suffisant
  for (const item of cartItems) {
    const product = productMap[item.product_id]
    if (!product) {
      throw new Error('Un ou plusieurs produits sont introuvables ou inactifs')
    }
    if (item.quantity > product.stock) {
      throw new Error(
        `Stock insuffisant pour « ${product.name} » : ${product.stock} disponible${product.stock > 1 ? 's' : ''}`
      )
    }
  }

  // ─── Calcul des totaux côté serveur ───
  const subtotal = cartItems.reduce(
    (sum, item) => sum + productMap[item.product_id].price * item.quantity,
    0
  )
  const tax = Math.round(subtotal * 0.14975 * 100) / 100

  // Frais de livraison calculés serveur-side selon le mode (jamais depuis le client)
  const SHIPPING_COSTS: Record<DeliveryMode, number> = {
    standard:  subtotal >= 500 ? 0 : 25.00,
    express:   79.99,
    scheduled: 59.99,
  }
  const shipping = SHIPPING_COSTS[deliveryMode ?? 'standard'] ?? (subtotal >= 500 ? 0 : 25.00)

  // Pourboire clampé : 0 ≤ tip ≤ 50 (protection contre valeurs négatives ou abusives)
  const tip = Math.max(0, Math.min(tipAmount ?? 0, 50))

  const total = Math.round((subtotal + tax + shipping + tip) * 100) / 100

  const slugMap: Record<string, string> = {}
  for (const p of productsData) slugMap[p.id] = p.slug

  // ─── Création de la commande ───
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'en_attente' as const,
      total_amount: total,
      subtotal,
      tax,
      shipping,
      stripe_payment_id: null,
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      shipping_address_street:      shippingAddress?.street      ?? null,
      shipping_address_apartment:   shippingAddress?.apartment   ?? null,
      shipping_address_city:        shippingAddress?.city        ?? null,
      shipping_address_province:    shippingAddress?.province    ?? null,
      shipping_address_postal_code: shippingAddress?.postalCode  ?? null,
      shipping_address_country:     shippingAddress?.country     ?? null,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Erreur lors de la creation de la commande:', orderError)
    throw new Error('Erreur lors de la creation de la commande')
  }

  // ─── Lignes de commande avec prix DB (jamais prix client) ───
  const orderItems = cartItems.map(item => ({
    order_id:      order.id,
    product_id:    item.product_id,
    quantity:      item.quantity,
    unit_price:    productMap[item.product_id].price,
    product_name:  item.product_name,
    product_image: item.product_image,
    product_slug:  slugMap[item.product_id] ?? null,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error("Erreur lors de l'ajout des articles:", itemsError)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error("Erreur lors de l'ajout des articles de la commande")
  }

  // ─── Stripe line items avec prix DB ───
  const lineItems = cartItems.map(item => ({
    price_data: {
      currency: 'cad',
      product_data: {
        name: item.product_name,
        ...(item.product_image ? { images: [item.product_image] } : {}),
      },
      unit_amount: Math.round(productMap[item.product_id].price * 100),
    },
    quantity: item.quantity,
  }))

  if (tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: { name: 'Taxes (TPS 5% + TVQ 9.975%)' },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    })
  }

  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: { name: 'Frais de livraison' },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    })
  }

  if (tip > 0) {
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: { name: 'Pourboire pour la livraison' },
        unit_amount: Math.round(tip * 100),
      },
      quantity: 1,
    })
  }

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${returnUrl}/compte/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
    cancel_url:  `${returnUrl}/compte/checkout?canceled=true&order_id=${order.id}`,
    metadata: {
      order_id: order.id,
      user_id:  user.id,
    },
    customer_email: user.email ?? undefined,
  })

  if (!session.url) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Impossible de generer le lien de paiement Stripe')
  }

  return { url: session.url, orderId: order.id }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status:        session.status,
    customerEmail: session.customer_details?.email,
    paymentStatus: session.payment_status,
  }
}

export async function confirmOrder(orderId: string, sessionId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Vous devez etre connecte')
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') {
    throw new Error("Le paiement n'a pas ete complete")
  }

  // Garde anti-rejeu : on ne confirme que si la commande est encore en_attente
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      status:           'payee',
      stripe_payment_id: session.payment_intent as string,
    })
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'en_attente')          // ← empêche la double confirmation
    .select(
      'shipping_address_street, shipping_address_apartment, shipping_address_city, ' +
      'shipping_address_province, shipping_address_postal_code, shipping_address_country'
    )
    .single()

  if (updateError) {
    console.error('Erreur lors de la mise a jour de la commande:', updateError)
    throw new Error('Erreur lors de la mise a jour de la commande')
  }

  // Mettre à jour l'adresse du profil avec la dernière adresse de livraison
  if (updatedOrder?.shipping_address_street) {
    await supabase
      .from('profiles')
      .update({
        address_street:      updatedOrder.shipping_address_street,
        address_apartment:   updatedOrder.shipping_address_apartment,
        address_city:        updatedOrder.shipping_address_city,
        address_province:    updatedOrder.shipping_address_province,
        address_postal_code: updatedOrder.shipping_address_postal_code,
        address_country:     updatedOrder.shipping_address_country,
      })
      .eq('id', user.id)
  }

  // Vider le panier (type correct, plus de cast as any)
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  return { success: true }
}

export async function cancelPendingOrder(orderId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return

  await supabase
    .from('orders')
    .update({ status: 'annulee' })
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'en_attente')
}
