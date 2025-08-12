import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { authService } from '@/services/auth'
import { logger } from '@/utils/logger'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  permissions: string[]
  provider?: string // OAuth2 provider
  role?: string // User role
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginMethod: string | null
  isInitialized: boolean
}

interface AuthActions {
  // Basic setters
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setLoginMethod: (method: string | null) => void
  setInitialized: (initialized: boolean) => void
  
  // Complex actions
  login: (user: User, method: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>
  
  // Permission utilities
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: true,
        loginMethod: null,
        isInitialized: false,

        // Basic setters
        setUser: (user) => set({ user }),
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setLoading: (isLoading) => set({ isLoading }),
        setLoginMethod: (loginMethod) => set({ loginMethod }),
        setInitialized: (initialized) => set({ isInitialized: initialized }),
        
        // Complex actions
        login: async (user: User, method: string) => {
          try {
            logger.info('Login action:', { user: user.name, method })
            
            // Update state immediately for UI responsiveness
            set({ 
              user, 
              isAuthenticated: true, 
              loginMethod: method,
              isLoading: false 
            })
            
            // Save to localStorage for persistence
            try {
              localStorage.setItem('user', JSON.stringify(user))
              localStorage.setItem('login_method', method)
            } catch (error) {
              logger.error('Failed to save auth data to localStorage:', error)
            }
          } catch (error) {
            logger.error('Login failed:', error)
            throw error
          }
        },
        
        logout: async () => {
          try {
            logger.info('Logout action')
            
            // Update state immediately
            set({ 
              user: null, 
              isAuthenticated: false, 
              loginMethod: null,
              isLoading: false
            })
            
            // Clean up localStorage
            try {
              localStorage.removeItem('user')
              localStorage.removeItem('login_method')
              localStorage.removeItem('auth_token')
              
              // Clean OAuth2 related data
              const keys = Object.keys(localStorage)
              keys.forEach(key => {
                if (key.startsWith('oauth2_')) {
                  localStorage.removeItem(key)
                }
              })
            } catch (error) {
              logger.error('Failed to cleanup localStorage:', error)
            }
            
            // Call auth service logout
            await authService.logout()
          } catch (error) {
            logger.error('Logout failed:', error)
            throw error
          }
        },
        
        refreshUser: async () => {
          try {
            const { isInitialized } = get()
            if (!isInitialized) {
              await get().initialize()
            }
          } catch (error) {
            logger.error('Refresh user failed:', error)
          }
        },
        
        initialize: async () => {
          try {
            set({ isLoading: true })
            
            // Load from localStorage
            const userStr = localStorage.getItem('user')
            const loginMethod = localStorage.getItem('login_method')
            
            if (userStr) {
              const user = JSON.parse(userStr) as User
              set({
                user,
                isAuthenticated: true,
                loginMethod,
                isLoading: false,
                isInitialized: true
              })
              logger.info('User loaded from localStorage:', user.name)
            } else {
              set({
                isLoading: false,
                isInitialized: true
              })
            }
          } catch (error) {
            logger.error('Initialize failed:', error)
            set({
              isLoading: false,
              isInitialized: true
            })
          }
        },
        
        // Permission utilities
        hasPermission: (permission: string) => {
          const { user } = get()
          if (!user) return false
          return user.permissions?.includes(permission) || user.permissions?.includes('admin')
        },
        
        hasRole: (role: string) => {
          const { user } = get()
          if (!user) return false
          return user.role === role || user.role === 'admin'
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          loginMethod: state.loginMethod,
        }),
        onRehydrateStorage: () => (state) => {
          // Initialize after rehydration
          if (state) {
            state.initialize()
          }
        },
      }
    )
  )
)
