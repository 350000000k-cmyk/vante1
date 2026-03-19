import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .limit(4)
  
  return (data as Product[]) || []
}

async function getNewArrivals(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .limit(4)
  
  return (data as Product[]) || []
}

export default async function HomePage() {
  const [featuredProducts, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&q=80"
            alt="Hero sneaker"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        </div>
        
        <div className="relative mx-auto flex max-w-7xl items-center px-4 py-24 sm:px-6 lg:min-h-[700px] lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              New Season Collection
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Step Into Your Next Adventure
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Discover premium footwear designed for performance and style. From the track to the street, find your perfect pair.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/shop?filter=new">
                  New Arrivals
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Shop by Category</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', href: '/shop?category=Running' },
            { name: 'Lifestyle', image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800', href: '/shop?category=Lifestyle' },
            { name: 'Basketball', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800', href: '/shop?category=Basketball' },
          ].map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Shop now
                  <ArrowRight className="ml-1 inline-block size-4" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured</h2>
              <Button variant="ghost" asChild>
                <Link href="/shop?filter=featured">
                  View all
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="relative aspect-square overflow-hidden rounded-lg lg:aspect-[4/3]">
            <Image
              src="https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800"
              alt="About VANTÉ"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-balance">
              Crafted for Those Who Move
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              At VANTÉ, we believe every step matters. Our curated collection features premium footwear from the world&apos;s leading brands, designed to help you perform at your best while looking your best.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              From cutting-edge running technology to timeless lifestyle classics, we bring you the perfect blend of innovation and style.
            </p>
            <Button className="mt-6" variant="outline" asChild>
              <Link href="/about">
                Learn More About Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">New Arrivals</h2>
              <Button variant="ghost" asChild>
                <Link href="/shop?filter=new">
                  View all
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Get 15% Off Your First Order
            </h2>
            <p className="mt-4 text-background/80 leading-relaxed">
              Sign up for our newsletter and receive exclusive offers, early access to new releases, and more.
            </p>
            <Button className="mt-6 bg-background text-foreground hover:bg-background/90" size="lg" asChild>
              <Link href="#newsletter">
                Subscribe Now
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-10">
          <svg className="size-[500px]" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="50" />
          </svg>
        </div>
      </section>
    </div>
  )
}
