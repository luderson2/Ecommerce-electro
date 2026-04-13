'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ProductCard from '@/components/produits/ProductCard' // Ton vrai composant
import { SectionTitle } from '@/components/section-title'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { formatPrix } from '@/lib/utils'

export default function CartPage() {
  const { user } = useAuth()
  const { cartItems, cartTotal, cartCount, updateCartQuantity, removeFromCart, isLoading } = useCart()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  
  const subtotal = cartTotal
  const taxRate = 0.14975 
  const taxes = subtotal * taxRate
  const shipping = (subtotal >= 500 || subtotal === 0) ? 0 : 25
  const total = subtotal + taxes + shipping

  
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      await updateCartQuantity(productId, newQuantity)
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const handleRemove = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      await removeFromCart(productId)
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

 
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connectez-vous pour voir votre panier</h1>
          <p className="text-muted-foreground mb-6">Identifiez-vous pour accéder à vos articles sauvegardés.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild><Link href="/connexion">Connexion</Link></Button>
            <Button variant="outline" asChild><Link href="/inscription">Inscription</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement du panier...</span>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <SectionTitle
          title="Panier d'achat"
          subtitle={cartCount > 0 ? `${cartCount} article${cartCount !== 1 ? 's' : ''} dans votre panier` : undefined}
        />

        {cartItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-6">Parcourez notre catalogue et trouvez votre bonheur.</p>
            <Button asChild rounded-full>
              <Link href="/catalogue">
                Magasiner maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
             
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-border/50">
                    <div className="flex gap-4 p-4">
                      <div className="relative h-24 w-24 flex-shrink-0 bg-secondary/30 rounded-md overflow-hidden">
                        <Image
                          src={item.product_image || '/placeholder.svg'}
                          alt={item.product_name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/catalogue/${item.product_id}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-lg font-bold text-accent mt-1">{formatPrix(item.product_price)}</p>
                      </div>

                      <div className="flex flex-col items-end justify-between gap-2">
                        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={updatingItems.has(item.product_id) || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold">
                            {updatingItems.has(item.product_id) ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : item.quantity}
                          </span>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={updatingItems.has(item.product_id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost" size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(item.product_id)}
                          disabled={updatingItems.has(item.product_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Retirer
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

             
              <div className="lg:col-span-1">
                <Card className="sticky top-24 shadow-md border-primary/10">
                  <CardHeader><CardTitle>Résumé de la commande</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{formatPrix(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes (TPS + TVQ)</span>
                      <span>{formatPrix(taxes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? 'Gratuit' : formatPrix(shipping)}
                      </span>
                    </div>
                    {subtotal > 0 && subtotal < 500 && (
                      <p className="text-[11px] bg-accent/5 p-2 rounded border border-accent/10 text-accent">
                        Ajoutez <strong>{formatPrix(500 - subtotal)}</strong> de plus pour la livraison gratuite !
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-xl text-primary pt-2">
                      <span>Total</span>
                      <span>{formatPrix(total)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full py-6 text-lg" size="lg" asChild>
                      <Link href="checkout">
                        Passer à la caisse <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}