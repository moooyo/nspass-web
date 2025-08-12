import React, { createContext, useContext, useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'

interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto'
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function useSystemTheme() {
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return systemTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, toggleTheme, setResolvedTheme, setInitialized } = useThemeStore()
  const systemTheme = useSystemTheme()

  const resolvedTheme = theme === 'auto' ? systemTheme : theme

  useEffect(() => {
    setResolvedTheme(resolvedTheme)
  }, [resolvedTheme, setResolvedTheme])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    setInitialized(true)
  }, [setInitialized])

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
