import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getCurrentUser, loginAdmin, logoutAdmin } from '../api/auth'
import type { AuthUser, LoginCredentials } from '../types/Auth'
import { AuthContext } from './authContextDefinition'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser()

        if (isActive) {
          setUser(currentUser)
        }
      } catch {
        if (isActive) {
          setUser(null)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void restoreSession()

    return () => {
      isActive = false
    }
  }, [])

  async function login(credentials: LoginCredentials) {
    const authenticatedUser = await loginAdmin(credentials)
    setUser(authenticatedUser)
  }

  async function logout() {
    try {
      await logoutAdmin()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
