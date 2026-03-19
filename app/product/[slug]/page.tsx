import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AddToCartForm } from '@/components/add-to-cart-form'
import { ProductCard } from '@/components/product-card'
import { Badge } from '@/components/ui/badge'
import type { Product, Review } from '@/lib/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  
  return data as Product | null
}

async function getReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(first_name, last_name)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return (data as Review[]) || []
}

async function getRelatedProducts(product: Product): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(4)
  
  return (data as Product[]) || []
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  
  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${product.name} | VANTÉ`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const [reviews, relatedProducts] = await Promise.all([
    getReviews(product.id),
    getRelatedProducts(product),
  ])

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-4" />
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="size-4" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-foreground">
          {product.category}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
            <Image
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.is_new && (
              <Badge className="absolute top-4 left-4 bg-foreground text-background">New</Badge>
            )}
            {product.is_on_sale && discount && (
              <Badge variant="destructive" className="absolute top-4 right-4">-{discount}%</Badge>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            {product.name}
          </h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`size-5 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-muted'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-6 text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Add to Cart Form */}
          <AddToCartForm product={product} />

          {/* Product Details */}
          <div className="mt-8 space-y-4 border-t pt-8">
            <h3 className="font-semibold">Product Details</h3>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Brand</dt>
                <dd>{product.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category</dt>
                <dd>{product.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Availability</dt>
                <dd className={product.stock > 0 ? 'text-green-600' : 'text-destructive'}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16 border-t pt-16">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="mt-8 space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`size-4 ${i < review.rating ? 'text-yellow-400' : 'text-muted'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {review.is_verified && (
                    <Badge variant="secondary">Verified Purchase</Badge>
                  )}
                </div>
                {review.title && (
                  <h4 className="mt-2 font-medium">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="mt-2 text-muted-foreground">{review.comment}</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t pt-16">
          <h2 className="text-2xl font-bold">You May Also Like</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
