import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCheckoutSessionForUser } from '@/lib/payments/checkout'
import type { DeliveryMode } from '@/lib/payments/checkout'

const RATE_LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Vous devez etre connecte pour passer une commande' },
      { status: 401 }
    )
  }

  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const adminClient = createAdminClient()
  const { count, error: countError } = await adminClient
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', since)

  if (countError) {
    return NextResponse.json(
      { error: 'Impossible de vérifier la limite de sessions. Veuillez réessayer.' },
      { status: 500 }
    )
  }

  if ((count ?? 0) >= RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Trop de tentatives de paiement récentes. Réessayez dans quelques minutes.' },
      { status: 429 }
    )
  }

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
