import { NextResponse } from 'next/server'
import { confirmOrderForUser } from '@/lib/payments/checkout'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await confirmOrderForUser(String(body.orderId ?? ''), String(body.sessionId ?? ''))
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la confirmation de la commande.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
