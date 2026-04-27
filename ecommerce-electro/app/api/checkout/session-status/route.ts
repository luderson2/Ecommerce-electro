import { NextResponse } from 'next/server'
import { getCheckoutSessionDetails } from '@/lib/payments/checkout'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id manquant.' }, { status: 400 })
  }

  try {
    const result = await getCheckoutSessionDetails(sessionId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la lecture de la session Stripe.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
