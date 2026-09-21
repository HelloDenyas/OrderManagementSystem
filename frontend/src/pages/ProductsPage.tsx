import { useEffect, useState } from 'react'
import ProductForm from '../components/ProductForm'
import type { Product, ProductPayload } from '../types/Product'

type Notification = {
  type: 'success' | 'error'
  message: string
}

const priceFormatter = new Intl.NumberFormat('lt-LT', {
  style: 'currency',
  currency: 'EUR',
})

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      const query = debouncedSearch
        ? `?search=${encodeURIComponent(debouncedSearch)}`
        : ''

      try {
        const response = await fetch(`/api/products${query}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Product request failed')
        }

        const data = (await response.json()) as Product[]
        setProducts(data)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        setProducts([])
        setError('Nepavyko įkelti prekių. Patikrinkite, ar veikia serveris.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => controller.abort()
  }, [debouncedSearch, reloadKey])

  function openCreateForm() {
    setEditingProduct(null)
    setFormError(null)
    setNotification(null)
    setIsFormOpen(true)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setFormError(null)
    setNotification(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingProduct(null)
    setFormError(null)
  }

  async function saveProduct(values: ProductPayload) {
    const isEditing = editingProduct !== null
    const requestUrl = isEditing
      ? `/api/products/${editingProduct.id}`
      : '/api/products'

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
        throw new Error('Product save failed')
      }

      closeForm()
      setNotification({
        type: 'success',
        message: isEditing
          ? 'Prekės duomenys sėkmingai atnaujinti.'
          : 'Prekė sėkmingai sukurta.',
      })
      setReloadKey((key) => key + 1)
    } catch {
      setFormError(
        isEditing
          ? 'Nepavyko atnaujinti prekės. Bandykite dar kartą.'
          : 'Nepavyko sukurti prekės. Bandykite dar kartą.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteProduct(product: Product) {
    const isConfirmed = window.confirm(
      `Ar tikrai norite ištrinti prekę „${product.name}“?`,
    )

    if (!isConfirmed) {
      return
    }

    setDeletingProductId(product.id)
    setNotification(null)

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Product delete failed')
      }

      setNotification({
        type: 'success',
        message: 'Prekė sėkmingai ištrinta.',
      })
      setReloadKey((key) => key + 1)
    } catch {
      setNotification({
        type: 'error',
        message: 'Nepavyko ištrinti prekės. Bandykite dar kartą.',
      })
    } finally {
      setDeletingProductId(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="page-eyebrow">Valdymas</p>
        <h1>Prekės</h1>
        <p>Peržiūrėkite prekes ir raskite jas pagal pavadinimą arba kategoriją.</p>
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
            <label htmlFor="product-search">Ieškoti prekių</label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pavadinimas arba kategorija"
              autoComplete="off"
            />
          </div>

          <div className="toolbar-actions">
            {!isLoading && !error && products.length > 0 && (
              <p className="customer-count">Rasta: {products.length}</p>
            )}
            <button type="button" className="primary-button" onClick={openCreateForm}>
              Nauja prekė
            </button>
          </div>
        </div>

        <div className="customers-content" aria-live="polite">
          {isLoading ? (
            <div className="table-message">
              <span className="loading-indicator" aria-hidden="true" />
              <p>Kraunamos prekės...</p>
            </div>
          ) : error ? (
            <div className="table-message table-message-error">
              <p>{error}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Bandyti dar kartą
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="table-message">
              <p>
                {debouncedSearch
                  ? 'Pagal jūsų paiešką prekių nerasta.'
                  : 'Prekių sąrašas šiuo metu tuščias.'}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th scope="col">Pavadinimas</th>
                    <th scope="col">Kaina</th>
                    <th scope="col">Kiekis sandėlyje</th>
                    <th scope="col">Kategorija</th>
                    <th scope="col" className="actions-column">
                      Veiksmai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="customer-name">{product.name}</td>
                      <td>{priceFormatter.format(product.price)}</td>
                      <td>{product.stockQuantity}</td>
                      <td>{product.category}</td>
                      <td className="row-actions">
                        <button
                          type="button"
                          className="table-action-button"
                          onClick={() => openEditForm(product)}
                          disabled={deletingProductId === product.id}
                        >
                          Redaguoti
                        </button>
                        <button
                          type="button"
                          className="table-action-button table-action-danger"
                          onClick={() => void deleteProduct(product)}
                          disabled={deletingProductId === product.id}
                        >
                          {deletingProductId === product.id ? 'Trinama...' : 'Ištrinti'}
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
        <ProductForm
          key={editingProduct?.id ?? 'new'}
          product={editingProduct}
          isSubmitting={isSubmitting}
          submitError={formError}
          onSubmit={saveProduct}
          onCancel={closeForm}
        />
      )}
    </section>
  )
}

export default ProductsPage
