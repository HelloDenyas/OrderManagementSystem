export const ORDER_STATUSES = [
  'Naujas',
  'Vykdomas',
  'Įvykdytas',
  'Atšauktas',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderItem = {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type Order = {
  id: number
  customerId: number
  customerName: string
  status: OrderStatus
  totalAmount: number
  createdAtUtc: string
  items: OrderItem[]
}

export type CreateOrderPayload = {
  customerId: number
  items: Array<{
    productId: number
    quantity: number
  }>
}
