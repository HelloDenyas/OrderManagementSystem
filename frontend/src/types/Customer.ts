export type Customer = {
  id: number
  name: string
  email: string
  phone: string | null
}

export type CustomerPayload = Omit<Customer, 'id'>
