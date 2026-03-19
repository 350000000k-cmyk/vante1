'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/lib/store-context'

export default function CartPage() {
  const router = useRouter()
  const { user, cart, cartTotal, isLoading, updateCartQuantity, removeFromCart } = useStore()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto size-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Your Cart</h1>
          <p className="mt-2 text-muted-foreground">Sign in to view your cart</p>
          <Button className="mt-6" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto size-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Your Cart is Empty</h1>
          <p className="mt-2 text-muted-foreground">Add some items to get started</p>
          <Button className="mt-6" asChild>
            <Link href="/shop">
              Continue Shopping
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const shipping = cartTotal > 100 ? 0 : 9.99
  const tax = cartTotal * 0.08
  const total = cartTotal + shipping + tax

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shopping Cart</h1>
      <p className="mt-2 text-muted-foreground">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border p-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={item.product?.images[0] || '/placeholder.svg'}
                    alt={item.product?.name || 'Product'}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">
                        <Link href={`/product/${item.product?.slug}`} className="hover:underline">
                          {item.product?.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="mr-1 size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="ghost" asChild>
              <Link href="/shop">
                <ArrowRight className="mr-2 size-4 rotate-180" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">${cartTotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd className="font-medium">${tax.toFixed(2)}</dd>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">${total.toFixed(2)}</dd>
              </div>
            </dl>

            {shipping > 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                Free shipping on orders over $100
              </p>
            )}

            <Button 
              className="mt-6 w-full" 
              size="lg"
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
