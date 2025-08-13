import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  isInitialized: boolean
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  setResolvedTheme: (theme: 'light' | 'dark') => void
  setInitialized: (initialized: boolean) => void
  toggleTheme: () => void
}

export type ThemeStore = ThemeState & ThemeActions

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      theme: 'light',
      resolvedTheme: 'light',
      isInitialized: false,

      // Actions
      setTheme: (theme) => {
        set({ theme })
      },

      setResolvedTheme: (resolvedTheme) => {
        set({ resolvedTheme })
      },

      setInitialized: (isInitialized) => {
        set({ isInitialized })
      },

      toggleTheme: () => {
        const { theme } = get()
        if (theme === 'light') {
          set({ theme: 'dark' })
        } else if (theme === 'dark') {
          set({ theme: 'light' })
        } else {
          set({ theme: 'light' })
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
)
