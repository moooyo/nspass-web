import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppSettings {
  // UI 设置
  sidebarCollapsed: boolean
  compactMode: boolean
  animations: boolean
  
  // 功能设置
  autoSave: boolean
  autoRefresh: boolean
  refreshInterval: number
  
  // 开发者设置
  debugMode: boolean
  showPerformanceMetrics: boolean
  mockDataEnabled: boolean
}

interface SettingsState {
  settings: AppSettings
}

interface SettingsActions {
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => void
}

const defaultSettings: AppSettings = {
  sidebarCollapsed: false,
  compactMode: false,
  animations: true,
  autoSave: true,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  debugMode: import.meta.env.DEV,
  showPerformanceMetrics: import.meta.env.DEV,
  mockDataEnabled: import.meta.env.DEV
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      resetSettings: () => {
        set({
          settings: { ...defaultSettings }
        })
      },

      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2)
      },

      importSettings: (settingsJson: string) => {
        try {
          const importedSettings = JSON.parse(settingsJson)
          set((state) => ({
            settings: {
              ...state.settings,
              // 只导入有效的设置键
              ...Object.keys(defaultSettings).reduce((acc, key) => {
                if (key in importedSettings) {
                  (acc as any)[key] = importedSettings[key]
                }
                return acc
              }, {} as Partial<AppSettings>)
            }
          }))
        } catch (error) {
          console.error('Failed to import settings:', error)
          throw new Error('Invalid settings format')
        }
      }
    }),
    {
      name: 'nspass-settings',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 版本迁移逻辑
        if (version === 0) {
          return {
            settings: { ...defaultSettings, ...persistedState.settings }
          }
        }
        return persistedState
      }
    }
  )
)
