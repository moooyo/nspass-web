import { create } from 'zustand'

interface MockState {
  enabled: boolean
  interceptedRequests: number
}

interface MockActions {
  toggleMock: () => void
  setEnabled: (enabled: boolean) => void
  incrementRequests: () => void
  resetRequests: () => void
}

export type MockStore = MockState & MockActions

export const useMockStore = create<MockStore>()((set, get) => ({
  // State
  enabled: import.meta.env.DEV, // Enable mock by default in development
  interceptedRequests: 0,

  // Actions
  toggleMock: () => {
    const { enabled } = get()
    set({ enabled: !enabled })
  },

  setEnabled: (enabled) => {
    set({ enabled })
  },

  incrementRequests: () => {
    set((state) => ({ interceptedRequests: state.interceptedRequests + 1 }))
  },

  resetRequests: () => {
    set({ interceptedRequests: 0 })
  },
}))
