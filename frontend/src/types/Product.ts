export type Product = {
  id: number
  name: string
  price: number
  stockQuantity: number
  category: string
}

export type ProductPayload = Omit<Product, 'id'>
