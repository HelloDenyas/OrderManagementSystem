import { useEffect, useState } from 'react'
import type { Customer } from '../types/Customer'

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCustomers() {
      setIsLoading(true)
      setError(null)

      const query = debouncedSearch
        ? `?search=${encodeURIComponent(debouncedSearch)}`
        : ''

      try {
        const response = await fetch(`/api/customers${query}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Customer request failed')
        }

        const data = (await response.json()) as Customer[]
        setCustomers(data)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        setCustomers([])
        setError('Nepavyko įkelti klientų. Patikrinkite, ar veikia serveris.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadCustomers()

    return () => controller.abort()
  }, [debouncedSearch, reloadKey])

  return (
    <section className="page">
      <header className="page-header">
        <p className="page-eyebrow">Valdymas</p>
        <h1>Klientai</h1>
        <p>Peržiūrėkite klientų sąrašą ir raskite klientą pagal vardą arba el. paštą.</p>
      </header>

      <div className="customers-card">
        <div className="customers-toolbar">
          <div className="search-field">
            <label htmlFor="customer-search">Ieškoti klientų</label>
            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Vardas arba el. paštas"
              autoComplete="off"
            />
          </div>

          {!isLoading && !error && customers.length > 0 && (
            <p className="customer-count">Rasta: {customers.length}</p>
          )}
        </div>

        <div className="customers-content" aria-live="polite">
          {isLoading ? (
            <div className="table-message">
              <span className="loading-indicator" aria-hidden="true" />
              <p>Kraunami klientai...</p>
            </div>
          ) : error ? (
            <div className="table-message table-message-error">
              <p>{error}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Bandyti dar kartą
              </button>
            </div>
          ) : customers.length === 0 ? (
            <div className="table-message">
              <p>
                {debouncedSearch
                  ? 'Pagal jūsų paiešką klientų nerasta.'
                  : 'Klientų sąrašas šiuo metu tuščias.'}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th scope="col">Vardas</th>
                    <th scope="col">El. paštas</th>
                    <th scope="col">Telefonas</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="customer-name">{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CustomersPage
