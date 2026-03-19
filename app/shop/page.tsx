import { Suspense } from 'react'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from '@/components/product-filters'
import { createClient } from '@/lib/supabase/server'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/lib/types'

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    filter?: string
    sort?: string
    q?: string
  }>
}

async function getProducts(searchParams: Awaited<ShopPageProps['searchParams']>): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*')

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.brand) {
    query = query.eq('brand', searchParams.brand)
  }

  if (searchParams.filter === 'new') {
    query = query.eq('is_new', true)
  } else if (searchParams.filter === 'sale') {
    query = query.eq('is_on_sale', true)
  } else if (searchParams.filter === 'featured') {
    query = query.eq('is_featured', true)
  }

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }

  if (searchParams.sort === 'price-asc') {
    query = query.order('price', { ascending: true })
  } else if (searchParams.sort === 'price-desc') {
    query = query.order('price', { ascending: false })
  } else if (searchParams.sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data } = await query
  return (data as Product[]) || []
}

async function getFilters() {
  const supabase = await createClient()
  
  const [categoriesResult, brandsResult] = await Promise.all([
    supabase.from('products').select('category').limit(100),
    supabase.from('products').select('brand').limit(100),
  ])

  const categories = [...new Set(categoriesResult.data?.map(p => p.category) || [])]
  const brands = [...new Set(brandsResult.data?.map(p => p.brand) || [])]

  return { categories, brands }
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      ))}
    </div>
  )
}

async function ProductGrid({ searchParams }: { searchParams: Awaited<ShopPageProps['searchParams']> }) {
  const products = await getProducts(searchParams)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const { categories, brands } = await getFilters()

  const title = params.category 
    ? params.category 
    : params.filter === 'new' 
      ? 'New Arrivals' 
      : params.filter === 'sale' 
        ? 'Sale' 
        : 'All Products'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 lg:shrink-0">
          <ProductFilters categories={categories} brands={brands} />
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
