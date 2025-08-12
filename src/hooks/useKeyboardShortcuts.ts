import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useAuthStore } from '@/stores/auth'
import { useMockStore } from '@/stores/mock'
import { notify } from '@/stores/notifications'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  category: string
  disabled?: boolean
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const { setTheme, toggleTheme } = useTheme()
  const { logout } = useAuthStore()
  const { toggleMock } = useMockStore()
  const shortcutsRef = useRef<KeyboardShortcut[]>([])

  // 定义全局快捷键
  const shortcuts: KeyboardShortcut[] = [
    // 导航快捷键
    {
      key: 'h',
      altKey: true,
      action: () => navigate('/'),
      description: '返回首页',
      category: '导航'
    },
    {
      key: 'd',
      altKey: true,
      action: () => navigate('/dashboard'),
      description: '打开仪表盘',
      category: '导航'
    },
    {
      key: 'u',
      altKey: true,
      action: () => navigate('/users'),
      description: '用户管理',
      category: '导航'
    },
    {
      key: 's',
      altKey: true,
      action: () => navigate('/settings'),
      description: '系统设置',
      category: '导航'
    },

    // 功能快捷键
    {
      key: 't',
      ctrlKey: true,
      action: toggleTheme,
      description: '切换主题',
      category: '功能'
    },
    {
      key: 'm',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        toggleMock()
        notify.info('Mock模式', `Mock模式已${useMockStore.getState().enabled ? '开启' : '关闭'}`)
      },
      description: '切换Mock模式',
      category: '开发'
    },
    {
      key: 'l',
      ctrlKey: true,
      shiftKey: true,
      action: async () => {
        await logout()
        notify.info('已退出', '您已成功退出登录')
      },
      description: '退出登录',
      category: '账户'
    },

    // 搜索快捷键
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // 触发全局搜索
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: '全局搜索',
      category: '搜索'
    },

    // 帮助快捷键
    {
      key: '?',
      shiftKey: true,
      action: () => {
        showShortcutsModal()
      },
      description: '显示快捷键帮助',
      category: '帮助'
    }
  ]

  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 忽略在输入框中的按键
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      // 除了特殊的全局快捷键
      if (!(event.ctrlKey && event.key === 'k')) {
        return
      }
    }

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.metaKey === event.metaKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey &&
        !shortcut.disabled
      )
    })

    if (matchingShortcut) {
      event.preventDefault()
      event.stopPropagation()
      
      try {
        matchingShortcut.action()
      } catch (error) {
        console.error('Keyboard shortcut error:', error)
        notify.error('快捷键错误', '执行快捷键时发生错误')
      }
    }
  }, [navigate, toggleTheme, logout, toggleMock])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts: shortcutsRef.current,
    addShortcut: (shortcut: KeyboardShortcut) => {
      shortcutsRef.current.push(shortcut)
    },
    removeShortcut: (key: string) => {
      shortcutsRef.current = shortcutsRef.current.filter(s => s.key !== key)
    }
  }
}

function showShortcutsModal() {
  // 这里应该显示快捷键帮助模态框
  // 暂时使用通知代替
  notify.info('快捷键帮助', '按 Alt+H 返回首页，Ctrl+T 切换主题，Ctrl+K 全局搜索')
}

// 格式化快捷键显示
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.metaKey) parts.push('Cmd')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')
  
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join(' + ')
}
