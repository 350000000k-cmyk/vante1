import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'

type WishlistRow = {
  product: Product | null
}

async function getWishlist(userId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wishlists')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)

  const rows = (data as WishlistRow[] | null) ?? []
  return rows
    .map((item) => item.product)
    .filter((product): product is Product => Boolean(product))
}

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const wishlist = await getWishlist(user.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Wishlist</h1>
      <p className="mt-2 text-muted-foreground">
        {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
      </p>

      {wishlist.length === 0 ? (
        <div className="mt-12 text-center">
          <Heart className="mx-auto size-16 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Save items you like by clicking the heart icon
          </p>
          <Button className="mt-6" asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
