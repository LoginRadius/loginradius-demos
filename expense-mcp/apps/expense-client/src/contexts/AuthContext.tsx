import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch, ApiError } from '../lib/api'
import { lrHubOrigin, serverOrigin } from '../lib/env'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  refresh: () => Promise<User | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Re-fetches the session identity. Callers must await this after any flow that
  // mutates the session cookie (login callback, logout) — the provider mounts once
  // for the app lifetime, so it will not otherwise observe a newly issued session.
  const refresh = useCallback(async (): Promise<User | null> => {
    setLoading(true)
    try {
      const me = await apiFetch<User>('/users/me')
      setUser(me)
      return me
    } catch (err: unknown) {
      // Only a 401 is a definitive "no session"; network/5xx errors must not be
      // silently downgraded to an anonymous state.
      if (err instanceof ApiError && err.status === 401) {
        setUser(null)
        return null
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh().catch(() => setUser(null))
  }, [refresh])

  const logout = async () => {
    // Clears our own session cookie.
    await fetch(`${serverOrigin}/oidc/logout`, { method: 'POST', credentials: 'include' })

    // Then end the LoginRadius session itself. Sent no-cors because the hub is a
    // different origin and does not allow ours: the request still goes out with
    // cookies and the Set-Cookie clearing them is still honoured, we just cannot
    // read the response. Failure here must not strand the user in a signed-in
    // UI, so the local session is cleared either way.
    try {
      await fetch(`${lrHubOrigin}/ssologin/logout`, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'include',
      })
    } catch {
      // Best effort — the local session is gone regardless.
    }

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
