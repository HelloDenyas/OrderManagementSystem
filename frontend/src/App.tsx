import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import SectionPlaceholder from './pages/SectionPlaceholder'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/customers" replace />} />
          <Route
            path="customers"
            element={
              <SectionPlaceholder
                title="Klientai"
                description="Klientų valdymo funkcijos bus įgyvendintos vėliau."
              />
            }
          />
          <Route
            path="products"
            element={
              <SectionPlaceholder
                title="Prekės"
                description="Prekių valdymo funkcijos bus įgyvendintos vėliau."
              />
            }
          />
          <Route
            path="orders"
            element={
              <SectionPlaceholder
                title="Užsakymai"
                description="Užsakymų valdymo funkcijos bus įgyvendintos vėliau."
              />
            }
          />
          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
