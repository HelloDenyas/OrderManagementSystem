import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="auth-loading-page" role="status">
        <span className="loading-indicator" aria-hidden="true" />
        <p>Tikrinama prisijungimo būsena...</p>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
