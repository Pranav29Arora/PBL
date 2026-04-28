import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'

const AuthContext = createContext(null)

function getFriendlyAuthError(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again shortly.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was canceled.'
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked by your browser.'
    default:
      return error?.message || 'Authentication failed.'
  }
}

function toSession(firebaseUser) {
  if (!firebaseUser) return null
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Investor',
  }
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [provider] = useState(() => {
    const next = new GoogleAuthProvider()
    next.setCustomParameters({ prompt: 'select_account' })
    return next
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setSessionState(toSession(firebaseUser))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      setSessionState(toSession(credential.user))
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getFriendlyAuthError(error) }
    }
  }, [])

  const signup = useCallback(async (name, email, password) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(credential.user, { displayName: name.trim() })
      setSessionState(toSession({ ...credential.user, displayName: name.trim() }))
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getFriendlyAuthError(error) }
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    try {
      const credential = await signInWithPopup(auth, provider)
      setSessionState(toSession(credential.user))
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getFriendlyAuthError(error) }
    }
  }, [provider])

  const logout = useCallback(async () => {
    await signOut(auth)
    setSessionState(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session,
      loading,
      isAuthenticated: Boolean(session),
      login,
      signup,
      loginWithGoogle,
      logout,
    }),
    [session, loading, login, signup, loginWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
