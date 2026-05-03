'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './auth-context'

export interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  product_image: string | null
  product_slug: string
  quantity: number
}

export interface WishlistItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  product_image: string | null
  product_slug: string
  product_stock: number
}

interface CartContextType {
  cartItems: CartItem[]
  wishlistItems: WishlistItem[]
  cartCount: number
  wishlistCount: number
  cartTotal: number
  isLoading: boolean
  addToCart: (product: { id: string; name: string; price: number; image: string }) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  addToWishlist: (product: { id: string; name: string; price: number; image: string; slug: string; stock: number }) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInCart: (productId: string) => boolean
  isInWishlist: (productId: string) => boolean
  moveToCartFromWishlist: (productId: string) => Promise<void>
  refreshCart: () => Promise<void>
  refreshWishlist: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function withTimeout<T>(promise: PromiseLike<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('La requete a expire. Veuillez reessayer.')), ms)
    }),
  ])
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // useMemo garantit une instance stable — évite de recréer fetchCart/fetchWishlist à chaque render
  const supabase = useMemo(() => createClient(), [])

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      return
    }

    const { data, error } = await withTimeout(
      supabase
        .from('cart_items')
        .select('*, products(slug)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    )

    if (error) {
      console.error('Erreur lors du chargement du panier:', error)
      return
    }

    const items: CartItem[] = (data ?? []).map((row) => {
      const { products, ...rest } = row as typeof row & { products: { slug: string } | null }
      return { ...rest, product_slug: products?.slug ?? '' }
    })
    setCartItems(items)
  }, [user, supabase])

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([])
      return
    }

    const { data, error } = await withTimeout(
      supabase
        .from('wishlist')
        .select('*, products(stock)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    )

    if (error) {
      console.error('Erreur lors du chargement de la liste de souhaits:', error)
      return
    }

    const items: WishlistItem[] = (data ?? []).map((row) => {
      const { products, ...rest } = row as typeof row & { products: { stock: number } | null }
      return {
        ...rest,
        product_name: rest.product_name ?? '',
        product_price: rest.product_price ?? 0,
        product_slug: rest.product_slug ?? '',
        product_stock: products?.stock ?? 0,
      }
    })
    setWishlistItems(items)
  }, [user, supabase])

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([fetchCart(), fetchWishlist()])
      } catch (error) {
        console.error('Erreur lors du chargement du panier ou des favoris:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fetchCart, fetchWishlist])

 
  const addToCart = async (product: { id: string; name: string; price: number; image: string }) => {
    if (!user) return

    const existingItem = cartItems.find(item => item.product_id === product.id)

    if (existingItem) {
      await updateCartQuantity(product.id, existingItem.quantity + 1)
    } else {
      const { error } = await withTimeout(
        supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_image: product.image || null,
            quantity: 1,
            updated_at: new Date().toISOString(),
          })
      )

      if (error) {
        console.error('Erreur lors de l\'ajout au panier:', error)
        throw new Error(error.message)
      }

      await fetchCart()
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return

    const { error } = await withTimeout(
      supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
    )

    if (error) {
      console.error('Erreur lors de la suppression du panier:', error)
      throw new Error(error.message)
    }

    setCartItems(prev => prev.filter(item => item.product_id !== productId))
  }

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!user) return

    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    const { error } = await withTimeout(
      supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('product_id', productId)
    )

    if (error) {
      console.error('Erreur lors de la mise a jour de la quantite:', error)
      throw new Error(error.message)
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = async () => {
    if (!user) return

    const { error } = await withTimeout(
      supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
    )

    if (error) {
      console.error('Erreur lors du vidage du panier:', error)
      throw new Error(error.message)
    }

    setCartItems([])
  }

  
  const addToWishlist = async (product: { id: string; name: string; price: number; image: string; slug: string; stock: number }) => {
    if (!user) return


    if (isInWishlist(product.id)) return

    const { data, error } = await withTimeout(
      supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image || null,
          product_slug: product.slug,
        })
        .select('*')
        .single()
    )

    if (error) {
      console.error('Erreur lors de l\'ajout a la liste de souhaits:', error)
      throw new Error(error.message)
    }

    setWishlistItems(prev => [
      { ...(data as Omit<WishlistItem, 'product_stock'>), product_stock: product.stock },
      ...prev.filter(item => item.product_id !== product.id),
    ])
  }

  
  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    const { error } = await withTimeout(
      supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
    )

    if (error) {
      console.error('Erreur lors de la suppression de la liste de souhaits:', error)
      throw new Error(error.message)
    }

    setWishlistItems(prev => prev.filter(item => item.product_id !== productId))
  }

 
  const moveToCartFromWishlist = async (productId: string) => {
    const wishlistItem = wishlistItems.find(item => item.product_id === productId)
    if (!wishlistItem) return

    await addToCart({
      id: wishlistItem.product_id,
      name: wishlistItem.product_name,
      price: wishlistItem.product_price,
      image: wishlistItem.product_image || '',
    })

    await removeFromWishlist(productId)
  }

 
  const isInCart = (productId: string) => {
    return cartItems.some(item => item.product_id === productId)
  }

  
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId)
  }

  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        cartTotal,
        isLoading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInCart,
        isInWishlist,
        moveToCartFromWishlist,
        refreshCart: fetchCart,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart doit etre utilise a l\'interieur d\'un CartProvider')
  }
  return context
}
