'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ShoppingBag, User, Search, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store-context'

const MobileMenu = dynamic(() => import('@/components/mobile-menu').then(mod => ({ default: mod.MobileMenu })), {
  ssr: false,
})

const navigation = [
  { name: 'Shop', href: '/shop' },
  { name: 'Men', href: '/shop?category=men' },
  { name: 'Women', href: '/shop?category=women' },
  { name: 'New Arrivals', href: '/shop?filter=new' },
  { name: 'Sale', href: '/shop?filter=sale' },
]

export function SiteHeader() {
  const { user, cartCount } = useStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <MobileMenu />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">VANTÉ</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-foreground/80"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/shop">
              <Search className="size-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          
          {user && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="size-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" asChild>
            <Link href={user ? '/account' : '/auth/login'}>
              <User className="size-5" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
