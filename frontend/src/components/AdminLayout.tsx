import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { label: 'Klientai', path: '/customers' },
  { label: 'Prekės', path: '/products' },
  { label: 'Užsakymai', path: '/orders' },
]

function AdminLayout() {
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
        <span className="header-context">Administravimo skydelis</span>
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
