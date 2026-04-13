'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

interface CartItem {
  product_id: string
  product_name: string
  product_price: number
  product_image: string | null
  quantity: number
}

export async function createCheckoutSession(cartItems: CartItem[], returnUrl: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Vous devez etre connecte pour passer une commande')
  }

  if (cartItems.length === 0) {
    throw new Error('Votre panier est vide')
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.14975 * 100) / 100
  const shipping = subtotal >= 500 ? 0 : 25
  const total = Math.round((subtotal + tax + shipping) * 100) / 100

  // Create order — only columns that exist in your schema:
  // id, user_id, status (French enum), total_amount, stripe_payment_id, created_at
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'en_attente',
      total_amount: total,
      stripe_payment_id: null,  // required by type, will be set after payment
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Erreur lors de la creation de la commande:', orderError)
    throw new Error('Erreur lors de la creation de la commande')
  }

  // Insert order items — columns: order_id, product_id, quantity, unit_price, product_name, product_image
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.product_price,
    product_name: item.product_name,
    product_image: item.product_image,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Erreur lors de l\'ajout des articles:', itemsError)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error('Erreur lors de l\'ajout des articles de la commande')
  }

  const lineItems = cartItems.map(item => ({
    price_data: {
      currency: 'cad',
      product_data: {
        name: item.product_name,
        ...(item.product_image ? { images: [item.product_image] } : {}),
      },
      unit_amount: Math.round(item.product_price * 100),
    },
    quantity: item.quantity,
  }))

  if (tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: {
          name: 'Taxes (TPS 5% + TVQ 9.975%)',
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    })
  }

  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: {
          name: 'Frais de livraison',
        },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    })
  }

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${returnUrl}/compte/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
    cancel_url: `${returnUrl}/compte/checkout?canceled=true&order_id=${order.id}`,
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

  return {
    url: session.url,
    orderId: order.id,
  }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
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
    throw new Error('Le paiement n\'a pas ete complete')
  }

  
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'payee',                                      
      stripe_payment_id: session.payment_intent as string,
    })
    .eq('id', orderId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Erreur lors de la mise a jour de la commande:', updateError)
    throw new Error('Erreur lors de la mise a jour de la commande')
  }


  await (supabase.from as any)('cart_items')
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