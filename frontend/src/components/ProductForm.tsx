import { useState, type FormEvent } from 'react'
import type { Product, ProductPayload } from '../types/Product'

type ProductFormProps = {
  product: Product | null
  isSubmitting: boolean
  submitError: string | null
  onSubmit: (values: ProductPayload) => Promise<void>
  onCancel: () => void
}

type FormErrors = {
  name?: string
  price?: string
  stockQuantity?: string
  category?: string
}

function ProductForm({
  product,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [stockQuantity, setStockQuantity] = useState(
    product ? String(product.stockQuantity) : '',
  )
  const [category, setCategory] = useState(product?.category ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedCategory = category.trim()
    const trimmedPrice = price.trim()
    const trimmedStockQuantity = stockQuantity.trim()
    const parsedPrice = Number(trimmedPrice)
    const parsedStockQuantity = Number(trimmedStockQuantity)
    const nextErrors: FormErrors = {}

    if (!trimmedName) {
      nextErrors.name = 'Įveskite prekės pavadinimą.'
    }

    if (!trimmedPrice) {
      nextErrors.price = 'Įveskite prekės kainą.'
    } else if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      nextErrors.price = 'Kaina turi būti skaičius, ne mažesnis nei 0.'
    }

    if (!trimmedStockQuantity) {
      nextErrors.stockQuantity = 'Įveskite kiekį sandėlyje.'
    } else if (!Number.isInteger(parsedStockQuantity) || parsedStockQuantity < 0) {
      nextErrors.stockQuantity =
        'Kiekis turi būti sveikasis skaičius, ne mažesnis nei 0.'
    }

    if (!trimmedCategory) {
      nextErrors.category = 'Įveskite prekės kategoriją.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    void onSubmit({
      name: trimmedName,
      price: parsedPrice,
      stockQuantity: parsedStockQuantity,
      category: trimmedCategory,
    })
  }

  const isEditing = product !== null
  const titleId = 'product-form-title'

  return (
    <div className="modal-backdrop">
      <section
        className="customer-form-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="form-header">
          <div>
            <p className="form-eyebrow">Prekės</p>
            <h2 id={titleId}>{isEditing ? 'Redaguoti prekę' : 'Nauja prekė'}</h2>
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

        <form className="customer-form" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <div className="form-error-message" role="alert">
              {submitError}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="product-name">Pavadinimas</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={200}
              autoFocus
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'product-name-error' : undefined}
            />
            {errors.name && (
              <p id="product-name-error" className="field-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="product-price">Kaina</label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? 'product-price-error' : undefined}
            />
            {errors.price && (
              <p id="product-price-error" className="field-error">
                {errors.price}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="product-stock">Kiekis sandėlyje</label>
            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              aria-invalid={Boolean(errors.stockQuantity)}
              aria-describedby={
                errors.stockQuantity ? 'product-stock-error' : undefined
              }
            />
            {errors.stockQuantity && (
              <p id="product-stock-error" className="field-error">
                {errors.stockQuantity}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="product-category">Kategorija</label>
            <input
              id="product-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              maxLength={100}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? 'product-category-error' : undefined
              }
            />
            {errors.category && (
              <p id="product-category-error" className="field-error">
                {errors.category}
              </p>
            )}
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
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting
                ? 'Išsaugoma...'
                : isEditing
                  ? 'Išsaugoti pakeitimus'
                  : 'Sukurti prekę'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProductForm
