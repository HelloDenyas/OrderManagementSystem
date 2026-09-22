import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { Customer } from '../types/Customer'
import type { CreateOrderPayload } from '../types/Order'
import type { Product } from '../types/Product'

type OrderFormProps = {
  customers: Customer[]
  products: Product[]
  isLoadingOptions: boolean
  optionsError: string | null
  isSubmitting: boolean
  submitError: string | null
  onSubmit: (values: CreateOrderPayload) => Promise<void>
  onCancel: () => void
  onRetryOptions: () => void
}

type ProductLine = {
  id: number
  productId: string
  quantity: string
}

type LineError = {
  productId?: string
  quantity?: string
}

const priceFormatter = new Intl.NumberFormat('lt-LT', {
  style: 'currency',
  currency: 'EUR',
})

function OrderForm({
  customers,
  products,
  isLoadingOptions,
  optionsError,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
  onRetryOptions,
}: OrderFormProps) {
  const [customerId, setCustomerId] = useState('')
  const [lines, setLines] = useState<ProductLine[]>([
    { id: 1, productId: '', quantity: '1' },
  ])
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [lineErrors, setLineErrors] = useState<Record<number, LineError>>({})
  const [itemsError, setItemsError] = useState<string | null>(null)
  const nextLineId = useRef(2)

  const estimatedTotal = useMemo(() => {
    const productsById = new Map(products.map((product) => [product.id, product]))

    return lines.reduce((total, line) => {
      const product = productsById.get(Number(line.productId))
      const quantity = Number(line.quantity)

      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        return total
      }

      return total + product.price * quantity
    }, 0)
  }, [lines, products])

  function updateLine(
    lineId: number,
    field: 'productId' | 'quantity',
    value: string,
  ) {
    setLines((currentLines) =>
      currentLines.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line,
      ),
    )
    setLineErrors({})
    setItemsError(null)
  }

  function addLine() {
    setLines((currentLines) => [
      ...currentLines,
      { id: nextLineId.current++, productId: '', quantity: '1' },
    ])
    setItemsError(null)
  }

  function removeLine(lineId: number) {
    setLines((currentLines) => {
      if (currentLines.length === 1) {
        return currentLines
      }

      return currentLines.filter((line) => line.id !== lineId)
    })
    setLineErrors({})
    setItemsError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextLineErrors: Record<number, LineError> = {}
    const selectedProductIds: string[] = []

    if (!customerId) {
      setCustomerError('Pasirinkite klientą.')
    } else {
      setCustomerError(null)
    }

    lines.forEach((line) => {
      const error: LineError = {}
      const quantity = Number(line.quantity)
      const selectedProduct = products.find(
        (product) => String(product.id) === line.productId,
      )

      if (!line.productId) {
        error.productId = 'Pasirinkite prekę.'
      } else if (!selectedProduct) {
        error.productId = 'Pasirinkta prekė nebegalima.'
      } else if (selectedProduct.stockQuantity <= 0) {
        error.productId = 'Šios prekės sandėlyje nėra.'
      } else {
        selectedProductIds.push(line.productId)
      }

      if (!line.quantity.trim()) {
        error.quantity = 'Įveskite kiekį.'
      } else if (!Number.isInteger(quantity) || quantity < 1) {
        error.quantity = 'Kiekis turi būti sveikasis skaičius, ne mažesnis nei 1.'
      } else if (selectedProduct && quantity > selectedProduct.stockQuantity) {
        error.quantity = `Sandėlyje yra tik ${selectedProduct.stockQuantity} vnt.`
      }

      if (error.productId || error.quantity) {
        nextLineErrors[line.id] = error
      }
    })

    const hasDuplicates =
      new Set(selectedProductIds).size !== selectedProductIds.length

    setItemsError(
      hasDuplicates ? 'Tą pačią prekę galima pasirinkti tik vieną kartą.' : null,
    )
    setLineErrors(nextLineErrors)

    if (
      !customerId ||
      Object.keys(nextLineErrors).length > 0 ||
      hasDuplicates
    ) {
      return
    }

    void onSubmit({
      customerId: Number(customerId),
      items: lines.map((line) => ({
        productId: Number(line.productId),
        quantity: Number(line.quantity),
      })),
    })
  }

  return (
    <div className="modal-backdrop">
      <section
        className="order-form-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-form-title"
      >
        <div className="form-header">
          <div>
            <p className="form-eyebrow">Užsakymai</p>
            <h2 id="order-form-title">Naujas užsakymas</h2>
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Uždaryti formą"
          >
            ×
          </button>
        </div>

        {isLoadingOptions ? (
          <div className="order-options-state">
            <span className="loading-indicator" aria-hidden="true" />
            <p>Kraunami klientai ir prekės...</p>
          </div>
        ) : optionsError ? (
          <div className="order-options-state table-message-error">
            <p>{optionsError}</p>
            <button type="button" onClick={onRetryOptions}>
              Bandyti dar kartą
            </button>
          </div>
        ) : (
          <form className="order-form" onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div className="form-error-message" role="alert">
                {submitError}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="order-customer">Klientas</label>
              <select
                id="order-customer"
                value={customerId}
                onChange={(event) => {
                  setCustomerId(event.target.value)
                  setCustomerError(null)
                }}
                aria-invalid={Boolean(customerError)}
                aria-describedby={customerError ? 'order-customer-error' : undefined}
              >
                <option value="">Pasirinkite klientą</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {customerError && (
                <p id="order-customer-error" className="field-error">
                  {customerError}
                </p>
              )}
            </div>

            <div className="order-lines-heading">
              <div>
                <h3>Prekės</h3>
                <p>Pridėkite bent vieną prekę į užsakymą.</p>
              </div>
              <button type="button" className="secondary-button" onClick={addLine}>
                Pridėti prekę
              </button>
            </div>

            {itemsError && (
              <div className="form-error-message" role="alert">
                {itemsError}
              </div>
            )}

            <div className="order-lines">
              {lines.map((line, index) => {
                const error = lineErrors[line.id]
                const selectedProduct = products.find(
                  (product) => String(product.id) === line.productId,
                )

                return (
                  <div className="order-line" key={line.id}>
                    <div className="order-line-number">{index + 1}</div>

                    <div className="form-field">
                      <label htmlFor={`order-product-${line.id}`}>Prekė</label>
                      <select
                        id={`order-product-${line.id}`}
                        value={line.productId}
                        onChange={(event) =>
                          updateLine(line.id, 'productId', event.target.value)
                        }
                        aria-invalid={Boolean(error?.productId)}
                      >
                        <option value="">Pasirinkite prekę</option>
                        {products.map((product) => (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={
                              product.stockQuantity <= 0 ||
                              lines.some(
                                (otherLine) =>
                                  otherLine.id !== line.id &&
                                  otherLine.productId === String(product.id),
                              )
                            }
                          >
                            {product.name} — {priceFormatter.format(product.price)} —{' '}
                            {product.stockQuantity > 0
                              ? `Sandėlyje: ${product.stockQuantity}`
                              : 'Nėra sandėlyje'}
                          </option>
                        ))}
                      </select>
                      {error?.productId && (
                        <p className="field-error">{error.productId}</p>
                      )}
                    </div>

                    <div className="form-field quantity-field">
                      <label htmlFor={`order-quantity-${line.id}`}>Kiekis</label>
                      <input
                        id={`order-quantity-${line.id}`}
                        type="number"
                        min="1"
                        max={selectedProduct?.stockQuantity}
                        step="1"
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(line.id, 'quantity', event.target.value)
                        }
                        aria-invalid={Boolean(error?.quantity)}
                      />
                      {error?.quantity && (
                        <p className="field-error">{error.quantity}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="remove-line-button"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                    >
                      Pašalinti
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="order-total-preview">
              <div>
                <span>Bendra suma</span>
                <strong>{priceFormatter.format(estimatedTotal)}</strong>
              </div>
              <p>
                Preliminari suma pagal dabartines kainas. Galutinę išsaugotą sumą
                apskaičiuoja serveris.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Atšaukti
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Išsaugoma...' : 'Išsaugoti'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default OrderForm
