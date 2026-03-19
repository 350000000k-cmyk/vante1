export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category: string
  brand: string
  images: string[]
  sizes: string[]
  colors: string[]
  stock: number
  is_featured: boolean
  is_new: boolean
  is_on_sale: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  label: string | null
  street: string
  city: string
  state: string
  zip: string
  country: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping: number
  tax: number
  total: number
  shipping_address: Address | null
  payment_intent_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  size: string | null
  color: string | null
  price: number
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  size: string | null
  color: string | null
  created_at: string
  product?: Product
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  title: string | null
  comment: string | null
  is_verified: boolean
  created_at: string
  profile?: Profile
}
