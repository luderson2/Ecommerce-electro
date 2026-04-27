import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCheckoutSessionDetails } from '@/lib/payments/checkout'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id manquant.' }, { status: 400 })
  }

  // Vérifier que la session appartient bien à l'utilisateur connecté
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 })
  }

  try {
    const result = await getCheckoutSessionDetails(sessionId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la lecture de la session Stripe.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
