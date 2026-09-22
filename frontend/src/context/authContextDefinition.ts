import { createContext } from 'react'
import type { AuthUser, LoginCredentials } from '../types/Auth'

export type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
