import { useEffect, useState } from 'react'
import CustomerForm from '../components/CustomerForm'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import type { Customer, CustomerPayload } from '../types/Customer'

type Notification = {
  type: 'success' | 'error'
  message: string
}

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

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

  function openCreateForm() {
    setEditingCustomer(null)
    setFormError(null)
    setNotification(null)
    setIsFormOpen(true)
  }

  function openEditForm(customer: Customer) {
    setEditingCustomer(customer)
    setFormError(null)
    setNotification(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingCustomer(null)
    setFormError(null)
  }

  async function saveCustomer(values: CustomerPayload) {
    const isEditing = editingCustomer !== null
    const requestUrl = isEditing
      ? `/api/customers/${editingCustomer.id}`
      : '/api/customers'

    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await fetch(requestUrl, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Customer save failed')
      }

      closeForm()
      setNotification({
        type: 'success',
        message: isEditing
          ? 'Kliento duomenys sėkmingai atnaujinti.'
          : 'Klientas sėkmingai sukurtas.',
      })
      setReloadKey((key) => key + 1)
    } catch {
      setFormError(
        isEditing
          ? 'Nepavyko atnaujinti kliento. Bandykite dar kartą.'
          : 'Nepavyko sukurti kliento. Bandykite dar kartą.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteCustomer(customer: Customer) {
    const isConfirmed = window.confirm(
      `Ar tikrai norite ištrinti klientą „${customer.name}“?`,
    )

    if (!isConfirmed) {
      return
    }

    setDeletingCustomerId(customer.id)
    setNotification(null)

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Customer delete failed')
      }

      setNotification({
        type: 'success',
        message: 'Klientas sėkmingai ištrintas.',
      })
      setReloadKey((key) => key + 1)
    } catch {
      setNotification({
        type: 'error',
        message: 'Nepavyko ištrinti kliento. Bandykite dar kartą.',
      })
    } finally {
      setDeletingCustomerId(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="page-eyebrow">Valdymas</p>
        <h1>Klientai</h1>
        <p>Peržiūrėkite klientų sąrašą ir raskite klientą pagal vardą arba el. paštą.</p>
      </header>

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

          <div className="toolbar-actions">
            {!isLoading && !error && customers.length > 0 && (
              <p className="customer-count">Rasta: {customers.length}</p>
            )}
            <button type="button" className="primary-button" onClick={openCreateForm}>
              Naujas klientas
            </button>
          </div>
        </div>

        <div className="customers-content" aria-live="polite">
          {isLoading ? (
            <LoadingState message="Kraunami klientai..." />
          ) : error ? (
            <div className="table-message table-message-error">
              <p>{error}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Bandyti dar kartą
              </button>
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              title={
                debouncedSearch
                  ? 'Pagal paiešką klientų nerasta.'
                  : 'Klientų nerasta.'
              }
              description={
                debouncedSearch
                  ? 'Pakeiskite paieškos žodį ir bandykite dar kartą.'
                  : 'Sukurkite pirmą klientą paspausdami „Naujas klientas“.'
              }
            />
          ) : (
            <div className="table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th scope="col">Vardas</th>
                    <th scope="col">El. paštas</th>
                    <th scope="col">Telefonas</th>
                    <th scope="col" className="actions-column">
                      Veiksmai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="customer-name">{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone ?? '—'}</td>
                      <td className="row-actions">
                        <button
                          type="button"
                          className="table-action-button"
                          onClick={() => openEditForm(customer)}
                          disabled={deletingCustomerId === customer.id}
                        >
                          Redaguoti
                        </button>
                        <button
                          type="button"
                          className="table-action-button table-action-danger"
                          onClick={() => void deleteCustomer(customer)}
                          disabled={deletingCustomerId === customer.id}
                        >
                          {deletingCustomerId === customer.id ? 'Trinama...' : 'Ištrinti'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <CustomerForm
          key={editingCustomer?.id ?? 'new'}
          customer={editingCustomer}
          isSubmitting={isSubmitting}
          submitError={formError}
          onSubmit={saveCustomer}
          onCancel={closeForm}
        />
      )}
    </section>
  )
}

export default CustomersPage
