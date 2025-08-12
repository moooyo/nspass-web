import React, { useEffect } from 'react'
import { useMockStore } from '@/stores/mock'

export function MockProvider({ children }: { children: React.ReactNode }) {
  const { enabled } = useMockStore()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const enableMocking = async () => {
      if (enabled) {
        // Import and start MSW only when needed
        const { worker } = await import('@/mocks/browser')
        await worker.start({
          onUnhandledRequest: 'warn',
        })
        console.log('🔍 Mock Service Worker started')
      }
    }

    enableMocking()
  }, [enabled])

  return <>{children}</>
}
