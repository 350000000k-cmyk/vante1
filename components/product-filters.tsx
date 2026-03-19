'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface ProductFiltersProps {
  categories: string[]
  brands: string[]
}

export function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-9"
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => {
            const value = e.target.value
            router.push(pathname + '?' + createQueryString('q', value))
          }}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
          <X className="mr-2 size-4" />
          Clear Filters
        </Button>
      )}

      <Separator />

      {/* Sort */}
      <div>
        <h3 className="mb-3 font-semibold">Sort By</h3>
        <RadioGroup
          value={searchParams.get('sort') || ''}
          onValueChange={(value) => {
            router.push(pathname + '?' + createQueryString('sort', value))
          }}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="" id="sort-default" />
            <Label htmlFor="sort-default" className="cursor-pointer">Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest" className="cursor-pointer">Newest</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="price-asc" id="sort-price-asc" />
            <Label htmlFor="sort-price-asc" className="cursor-pointer">Price: Low to High</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="price-desc" id="sort-price-desc" />
            <Label htmlFor="sort-price-desc" className="cursor-pointer">Price: High to Low</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Category</h3>
          <RadioGroup
            value={searchParams.get('category') || ''}
            onValueChange={(value) => {
              router.push(pathname + '?' + createQueryString('category', value))
            }}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="" id="category-all" />
              <Label htmlFor="category-all" className="cursor-pointer">All</Label>
            </div>
            {categories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <RadioGroupItem value={category} id={`category-${category}`} />
                <Label htmlFor={`category-${category}`} className="cursor-pointer">{category}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <Separator />

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Brand</h3>
          <RadioGroup
            value={searchParams.get('brand') || ''}
            onValueChange={(value) => {
              router.push(pathname + '?' + createQueryString('brand', value))
            }}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="" id="brand-all" />
              <Label htmlFor="brand-all" className="cursor-pointer">All</Label>
            </div>
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2">
                <RadioGroupItem value={brand} id={`brand-${brand}`} />
                <Label htmlFor={`brand-${brand}`} className="cursor-pointer">{brand}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <Separator />

      {/* Quick Filters */}
      <div>
        <h3 className="mb-3 font-semibold">Quick Filters</h3>
        <RadioGroup
          value={searchParams.get('filter') || ''}
          onValueChange={(value) => {
            router.push(pathname + '?' + createQueryString('filter', value))
          }}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="" id="filter-none" />
            <Label htmlFor="filter-none" className="cursor-pointer">All Products</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="new" id="filter-new" />
            <Label htmlFor="filter-new" className="cursor-pointer">New Arrivals</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sale" id="filter-sale" />
            <Label htmlFor="filter-sale" className="cursor-pointer">On Sale</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="featured" id="filter-featured" />
            <Label htmlFor="filter-featured" className="cursor-pointer">Featured</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
