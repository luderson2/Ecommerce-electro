'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, Truck, CheckCircle, MapPin, DollarSign, Lock, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SectionTitle } from '@/components/section-title'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { createCheckoutSession } from '@/lib/actions/stripe'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { cartItems, cartTotal } = useCart()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [postalCodeValid, setPostalCodeValid] = useState<boolean | null>(null)
  const [selectedDelivery, setSelectedDelivery] = useState('standard')
  const [tipAmount, setTipAmount] = useState<number>(0)
  const [postalCode, setPostalCode] = useState('')

  const shipping = cartTotal >= 500 ? 0 : selectedDelivery === 'express' ? 79.99 : selectedDelivery === 'scheduled' ? 59.99 : 25.00
  const tps = cartTotal * 0.05
  const tvq = cartTotal * 0.09975
  const tax = tps + tvq
  const total = cartTotal + shipping + tax + tipAmount

  const checkPostalCode = () => {
    const code = postalCode.toUpperCase().trim()
    setPostalCodeValid(code.startsWith('H') || code.startsWith('J') || code.startsWith('G') || code.startsWith('K'))
  }

  const handleProceedToPayment = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (cartItems.length === 0) {
      setError('Votre panier est vide.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const origin = window.location.origin
      const { url } = await createCheckoutSession(cartItems, origin)
      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la creation de la session de paiement.')
      setIsLoading(false)
    }
  }

  
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
          <p className="text-muted-foreground mb-6">Vous devez etre connecte pour passer une commande.</p>
          <Button asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-6">Ajoutez des produits avant de passer a la caisse.</p>
          <Button asChild>
            <Link href="/shop">Magasiner</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <SectionTitle title="Paiement" subtitle="Completez votre commande en toute securite" />

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer info */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  Informations du client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prenom</Label>
                    <Input id="firstName" placeholder="Jean"  readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" placeholder="Tremblay"  readOnly className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Courriel</Label>
                  <Input id="email" type="email" defaultValue={user.email || ''} readOnly className="bg-muted" />
                </div>
              </CardContent>
            </Card>

            {/* Delivery address */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" placeholder="123 rue Principale" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">Appartement, suite, etc. (optionnel)</Label>
                  <Input id="apartment" placeholder="Apt 4B" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" placeholder="Montreal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input id="province" placeholder="Quebec" defaultValue="Quebec" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Code postal</Label>
                    <div className="flex gap-2">
                      <Input
                        id="postal"
                        placeholder="H1A 1A1"
                        value={postalCode}
                        onChange={(e) => { setPostalCode(e.target.value); setPostalCodeValid(null) }}
                      />
                      <Button variant="outline" size="icon" onClick={checkPostalCode} type="button">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {postalCodeValid !== null && (
                  <p className={`text-sm flex items-center gap-1 ${postalCodeValid ? 'text-green-600' : 'text-destructive'}`}>
                    <CheckCircle className="h-4 w-4" />
                    {postalCodeValid ? 'Livraison disponible dans cette zone' : 'Nous ne livrons pas encore dans cette zone'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Delivery options */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  Mode de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery} className="space-y-3">
                  {[
                    { value: 'standard', label: 'Livraison standard', desc: '3 a 5 jours ouvrables', price: cartTotal >= 500 ? 'Gratuite' : '25,00 $' },
                    { value: 'express', label: 'Livraison express', desc: '1 a 2 jours ouvrables', price: '79,99 $' },
                    { value: 'scheduled', label: 'Livraison planifiee', desc: 'Choisir une date specifique', price: '59,99 $' },
                  ].map(opt => (
                    <div key={opt.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <Label htmlFor={opt.value} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{opt.label}</p>
                            <p className="text-sm text-muted-foreground">{opt.desc}</p>
                          </div>
                          <Badge variant="secondary">{opt.price}</Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Tip */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pourboire pour la livraison (optionnel)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[0, 5, 10, 15, 20].map((amount) => (
                    <Button
                      key={amount}
                      variant={tipAmount === amount ? 'default' : 'outline'}
                      size="sm"
                      type="button"
                      onClick={() => setTipAmount(amount)}
                    >
                      {amount === 0 ? 'Aucun' : `${amount} $`}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Resume de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 rounded-md bg-secondary/50 overflow-hidden">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="h-full w-full object-contain p-1" />
                          )}
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(item.product_price * item.quantity).toFixed(2)} $
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{cartTotal.toFixed(2)} $</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} $`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TPS (5 %)</span>
                      <span>{tps.toFixed(2)} $</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TVQ (9,975 %)</span>
                      <span>{tvq.toFixed(2)} $</span>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pourboire</span>
                        <span>{tipAmount.toFixed(2)} $</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{total.toFixed(2)} $</span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleProceedToPayment}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Chargement...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Aller a Stripe {total.toFixed(2)} $
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" />
                    Paiement securise par Stripe
                  </p>
                </CardContent>
              </Card>

              <Card className="border bg-card">
                <CardContent className="p-4 flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Livraison gratuite a partir de 500 $</p>
                    <p className="text-muted-foreground">Standard: 3 a 5 jours ouvrables</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
