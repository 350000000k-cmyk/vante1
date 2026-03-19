'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .limit(5)

    setResults((data as Product[]) || [])
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchProducts(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, searchProducts])

  const handleSelect = (product: Product) => {
    onOpenChange(false)
    setQuery('')
    router.push(`/product/${product.slug}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onOpenChange(false)
      router.push(`/shop?q=${encodeURIComponent(query)}`)
      setQuery('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[10%] translate-y-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-2 border-b pb-4">
            <Search className="size-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent p-0 text-lg focus-visible:ring-0"
              autoFocus
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setQuery('')}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </form>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Products
            </p>
            <div className="space-y-1">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-accent"
                >
                  <div className="relative size-12 overflow-hidden rounded bg-secondary">
                    <Image
                      src={product.images[0] || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                  <p className="font-semibold">${product.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isLoading && query && results.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No products found for &ldquo;{query}&rdquo;
          </div>
        )}

        {!query && (
          <div className="py-8 text-center text-muted-foreground">
            Start typing to search products
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
