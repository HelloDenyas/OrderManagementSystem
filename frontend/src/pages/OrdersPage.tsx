import { useEffect, useState } from 'react'
import OrderForm from '../components/OrderForm'
import type { Customer } from '../types/Customer'
import {
  ORDER_STATUSES,
  type CreateOrderPayload,
  type Order,
  type OrderStatus,
} from '../types/Order'
import type { Product } from '../types/Product'

type Notification = {
  type: 'success' | 'error'
  message: string
}

const priceFormatter = new Intl.NumberFormat('lt-LT', {
  style: 'currency',
  currency: 'EUR',
})

const dateFormatter = new Intl.DateTimeFormat('lt-LT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [optionsReloadKey, setOptionsReloadKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadOrders() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/orders', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Order request failed')
        }

        const data = (await response.json()) as Order[]
        setOrders(data)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        setOrders([])
        setError('Nepavyko įkelti užsakymų. Patikrinkite, ar veikia serveris.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    if (!isFormOpen) {
      return
    }

    const controller = new AbortController()

    async function loadFormOptions() {
      setIsLoadingOptions(true)
      setOptionsError(null)

      try {
        const [customersResponse, productsResponse] = await Promise.all([
          fetch('/api/customers', { signal: controller.signal }),
          fetch('/api/products', { signal: controller.signal }),
        ])

        if (!customersResponse.ok || !productsResponse.ok) {
          throw new Error('Order options request failed')
        }

        const [customerData, productData] = (await Promise.all([
          customersResponse.json(),
          productsResponse.json(),
        ])) as [Customer[], Product[]]

        setCustomers(customerData)
        setProducts(productData)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        setCustomers([])
        setProducts([])
        setOptionsError('Nepavyko įkelti klientų arba prekių.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingOptions(false)
        }
      }
    }

    void loadFormOptions()

    return () => controller.abort()
  }, [isFormOpen, optionsReloadKey])

  function openCreateForm() {
    setFormError(null)
    setNotification(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setFormError(null)
  }

  async function createOrder(values: CreateOrderPayload) {
    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Order creation failed')
      }

      closeForm()
      setNotification({
        type: 'success',
        message: 'Užsakymas sėkmingai sukurtas.',
      })
      setReloadKey((key) => key + 1)
    } catch {
      setFormError('Nepavyko sukurti užsakymo. Patikrinkite duomenis ir bandykite dar kartą.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateStatus(order: Order, status: OrderStatus) {
    if (status === order.status || updatingOrderId !== null) {
      return
    }

    setUpdatingOrderId(order.id)
    setNotification(null)

    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Order status update failed')
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? { ...currentOrder, status }
            : currentOrder,
        ),
      )
      setNotification({
        type: 'success',
        message: `Užsakymo Nr. ${order.id} būsena atnaujinta.`,
      })
    } catch {
      setNotification({
        type: 'error',
        message: 'Nepavyko atnaujinti užsakymo būsenos.',
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <section className="page">
      <div className="page-heading-row">
        <header className="page-header">
          <p className="page-eyebrow">Valdymas</p>
          <h1>Užsakymai</h1>
          <p>Peržiūrėkite užsakymus, jų prekes ir valdykite vykdymo būseną.</p>
        </header>
        <button type="button" className="primary-button" onClick={openCreateForm}>
          Naujas užsakymas
        </button>
      </div>

      {notification && (
        <div
          className={`notification notification-${notification.type}`}
          role={notification.type === 'error' ? 'alert' : 'status'}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Uždaryti pranešimą"
          >
            ×
          </button>
        </div>
      )}

      <div className="orders-content" aria-live="polite">
        {isLoading ? (
          <div className="orders-state">
            <span className="loading-indicator" aria-hidden="true" />
            <p>Kraunami užsakymai...</p>
          </div>
        ) : error ? (
          <div className="orders-state table-message-error">
            <p>{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
              Bandyti dar kartą
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-state">
            <p>Užsakymų sąrašas šiuo metu tuščias.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <header className="order-card-header">
                  <div>
                    <p className="order-number">Užsakymas Nr. {order.id}</p>
                    <h2>{order.customerName}</h2>
                  </div>

                  <div className="status-control">
                    <label htmlFor={`order-status-${order.id}`}>Būsena</label>
                    <select
                      id={`order-status-${order.id}`}
                      value={order.status}
                      onChange={(event) =>
                        void updateStatus(order, event.target.value as OrderStatus)
                      }
                      disabled={updatingOrderId !== null}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {updatingOrderId === order.id && <span>Atnaujinama...</span>}
                  </div>
                </header>

                <div className="order-summary">
                  <div>
                    <span>Data</span>
                    <strong>{formatDate(order.createdAtUtc)}</strong>
                  </div>
                  <div>
                    <span>Bendra suma</span>
                    <strong>{priceFormatter.format(order.totalAmount)}</strong>
                  </div>
                </div>

                <div className="order-items-section">
                  <h3>Užsakymo prekės</h3>
                  <div className="table-wrapper">
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th scope="col">Prekė</th>
                          <th scope="col">Kiekis</th>
                          <th scope="col">Vieneto kaina</th>
                          <th scope="col">Suma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.productId}>
                            <td>{item.productName}</td>
                            <td>{item.quantity}</td>
                            <td>{priceFormatter.format(item.unitPrice)}</td>
                            <td>{priceFormatter.format(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <OrderForm
          customers={customers}
          products={products}
          isLoadingOptions={isLoadingOptions}
          optionsError={optionsError}
          isSubmitting={isSubmitting}
          submitError={formError}
          onSubmit={createOrder}
          onCancel={closeForm}
          onRetryOptions={() => setOptionsReloadKey((key) => key + 1)}
        />
      )}
    </section>
  )
}

export default OrdersPage
