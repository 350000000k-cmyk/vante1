import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Profile } from '@/lib/types'

async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return data as Profile | null
}

async function getOrderCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  return count || 0
}

async function getWishlistCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('wishlists')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  return count || 0
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [profile, orderCount, wishlistCount] = await Promise.all([
    getProfile(user.id),
    getOrderCount(user.id),
    getWishlistCount(user.id),
  ])

  const menuItems = [
    {
      title: 'Orders',
      description: `${orderCount} order${orderCount !== 1 ? 's' : ''}`,
      href: '/account/orders',
      icon: Package,
    },
    {
      title: 'Wishlist',
      description: `${wishlistCount} item${wishlistCount !== 1 ? 's' : ''}`,
      href: '/wishlist',
      icon: Heart,
    },
    {
      title: 'Addresses',
      description: 'Manage shipping addresses',
      href: '/account/addresses',
      icon: MapPin,
    },
    {
      title: 'Settings',
      description: 'Account preferences',
      href: '/account/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Account</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {profile?.first_name || user.email}
        </p>
      </div>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {profile?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <CardTitle>
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'Your Profile'}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/account/settings">
              <User className="mr-2 size-4" />
              Edit Profile
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Menu Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-colors hover:bg-secondary/50">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <form action="/auth/signout" method="post" className="mt-8">
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          <LogOut className="mr-2 size-4" />
          Sign Out
        </Button>
      </form>
    </div>
  )
}
