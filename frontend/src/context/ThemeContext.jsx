import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext(null)

function applyDarkMode() {
  const root = document.documentElement
  root.classList.add('dark')
}

export function ThemeProvider({ children }) {
  useEffect(() => {
    applyDarkMode()
  }, [])

  const value = { theme: 'dark' }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
