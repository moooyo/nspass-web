import React, { createContext, useContext, useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'

interface ThemeContextType {
  theme: 'light' | 'dark'
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)


export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, toggleTheme, setResolvedTheme, setInitialized } = useThemeStore()

  const resolvedTheme = theme

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
