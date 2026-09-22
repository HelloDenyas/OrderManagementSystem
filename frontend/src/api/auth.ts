import type { AuthUser, LoginCredentials } from '../types/Auth'

export type AuthErrorReason = 'invalid-credentials' | 'request-failed'

export class AuthApiError extends Error {
  reason: AuthErrorReason

  constructor(reason: AuthErrorReason) {
    super(reason)
    this.reason = reason
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new AuthApiError('request-failed')
  }

  return (await response.json()) as AuthUser
}

export async function loginAdmin(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  })

  if (response.status === 401) {
    throw new AuthApiError('invalid-credentials')
  }

  if (!response.ok) {
    throw new AuthApiError('request-failed')
  }

  return (await response.json()) as AuthUser
}

export async function logoutAdmin(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok && response.status !== 401) {
    throw new AuthApiError('request-failed')
  }
}
