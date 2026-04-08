'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CreditCard, Truck, CheckCircle, MapPin, DollarSign, Lock, Loader2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { cartItems, cartTotal, isLoading: cartLoading } = useCart()
  
  const [postalCode, setPostalCode] = useState('')
  const [postalCodeValid, setPostalCodeValid] = useState<boolean | null>(null)
  const [selectedDate, setSelectedDate] = useState('standard')
  const [tipAmount, setTipAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // --- ÉTATS POUR LA VALIDATION DES CHAMPS ---
  const [formData, setFormData] = useState({
    firstName: user?.profile?.first_name || '',
    lastName: user?.profile?.last_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    city: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  })

 
  const isFormValid = () => {
    const requiredFields = [
      formData.firstName, formData.lastName, formData.email, 
      formData.phone, formData.address, formData.city, 
      postalCode, formData.cardName, formData.cardNumber, 
      formData.expiry, formData.cvc
    ]
    return requiredFields.every(field => field.trim() !== '') && postalCodeValid !== false
  }

  
  const subtotal = cartTotal
  const taxRate = 0.14975
  const tax = subtotal * taxRate
  const baseShipping = subtotal >= 500 ? 0 : 25
  const shippingExtra = selectedDate === 'express' ? 79.99 : selectedDate === 'scheduled' ? 59.99 : 0
  const shipping = baseShipping + shippingExtra
  const total = subtotal + tax + shipping + tipAmount

  useEffect(() => {
    if (!authLoading && !cartLoading && cartItems.length === 0) {
      router.push('/catalogue')
    }
  }, [cartItems, authLoading, cartLoading, router])

  const checkPostalCode = () => {
    setPostalCodeValid(postalCode.toUpperCase().startsWith('H') || postalCode.toUpperCase().startsWith('J'))
  }

  const handlePlaceOrder = async () => {
    if (!isFormValid()) return
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert("Commande passée avec succès !")
    setIsProcessing(false)
  }

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* 1. BOUTON RETOUR AU PANIER */}
        <Button variant="ghost" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-primary">
          <Link href="/compte/panier">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour au panier
          </Link>
        </Button>

        <SectionTitle title="Paiement" subtitle="Complétez votre commande" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Étape 1 : Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                  Informations du client
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="Jean" />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Tremblay" />
                </div>
                <div className="space-y-2">
                  <Label>Courriel</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="jean@exemple.com" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 (514) 000-0000" />
                </div>
              </CardContent>
            </Card>

            {/* Étape 2 : Adresse */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="123 rue Principale" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Montréal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Input defaultValue="Québec" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Code postal</Label>
                    <div className="flex gap-2">
                      <Input value={postalCode} onChange={(e) => { setPostalCode(e.target.value); setPostalCodeValid(null); }} placeholder="H1A 1A1" />
                      <Button variant="outline" onClick={checkPostalCode} type="button"><MapPin className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                {postalCodeValid === false && <p className="text-xs text-destructive">Zone non desservie (doit commencer par H ou J)</p>}
              </CardContent>
            </Card>

            
            <Card>
               <CardHeader><CardTitle className="text-lg flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span> Mode de livraison</CardTitle></CardHeader>
               <CardContent>
                 <RadioGroup value={selectedDate} onValueChange={setSelectedDate} className="grid gap-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1">Standard (Gratuit dès 500$)</Label>
                      <Badge variant="secondary">{baseShipping === 0 ? '0$' : '25$'}</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1">Express (1-2 jours)</Label>
                      <Badge variant="secondary">79.99$</Badge>
                    </div>
                 </RadioGroup>
               </CardContent>
            </Card>

            {/* Étape 4 : Paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Nom sur la carte</Label><Input value={formData.cardName} onChange={(e) => setFormData({...formData, cardName: e.target.value})} placeholder="JEAN TREMBLAY" /></div>
                <div className="space-y-2"><Label>Numéro de carte</Label><Input value={formData.cardNumber} onChange={(e) => setFormData({...formData, cardNumber: e.target.value})} placeholder="4242..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Expiration</Label><Input value={formData.expiry} onChange={(e) => setFormData({...formData, expiry: e.target.value})} placeholder="MM/AA" /></div>
                  <div className="space-y-2"><Label>CVC</Label><Input value={formData.cvc} onChange={(e) => setFormData({...formData, cvc: e.target.value})} placeholder="123" /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RÉSUMÉ À DROITE */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader><CardTitle>Résumé de la commande</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate max-w-[180px]">{item.quantity}x {item.product_name}</span>
                      <span className="font-semibold">{(item.product_price * item.quantity).toFixed(2)} $</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toFixed(2)} $</span></div>
                    <div className="flex justify-between"><span>Livraison</span><span>{shipping.toFixed(2)} $</span></div>
                    <div className="flex justify-between"><span>Taxes</span><span>{tax.toFixed(2)} $</span></div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-primary">
                    <span>Total</span>
                    <span>{total.toFixed(2)} $</span>
                  </div>

                  
                  <Button 
                    className="w-full h-12 text-lg" 
                    size="lg" 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !isFormValid()}
                  >
                    {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {!isFormValid() ? "Remplir tous les champs" : "Passer la commande"}
                  </Button>
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