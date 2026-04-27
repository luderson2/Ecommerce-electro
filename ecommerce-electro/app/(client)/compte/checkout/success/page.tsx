'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Home, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const hasConfirmed = useRef(false)

  const getJson = async <T,>(url: string): Promise<T> => {
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(typeof data?.error === 'string' ? data.error : 'Requete impossible.')
    }

    return data as T
  }

  const postJson = async <T,>(url: string, payload: unknown): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(typeof data?.error === 'string' ? data.error : 'Requete impossible.')
    }

    return data as T
  }

  useEffect(() => {
   
    if (!sessionId || !orderId) {
      queueMicrotask(() => {
        setStatus('error')
        setErrorMessage('Informations de commande manquantes dans l\'URL.')
      })
      return
    }

  
    if (hasConfirmed.current) return

    const processOrder = async () => {
      try {
        hasConfirmed.current = true 
        
       
        const session = await getJson<{
          status: string | null
          customerEmail: string | null
          paymentStatus: string | null
        }>(`/api/checkout/session-status?session_id=${encodeURIComponent(sessionId)}`)

        
        if (session.paymentStatus === 'paid' || session.status === 'complete') {
          await postJson('/api/checkout/confirm', { orderId, sessionId })
          
          setCustomerEmail(session.customerEmail || null)
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage('Le paiement n\'a pas encore été validé par Stripe.')
        }
      } catch (err: unknown) {
        console.error('Erreur confirmation:', err)
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Erreur lors de la validation finale.')
      }
    }

    processOrder()
  }, [sessionId, orderId])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          
         
          {status === 'loading' && (
            <div className="text-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Confirmation du paiement...</h2>
              <p className="text-muted-foreground text-sm">
                Ne fermez pas cette page, nous finalisons votre commande.
              </p>
            </div>
          )}

          {status === 'success' && (
            <Card className="border bg-card text-center shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">Commande confirmée !</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Votre paiement a été traité avec succès.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                {customerEmail && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-muted-foreground italic text-xs uppercase font-bold mb-1">Envoyé à</p>
                    <p className="font-semibold">{customerEmail}</p>
                  </div>
                )}

                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground italic text-xs uppercase font-bold mb-1">Numéro de commande</p>
                  <p className="font-mono text-xs break-all">{orderId}</p>
                </div>

                <Separator />

                <div className="flex flex-col gap-3 pt-2">
                  <Button asChild className="w-full py-6">
                    <Link href="/compte/commandes">
                      <Package className="h-4 w-4 mr-2" />
                      Voir l&apos;historique de mes commandes
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      Retour à l&apos;accueil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ÉTAT : ERREUR */}
          {status === 'error' && (
            <Card className="border bg-card text-center shadow-lg">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-red-700">Oups ! Un problème est survenu</CardTitle>
                <p className="text-muted-foreground mt-2">
                  {errorMessage}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <Link href="/compte/panier">Retourner au panier</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Si vous avez été débité, contactez le support avec le numéro : <br/>
                  <span className="font-mono font-bold uppercase">{orderId}</span>
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
