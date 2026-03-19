'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Truck, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useStore } from '@/lib/store-context'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, cart, cartTotal, clearCart } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  })

  const supabase = createClient()

  if (!user) {
    router.push('/auth/login')
    return null
  }

  if (cart.length === 0 && !orderComplete) {
    router.push('/cart')
    return null
  }

  const shipping = cartTotal > 100 ? 0 : 9.99
  const tax = cartTotal * 0.08
  const total = cartTotal + shipping + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal: cartTotal,
          shipping,
          tax,
          total,
          status: 'pending',
          shipping_address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
          },
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product?.price || 0,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      await clearCart()
      
      setOrderId(order.id)
      setOrderComplete(true)
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <CheckCircle className="mx-auto size-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
          {orderId && (
            <p className="mt-4 text-sm text-muted-foreground">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>
          )}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/cart">
          <ArrowLeft className="mr-2 size-4" />
          Back to Cart
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Checkout Form */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Contact */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                Contact Information
              </h2>
              <FieldGroup className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Field>
              </FieldGroup>
            </div>

            <Separator />

            {/* Shipping */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                <Truck className="size-5" />
                Shipping Address
              </h2>
              <FieldGroup className="mt-4">
                <Field>
                  <FieldLabel htmlFor="street">Street Address</FieldLabel>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="state">State</FieldLabel>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="zip">ZIP Code</FieldLabel>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
            </div>

            <Separator />

            {/* Payment */}
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
                <CreditCard className="size-5" />
                Payment
              </h2>
              <FieldGroup className="mt-4">
                <Field>
                  <FieldLabel htmlFor="cardNumber">Card Number</FieldLabel>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="cardExpiry">Expiry Date</FieldLabel>
                    <Input
                      id="cardExpiry"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cardCvc">CVC</FieldLabel>
                    <Input
                      id="cardCvc"
                      name="cardCvc"
                      placeholder="123"
                      value={formData.cardCvc}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
              <p className="mt-2 text-xs text-muted-foreground">
                This is a demo. No real payments are processed.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            
            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={item.product?.images[0] || '/placeholder.svg'}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.size} / {item.color} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <dl className="space-y-4 text-sm">
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
          </div>
        </div>
      </div>
    </div>
  )
}
