import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { confirmerCommandePayeeDepuisSession } from '@/lib/payments/orders'

interface CartItem {
  product_id: string
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

type OrderShippingAddress = {
  shipping_address_street: string | null
  shipping_address_apartment: string | null
  shipping_address_city: string | null
  shipping_address_province: string | null
  shipping_address_postal_code: string | null
  shipping_address_country: string | null
}

export async function createCheckoutSessionForUser(
  cartItems: CartItem[],
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

  for (const item of cartItems) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error('Quantite invalide')
    }
  }

  // Fusionner les doublons : un product_id envoyé plusieurs fois additionne les quantités
  const mergedMap: Record<string, number> = {}
  for (const item of cartItems) {
    mergedMap[item.product_id] = (mergedMap[item.product_id] ?? 0) + item.quantity
  }
  const mergedItems: CartItem[] = Object.entries(mergedMap).map(([product_id, quantity]) => ({
    product_id,
    quantity,
  }))

  // Remplacer cartItems par la version dédupliquée pour tout le reste du traitement
  cartItems = mergedItems

  const productIds = cartItems.map((item) => item.product_id)

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, slug, price, stock, name')
    .in('id', productIds)
    .eq('is_active', true)

  if (productsError || !productsData) {
    throw new Error('Erreur lors de la recuperation des produits')
  }

  const productMap: Record<string, { price: number; stock: number; slug: string; name: string }> = {}
  for (const product of productsData) {
    productMap[product.id] = {
      price: product.price,
      stock: product.stock,
      slug: product.slug,
      name: product.name,
    }
  }

  const { data: productImages } = await supabase
    .from('product_images')
    .select('product_id, url, sort_order')
    .in('product_id', productIds)
    .order('sort_order', { ascending: true })

  const imageMap: Record<string, string> = {}
  for (const image of productImages ?? []) {
    if (!imageMap[image.product_id]) {
      imageMap[image.product_id] = image.url
    }
  }

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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + productMap[item.product_id].price * item.quantity,
    0
  )
  const tax = Math.round(subtotal * 0.14975 * 100) / 100

  const SHIPPING_COSTS: Record<DeliveryMode, number> = {
    standard: subtotal >= 500 ? 0 : 25,
    express: 79.99,
    scheduled: 59.99,
  }
  const shipping = SHIPPING_COSTS[deliveryMode ?? 'standard'] ?? (subtotal >= 500 ? 0 : 25)
  const tip = Math.max(0, Math.min(tipAmount ?? 0, 50))
  const total = Math.round((subtotal + tax + shipping + tip) * 100) / 100

  const slugMap: Record<string, string> = {}
  for (const product of productsData) {
    slugMap[product.id] = product.slug
  }

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
      shipping_address_street: shippingAddress?.street ?? null,
      shipping_address_apartment: shippingAddress?.apartment ?? null,
      shipping_address_city: shippingAddress?.city ?? null,
      shipping_address_province: shippingAddress?.province ?? null,
      shipping_address_postal_code: shippingAddress?.postalCode ?? null,
      shipping_address_country: shippingAddress?.country ?? null,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Erreur lors de la creation de la commande:', orderError)
    throw new Error('Erreur lors de la creation de la commande')
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: productMap[item.product_id].price,
    product_name: productMap[item.product_id].name,
    product_image: imageMap[item.product_id] ?? null,
    product_slug: slugMap[item.product_id] ?? null,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error("Erreur lors de l'ajout des articles:", itemsError)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error("Erreur lors de l'ajout des articles de la commande")
  }

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'cad',
      product_data: {
        name: productMap[item.product_id].name,
        ...(imageMap[item.product_id] ? { images: [encodeURI(imageMap[item.product_id])] } : {}),
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${siteUrl}/compte/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
    cancel_url: `${siteUrl}/compte/checkout?canceled=true&order_id=${order.id}`,
    metadata: {
      order_id: order.id,
      user_id: user.id,
    },
    customer_email: user.email ?? undefined,
  })

  if (!session.url) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Impossible de generer le lien de paiement Stripe')
  }

  const { error: sessionUpdateError } = await supabase
    .from('orders')
    .update({ stripe_session_id: session.id })
    .eq('id', order.id)
    .eq('user_id', user.id)

  if (sessionUpdateError) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Impossible de finaliser la session de paiement')
  }

  return { url: session.url, orderId: order.id }
}

export async function getCheckoutSessionDetails(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    customerEmail: session.customer_details?.email,
    paymentStatus: session.payment_status,
  }
}

export async function confirmOrderForUser(orderId: string, sessionId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Vous devez etre connecte')
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') {
    throw new Error("Le paiement n'a pas ete complete")
  }

  await confirmerCommandePayeeDepuisSession(session, orderId, user.id)

  const { data: updatedOrder, error: orderError } = await supabase
    .from('orders')
    .select(
      'shipping_address_street, shipping_address_apartment, shipping_address_city, ' +
      'shipping_address_province, shipping_address_postal_code, shipping_address_country'
    )
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()
    .returns<OrderShippingAddress>()

  if (orderError || !updatedOrder) {
    throw new Error('Commande introuvable apres paiement')
  }

  if (updatedOrder.shipping_address_street) {
    await supabase
      .from('profiles')
      .update({
        address_street: updatedOrder.shipping_address_street,
        address_apartment: updatedOrder.shipping_address_apartment,
        address_city: updatedOrder.shipping_address_city,
        address_province: updatedOrder.shipping_address_province,
        address_postal_code: updatedOrder.shipping_address_postal_code,
        address_country: updatedOrder.shipping_address_country,
      })
      .eq('id', user.id)
  }

  // Supprimer uniquement les articles commandés, pas tout le panier
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id')
    .eq('order_id', orderId)

  if (orderItems && orderItems.length > 0) {
    const orderedProductIds = orderItems.map((item) => item.product_id)
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .in('product_id', orderedProductIds)
  }

  return { success: true }
}

export async function cancelPendingOrderForUser(orderId: string) {
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
