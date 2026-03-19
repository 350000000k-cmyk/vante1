'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store-context'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface AddToCartFormProps {
  product: Product
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const router = useRouter()
  const { user, addToCart } = useStore()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const sizes = product.sizes as string[]
  const colors = product.colors as string[]

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!selectedSize) {
      setError('Please select a size')
      return
    }

    if (!selectedColor) {
      setError('Please select a color')
      return
    }

    setError('')
    setIsLoading(true)
    
    try {
      await addToCart(product, selectedSize, selectedColor, quantity)
      router.push('/cart')
    } catch {
      setError('Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Size</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size)
                  setError('')
                }}
                className={cn(
                  'flex h-10 min-w-[40px] items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:bg-accent'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Color</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color)
                  setError('')
                }}
                className={cn(
                  'flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors',
                  selectedColor === color
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:bg-accent'
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <Label className="text-sm font-medium">Quantity</Label>
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          size="lg" 
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isLoading || product.stock === 0}
        >
          <ShoppingBag className="mr-2 size-5" />
          {product.stock === 0 ? 'Out of Stock' : isLoading ? 'Adding...' : 'Add to Cart'}
        </Button>
        <Button variant="outline" size="lg">
          <Heart className="size-5" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>
    </div>
  )
}
