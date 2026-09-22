import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navigationItems = [
  { label: 'Apžvalga', path: '/dashboard' },
  { label: 'Klientai', path: '/customers' },
  { label: 'Prekės', path: '/products' },
  { label: 'Užsakymai', path: '/orders' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      // The local authentication state is cleared even if the request fails.
    } finally {
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            UV
          </span>
          <div>
            <p className="app-title">Užsakymų valdymas</p>
            <p className="app-subtitle">Administravimo sistema</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="admin-identity">
            <span>Administratorius</span>
            <strong>{user?.username}</strong>
          </div>
          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Atsijungiama...' : 'Atsijungti'}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <p className="sidebar-label">Pagrindinis meniu</p>
          <nav className="sidebar-nav" aria-label="Pagrindinė navigacija">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' nav-link-active' : ''}`
                }
              >
                <span className="nav-indicator" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
