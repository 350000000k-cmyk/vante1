'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null

  return (
    <div className={cn('group relative', className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
          <Image
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_new && (
              <Badge className="bg-foreground text-background">New</Badge>
            )}
            {product.is_on_sale && discount && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
          </div>

          {/* Quick add button */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
            <Button className="w-full" size="sm">
              Quick View
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-xs text-muted-foreground">{product.brand}</p>
          <h3 className="font-medium leading-tight text-balance">{product.name}</h3>
          <div className="flex items-center gap-2">
            <p className="font-semibold">${product.price.toFixed(2)}</p>
            {product.compare_at_price && (
              <p className="text-sm text-muted-foreground line-through">
                ${product.compare_at_price.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 size-8 bg-background/80 backdrop-blur-sm hover:bg-background"
      >
        <Heart className="size-4" />
        <span className="sr-only">Add to wishlist</span>
      </Button>
    </div>
  )
}
