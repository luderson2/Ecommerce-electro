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
  quantity: number
}

export interface WishlistItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  product_image: string | null
  product_slug: string
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
  addToWishlist: (product: { id: string; name: string; price: number; image: string; slug: string }) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInCart: (productId: string) => boolean
  isInWishlist: (productId: string) => boolean
  moveToCartFromWishlist: (productId: string) => Promise<void>
  refreshCart: () => Promise<void>
  refreshWishlist: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

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

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors du chargement du panier:', error)
      return
    }

    setCartItems(data || [])
  }, [user, supabase])

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([])
      return
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors du chargement de la liste de souhaits:', error)
      return
    }

    setWishlistItems(data as unknown as WishlistItem[] || [])
  }, [user, supabase])

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchCart(), fetchWishlist()])
      setIsLoading(false)
    }
    loadData()
  }, [fetchCart, fetchWishlist])

 
  const addToCart = async (product: { id: string; name: string; price: number; image: string }) => {
    if (!user) return

    const existingItem = cartItems.find(item => item.product_id === product.id)

    if (existingItem) {
      await updateCartQuantity(product.id, existingItem.quantity + 1)
    } else {
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image || null,
        quantity: 1,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Erreur lors de l\'ajout au panier:', error)
        throw new Error(error.message)
      }

      await fetchCart()
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Erreur lors de la suppression du panier:', error)
      return
    }

    await fetchCart()
  }

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!user) return

    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Erreur lors de la mise a jour de la quantite:', error)
      return
    }

    await fetchCart()
  }

  const clearCart = async () => {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Erreur lors du vidage du panier:', error)
      return
    }

    setCartItems([])
  }

  
  const addToWishlist = async (product: { id: string; name: string; price: number; image: string; slug: string }) => {
    if (!user) return

   
    if (isInWishlist(product.id)) return

    const { error } = await supabase.from('wishlist').insert({
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image,
        product_slug: product.slug,
    })

    if (error) {
      console.error('Erreur lors de l\'ajout a la liste de souhaits:', error)
      return
    }

    await fetchWishlist()
  }

  
  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Erreur lors de la suppression de la liste de souhaits:', error)
      return
    }

    await fetchWishlist()
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
