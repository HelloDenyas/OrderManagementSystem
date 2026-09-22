import { useState, type FormEvent } from 'react'
import type { Customer, CustomerPayload } from '../types/Customer'

type CustomerFormProps = {
  customer: Customer | null
  isSubmitting: boolean
  submitError: string | null
  onSubmit: (values: CustomerPayload) => Promise<void>
  onCancel: () => void
}

type FormErrors = {
  name?: string
  email?: string
  phone?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const namePattern = /^(?=.*\p{L})[\p{L}\p{M} '\u2019-]+$/u
const phonePattern = /^\+?(?=.*[0-9])[0-9 ()-]+$/

function CustomerForm({
  customer,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [name, setName] = useState(customer?.name ?? '')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const nextErrors: FormErrors = {}

    if (!trimmedName) {
      nextErrors.name = 'Įveskite kliento vardą.'
    } else if (!namePattern.test(trimmedName)) {
      nextErrors.name =
        'Vardas gali būti sudarytas tik iš raidžių, tarpų, brūkšnelių ir apostrofų.'
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Įveskite el. pašto adresą.'
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = 'Įveskite galiojantį el. pašto adresą.'
    }

    if (trimmedPhone && !phonePattern.test(trimmedPhone)) {
      nextErrors.phone =
        'Telefono numeris gali turėti tik skaičius ir telefono numeriui įprastus simbolius.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    void onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || null,
    })
  }

  const isEditing = customer !== null
  const titleId = 'customer-form-title'

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
            <p className="form-eyebrow">Klientai</p>
            <h2 id={titleId}>{isEditing ? 'Redaguoti klientą' : 'Naujas klientas'}</h2>
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
            <label htmlFor="customer-name">Vardas</label>
            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={200}
              autoFocus
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'customer-name-error' : undefined}
            />
            {errors.name && (
              <p id="customer-name-error" className="field-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="customer-email">El. paštas</label>
            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'customer-email-error' : undefined}
            />
            {errors.email && (
              <p id="customer-email-error" className="field-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="customer-phone">
              Telefonas <span>(nebūtina)</span>
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={50}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'customer-phone-error' : undefined}
            />
            {errors.phone && (
              <p id="customer-phone-error" className="field-error">
                {errors.phone}
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
                  : 'Sukurti klientą'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CustomerForm
