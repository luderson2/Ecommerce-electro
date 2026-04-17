'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SectionTitle } from '@/components/section-title'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'

export default function WishlistPage() {
  const { user } = useAuth()
  const { wishlistItems, wishlistCount, removeFromWishlist, moveToCartFromWishlist, isLoading } = useCart()
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set())

  const handleRemove = async (productId: string) => {
    setProcessingItems(prev => new Set(prev).add(productId))
    try {
      await removeFromWishlist(productId)
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const handleMoveToCart = async (productId: string) => {
    setProcessingItems(prev => new Set(prev).add(productId))
    try {
      await moveToCartFromWishlist(productId)
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Connectez-vous pour voir votre liste de souhaits</h1>
            <p className="text-muted-foreground mb-6">
              Vous devez etre connecte pour sauvegarder des articles dans votre liste de souhaits.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/inscription">Inscription</Link>
              </Button>
            </div>
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
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement de la liste de souhaits...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <SectionTitle
          title="Ma liste de souhaits"
          subtitle={wishlistCount > 0 ? `${wishlistCount} article${wishlistCount !== 1 ? 's' : ''} sauvegarde${wishlistCount !== 1 ? 's' : ''}` : undefined}
        />

        {wishlistItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Votre liste de souhaits est vide</h2>
            <p className="text-muted-foreground mb-6">
              Sauvegardez les articles que vous aimez et ils apparaitront ici.
            </p>
            <Button asChild>
              <Link href="/catalogue">
                Commencer a magasiner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card border rounded-lg">
              <span className="text-sm text-muted-foreground">
                {wishlistCount} article{wishlistCount !== 1 ? 's' : ''} dans votre liste de souhaits
              </span>
              <Button asChild>
                <Link href="/catalogue">
                  Continuer le magasinage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="group overflow-hidden border bg-card">
                  <div className="relative aspect-square overflow-hidden bg-secondary/50">
                    <Link href={`/catalogue/${item.product_slug}`} className="relative block h-full w-full">
                      <Image
                        src={item.product_image || '/placeholder.svg?height=300&width=300'}
                        alt={item.product_name}
                        fill
                        className="object-contain p-4"
                      />
                    </Link>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/catalogue/${item.product_slug}`}>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
                        {item.product_name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-semibold">{item.product_price.toFixed(2)} $</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => handleMoveToCart(item.product_id)}
                        disabled={processingItems.has(item.product_id)}
                      >
                        {processingItems.has(item.product_id) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        Ajouter au panier
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(item.product_id)}
                        disabled={processingItems.has(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Retirer de la liste</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
