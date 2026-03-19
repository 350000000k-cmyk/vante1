import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Order, Profile } from '@/lib/types'

type RecentOrder = Order & {
  profile: Pick<Profile, 'first_name' | 'last_name'> | null
}

async function getStats() {
  const supabase = await createClient()
  
  const [products, orders, revenue] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('status', 'delivered'),
  ])

  const totalRevenue = revenue.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  return {
    productCount: products.count || 0,
    orderCount: orders.count || 0,
    totalRevenue,
  }
}

async function getRecentOrders(): Promise<RecentOrder[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      profile:profiles(first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (data as RecentOrder[]) || []
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const recentOrders = await getRecentOrders()

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: stats.orderCount.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      value: stats.productCount.toString(),
      change: '+2',
      trend: 'up',
      icon: Package,
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '-0.4%',
      trend: 'down',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Overview of your store performance
      </p>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`mt-1 flex items-center text-xs ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="mr-1 size-3" />
                ) : (
                  <ArrowDownRight className="mr-1 size-3" />
                )}
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your store</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3">
                        {order.profile?.first_name} {order.profile?.last_name}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-700' 
                            : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 font-medium">${Number(order.total).toFixed(2)}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
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
