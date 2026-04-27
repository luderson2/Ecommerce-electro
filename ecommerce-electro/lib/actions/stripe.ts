'use server'

import {
  cancelPendingOrderForUser,
  confirmOrderForUser,
  createCheckoutSessionForUser,
  getCheckoutSessionDetails,
  type DeliveryMode,
} from '@/lib/payments/checkout'

interface CartItem {
  product_id: string
  quantity: number
}

interface ShippingAddress {
  street: string
  apartment: string | null
  city: string
  province: string
  postalCode: string
  country: string
}

export type { DeliveryMode }

export async function createCheckoutSession(
  cartItems: CartItem[],
  deliveryMode?: DeliveryMode,
  tipAmount?: number,
  shippingAddress?: ShippingAddress
) {
  return createCheckoutSessionForUser(cartItems, deliveryMode, tipAmount, shippingAddress)
}

export async function getCheckoutSession(sessionId: string) {
  return getCheckoutSessionDetails(sessionId)
}

export async function confirmOrder(orderId: string, sessionId: string) {
  return confirmOrderForUser(orderId, sessionId)
}

export async function cancelPendingOrder(orderId: string) {
  return cancelPendingOrderForUser(orderId)
}
