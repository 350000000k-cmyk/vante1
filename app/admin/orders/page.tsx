import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderStatusSelect } from '@/components/order-status-select'
import type { Order } from '@/lib/types'

type OrderWithProfile = Order & { profile: { first_name: string | null; last_name: string | null; } | null }

async function getOrders(): Promise<OrderWithProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      profile:profiles(first_name, last_name)
    `)
    .order('created_at', { ascending: false })
  
  return (data as OrderWithProfile[]) || []
}

function getStatusColor(status: string) {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-700'
    case 'shipped':
      return 'bg-blue-100 text-blue-700'
    case 'processing':
      return 'bg-yellow-100 text-yellow-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const processingCount = orders.filter(o => o.status === 'processing').length
  const shippedCount = orders.filter(o => o.status === 'shipped').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h1>
      <p className="mt-2 text-muted-foreground">
        Manage and track customer orders
      </p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{shippedCount}</div>
            <p className="text-sm text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>{orders.length} total orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3">
                        {order.profile?.first_name} {order.profile?.last_name}
                      </td>
                      <td className="py-3 font-medium">${Number(order.total).toFixed(2)}</td>
                      <td className="py-3">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
