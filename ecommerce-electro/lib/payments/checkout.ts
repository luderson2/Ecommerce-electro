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

  // --- Discounts (#1 product discounts, #2 pack discounts) ---

  const now = new Date().toISOString()

  // Fetch all active percentage discounts (product-level and pack-level)
  const { data: activeDiscounts, error: discountsError } = await supabase
    .from('discounts')
    .select('product_id, pack_id, discount_type, value')
    .eq('is_active', true)
    .eq('discount_type', 'percentage')
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)

  if (discountsError) {
    throw new Error('Erreur lors de la recuperation des remises')
  }

  const productDiscountMap: Record<string, number> = {}
  const tablePackDiscountMap: Record<string, number> = {}
  for (const d of activeDiscounts ?? []) {
    if (d.product_id) productDiscountMap[d.product_id] = d.value
    if (d.pack_id) tablePackDiscountMap[d.pack_id] = d.value
  }

  // Compute pack-level effective prices (applies when ALL products of a pack are in the cart)
  const packEffectivePrices: Record<string, number> = {}

  const { data: packMemberships, error: packMembershipsError } = await supabase
    .from('pack_products')
    .select('pack_id, product_id')
    .in('product_id', productIds)

  if (packMembershipsError) {
    throw new Error('Erreur lors de la recuperation des packs')
  }

  if (packMemberships && packMemberships.length > 0) {
    const uniquePackIds = [...new Set(packMemberships.map((m) => m.pack_id))]

    const [
      { data: allPackMembers, error: allPackMembersError },
      { data: packPrices, error: packPricesError },
    ] = await Promise.all([
      supabase
        .from('pack_products')
        .select('pack_id, product_id')
        .in('pack_id', uniquePackIds),
      supabase
        .from('packs')
        .select('id, price')
        .in('id', uniquePackIds)
        .eq('is_active', true),
    ])

    if (allPackMembersError || packPricesError) {
      throw new Error('Erreur lors de la recuperation des prix de packs')
    }

    const fullPackMembers: Record<string, string[]> = {}
    for (const m of allPackMembers ?? []) {
      if (!fullPackMembers[m.pack_id]) fullPackMembers[m.pack_id] = []
      fullPackMembers[m.pack_id].push(m.product_id)
    }

    const cartSet = new Set(productIds)
    for (const pack of packPrices ?? []) {
      const members = fullPackMembers[pack.id] ?? []
      // Only apply pack price if every product in the pack is in this order
      if (members.length > 0 && members.every((pid) => cartSet.has(pid))) {
        const sumOriginal = members.reduce((s, pid) => s + (productMap[pid]?.price ?? 0), 0)
        let effectivePackPrice = Math.min(pack.price, sumOriginal)
        // Stack any additional explicit discount from the discounts table
        const extraPct = tablePackDiscountMap[pack.id]
        if (extraPct) {
          effectivePackPrice = Math.round(effectivePackPrice * (1 - extraPct / 100) * 100) / 100
        }
        if (effectivePackPrice < sumOriginal && sumOriginal > 0) {
          const ratio = effectivePackPrice / sumOriginal
          for (const pid of members) {
            packEffectivePrices[pid] = Math.round((productMap[pid]?.price ?? 0) * ratio * 100) / 100
          }
        }
      }
    }
  }

  // Effective price: pack price (pro-rated) > product discount > base price
  const getEffectivePrice = (productId: string): number => {
    if (packEffectivePrices[productId] !== undefined) {
      return packEffectivePrices[productId]
    }
    const base = productMap[productId].price
    const pct = productDiscountMap[productId]
    return pct != null ? Math.round(base * (1 - pct / 100) * 100) / 100 : base
  }

  // --- End discounts ---

  const subtotal = Math.round(
    cartItems.reduce((sum, item) => sum + getEffectivePrice(item.product_id) * item.quantity, 0) * 100
  ) / 100
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
    unit_price: getEffectivePrice(item.product_id),
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
      unit_amount: Math.round(getEffectivePrice(item.product_id) * 100),
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

  // Verify order ownership after confirmation
  const { error: verifyError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (verifyError) {
    throw new Error('Commande introuvable apres paiement')
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
