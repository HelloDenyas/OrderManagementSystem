import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import type { Customer } from '../types/Customer'
import {
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from '../types/Order'
import type { Product } from '../types/Product'

type DashboardSummary = {
  customerCount: number
  productCount: number
  orderCount: number
  statusCounts: Record<OrderStatus, number>
}

const emptyStatusCounts: Record<OrderStatus, number> = {
  Naujas: 0,
  Vykdomas: 0,
  Įvykdytas: 0,
  Atšauktas: 0,
}

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadSummary() {
      setIsLoading(true)
      setError(null)

      try {
        const [customersResponse, productsResponse, ordersResponse] =
          await Promise.all([
            fetch('/api/customers', { signal: controller.signal }),
            fetch('/api/products', { signal: controller.signal }),
            fetch('/api/orders', { signal: controller.signal }),
          ])

        if (
          !customersResponse.ok ||
          !productsResponse.ok ||
          !ordersResponse.ok
        ) {
          throw new Error('Dashboard request failed')
        }

        const [customers, products, orders] = (await Promise.all([
          customersResponse.json(),
          productsResponse.json(),
          ordersResponse.json(),
        ])) as [Customer[], Product[], Order[]]

        const statusCounts = orders.reduce<Record<OrderStatus, number>>(
          (counts, order) => {
            counts[order.status] += 1
            return counts
          },
          { ...emptyStatusCounts },
        )

        setSummary({
          customerCount: customers.length,
          productCount: products.length,
          orderCount: orders.length,
          statusCounts,
        })
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        setSummary(null)
        setError('Nepavyko įkelti apžvalgos. Patikrinkite, ar veikia serveris.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadSummary()

    return () => controller.abort()
  }, [reloadKey])

  return (
    <section className="page dashboard-page">
      <header className="page-header">
        <p className="page-eyebrow">Pagrindinis</p>
        <h1>Apžvalga</h1>
        <p>Svarbiausia užsakymų valdymo sistemos informacija vienoje vietoje.</p>
      </header>

      <div className="dashboard-content" aria-live="polite">
        {isLoading ? (
          <LoadingState message="Kraunama apžvalga..." />
        ) : error ? (
          <div className="dashboard-error table-message-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
              Bandyti dar kartą
            </button>
          </div>
        ) : summary ? (
          <>
            <div className="dashboard-summary-grid">
              <Link className="summary-card" to="/customers">
                <span className="summary-card-label">Klientai</span>
                <strong>{summary.customerCount}</strong>
                <span className="summary-card-link">Peržiūrėti klientus</span>
              </Link>
              <Link className="summary-card" to="/products">
                <span className="summary-card-label">Prekės</span>
                <strong>{summary.productCount}</strong>
                <span className="summary-card-link">Peržiūrėti prekes</span>
              </Link>
              <Link className="summary-card" to="/orders">
                <span className="summary-card-label">Užsakymai</span>
                <strong>{summary.orderCount}</strong>
                <span className="summary-card-link">Peržiūrėti užsakymus</span>
              </Link>
              <Link className="summary-card summary-card-highlight" to="/orders">
                <span className="summary-card-label">Nauji užsakymai</span>
                <strong>{summary.statusCounts.Naujas}</strong>
                <span className="summary-card-link">Atverti užsakymus</span>
              </Link>
            </div>

            <section className="dashboard-section" aria-labelledby="status-summary-title">
              <div className="dashboard-section-heading">
                <div>
                  <p className="section-eyebrow">Užsakymai</p>
                  <h2 id="status-summary-title">Būsenų suvestinė</h2>
                </div>
                <Link to="/orders">Visi užsakymai</Link>
              </div>
              <div className="status-summary-grid">
                {ORDER_STATUSES.map((status) => (
                  <div className="status-summary-item" key={status}>
                    <StatusBadge status={status} />
                    <strong>{summary.statusCounts[status]}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-section" aria-labelledby="shortcuts-title">
              <div className="dashboard-section-heading">
                <div>
                  <p className="section-eyebrow">Greita prieiga</p>
                  <h2 id="shortcuts-title">Valdymo skyriai</h2>
                </div>
              </div>
              <div className="shortcut-grid">
                <Link to="/customers">
                  <strong>Klientai</strong>
                  <span>Klientų sąrašas ir duomenų valdymas</span>
                </Link>
                <Link to="/products">
                  <strong>Prekės</strong>
                  <span>Prekių, kainų ir likučių valdymas</span>
                </Link>
                <Link to="/orders">
                  <strong>Užsakymai</strong>
                  <span>Užsakymų kūrimas ir būsenų valdymas</span>
                </Link>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default DashboardPage
