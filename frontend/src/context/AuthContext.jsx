import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as storage from '../services/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => storage.getSession())

  const login = useCallback((email, password) => {
    const user = storage.findUser(email, password)
    if (!user) return { ok: false, error: 'Invalid email or password.' }
    const next = { email: user.email, name: user.name }
    storage.setSession(next)
    setSessionState(next)
    return { ok: true }
  }, [])

  const signup = useCallback((name, email, password) => {
    const res = storage.saveUser({ name, email, password })
    if (!res.ok) return res
    const next = { email: email.toLowerCase(), name }
    storage.setSession(next)
    setSessionState(next)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    storage.setSession(null)
    setSessionState(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session,
      isAuthenticated: Boolean(session),
      login,
      signup,
      logout,
    }),
    [session, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
