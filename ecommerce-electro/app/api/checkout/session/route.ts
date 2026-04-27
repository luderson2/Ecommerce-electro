import { NextResponse } from 'next/server'
import { createCheckoutSessionForUser } from '@/lib/payments/checkout'
import type { DeliveryMode } from '@/lib/payments/checkout'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await createCheckoutSessionForUser(
      body.cartItems ?? [],
      body.deliveryMode as DeliveryMode | undefined,
      body.tipAmount,
      body.shippingAddress
    )

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la creation de la session de paiement.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
