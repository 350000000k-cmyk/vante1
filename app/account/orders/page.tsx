import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Order, OrderItem } from '@/lib/types'

type OrderWithItems = Order & { order_items: (OrderItem & { product: { name: string; images: string[]; slug: string } })[] }

async function getOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(name, images, slug)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return (data as OrderWithItems[]) || []
}

function getStatusColor(status: string) {
  switch (status) {
    case 'delivered':
      return 'bg-green-500/10 text-green-700 border-green-200'
    case 'shipped':
      return 'bg-blue-500/10 text-blue-700 border-blue-200'
    case 'processing':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
    case 'cancelled':
      return 'bg-red-500/10 text-red-700 border-red-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const orders = await getOrders(user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/account">
          <ArrowLeft className="mr-2 size-4" />
          Back to Account
        </Link>
      </Button>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Order History</h1>
      <p className="mt-2 text-muted-foreground">
        View and track your orders
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <Package className="mx-auto size-16 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">
            When you place orders, they will appear here.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <span className="font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <Image
                          src={item.product?.images?.[0] || '/placeholder.svg'}
                          alt={item.product?.name || 'Product'}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <Link 
                          href={`/product/${item.product?.slug}`}
                          className="font-medium hover:underline"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.size} / {item.color} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
