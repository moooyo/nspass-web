import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number // 自动消失时间，0表示不自动消失
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'destructive'
  }>
  timestamp: number
  read: boolean
  persistent?: boolean // 是否持久化存储
}

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
}

interface NotificationActions {
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => string
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  clearRead: () => void
}

let notificationId = 0

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  subscribeWithSelector((set, get) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (notificationData) => {
      const id = `notification-${++notificationId}`
      const notification: AppNotification = {
        ...notificationData,
        id,
        timestamp: Date.now(),
        read: false
      }

      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }))

      // 自动移除通知
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(id)
        }, notification.duration)
      }

      return id
    },

    removeNotification: (id) => {
      set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        const wasUnread = notification && !notification.read
        
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
        }
      })
    },

    markAsRead: (id) => {
      set((state) => {
        const notifications = state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
        const unreadCount = notifications.filter(n => !n.read).length
        
        return { notifications, unreadCount }
      })
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }))
    },

    clearAll: () => {
      set({ notifications: [], unreadCount: 0 })
    },

    clearRead: () => {
      set((state) => {
        const notifications = state.notifications.filter(n => !n.read)
        return { 
          notifications,
          unreadCount: notifications.length
        }
      })
    }
  }))
)

// 便捷的通知方法
export const notify = {
  info: (title: string, message: string, options?: Partial<AppNotification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'info',
      duration: 5000,
      ...options
    })
  },

  success: (title: string, message: string, options?: Partial<AppNotification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'success',
      duration: 4000,
      ...options
    })
  },

  warning: (title: string, message: string, options?: Partial<AppNotification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'warning',
      duration: 6000,
      ...options
    })
  },

  error: (title: string, message: string, options?: Partial<AppNotification>) => {
    return useNotificationStore.getState().addNotification({
      title,
      message,
      type: 'error',
      duration: 0, // 错误通知不自动消失
      ...options
    })
  }
}
