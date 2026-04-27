import { NextResponse } from 'next/server'
import { cancelPendingOrderForUser } from '@/lib/payments/checkout'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await cancelPendingOrderForUser(String(body.orderId ?? ''))
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l annulation de la commande.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
