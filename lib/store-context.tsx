'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, Product } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface StoreContextType {
  user: User | null
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  isLoading: boolean
  addToCart: (product: Product, size: string, color: string, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  const refreshCart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)

    if (data) {
      setCart(data as CartItem[])
    }
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await refreshCart()
      }
      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await refreshCart()
      } else {
        setCart([])
      }
    })

    return () => subscription.unsubscribe()
  }, [refreshCart, supabase])

  const addToCart = async (product: Product, size: string, color: string, quantity = 1) => {
    if (!user) return

    const existingItem = cart.find(
      item => item.product_id === product.id && item.size === size && item.color === color
    )

    if (existingItem) {
      await updateCartQuantity(existingItem.id, existingItem.quantity + quantity)
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        size,
        color,
        quantity,
      })
      await refreshCart()
    }
  }

  const removeFromCart = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId)
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const clearCart = async () => {
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setCart([])
  }

  return (
    <StoreContext.Provider value={{
      user,
      cart,
      cartCount,
      cartTotal,
      isLoading,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      refreshCart,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
