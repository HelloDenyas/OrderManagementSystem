import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthApiError } from '../api/auth'
import { useAuth } from '../context/useAuth'

type LoginFormErrors = {
  username?: string
  password?: string
}

function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({})
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="auth-loading-page" role="status">
        <span className="loading-indicator" aria-hidden="true" />
        <span>Tikrinamas prisijungimas...</span>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/customers" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedUsername = username.trim()
    const errors: LoginFormErrors = {}

    if (!trimmedUsername) {
      errors.username = 'Įveskite naudotojo vardą.'
    }

    if (!password.trim()) {
      errors.password = 'Įveskite slaptažodį.'
    }

    setFormErrors(errors)
    setLoginError('')

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await login({ username: trimmedUsername, password })
      navigate('/customers', { replace: true })
    } catch (error) {
      if (error instanceof AuthApiError && error.reason === 'invalid-credentials') {
        setLoginError('Neteisingas naudotojo vardas arba slaptažodis.')
      } else {
        setLoginError('Prisijungti nepavyko. Bandykite dar kartą.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            UV
          </span>
          <div>
            <p className="app-title">Užsakymų valdymas</p>
            <p className="app-subtitle">Administravimo sistema</p>
          </div>
        </div>

        <div className="auth-card-header">
          <p className="page-eyebrow">Prisijungimas</p>
          <h1 id="login-title">Administratoriaus prisijungimas</h1>
          <p>Prisijunkite, kad galėtumėte valdyti klientus, prekes ir užsakymus.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {loginError && (
            <div className="auth-error-message" role="alert">
              {loginError}
            </div>
          )}

          <div className="auth-form-field">
            <label htmlFor="username">Naudotojo vardas</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              maxLength={100}
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setFormErrors((current) => ({ ...current, username: undefined }))
                setLoginError('')
              }}
              aria-invalid={Boolean(formErrors.username)}
              aria-describedby={formErrors.username ? 'username-error' : undefined}
              disabled={isSubmitting}
            />
            {formErrors.username && (
              <span id="username-error" className="auth-field-error">
                {formErrors.username}
              </span>
            )}
          </div>

          <div className="auth-form-field">
            <label htmlFor="password">Slaptažodis</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setFormErrors((current) => ({ ...current, password: undefined }))
                setLoginError('')
              }}
              aria-invalid={Boolean(formErrors.password)}
              aria-describedby={formErrors.password ? 'password-error' : undefined}
              disabled={isSubmitting}
            />
            {formErrors.password && (
              <span id="password-error" className="auth-field-error">
                {formErrors.password}
              </span>
            )}
          </div>

          <button className="auth-submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Jungiamasi...' : 'Prisijungti'}
          </button>
        </form>

        <p className="auth-card-footer">Prieiga skirta tik sistemos administratoriams.</p>
      </section>
    </main>
  )
}

export default LoginPage
