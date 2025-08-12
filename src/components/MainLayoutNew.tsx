import React, { useEffect } from 'react'
import { useNavigate, useLocation, Outlet, Routes, Route } from 'react-router-dom'
import { Menu, Sun, Moon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useAuthStore } from '@/stores/auth'
import { useMockStore } from '@/stores/mock'
import { logger } from '@/utils/logger'

// Import pages
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'

// 导航菜单项
const menuItems = [
  { key: 'dashboard', label: '仪表板', path: '/dashboard' },
  { key: 'users', label: '用户管理', path: '/users' },
  { key: 'servers', label: '服务器', path: '/servers' },
  { key: 'rules', label: '转发规则', path: '/rules' },
  { key: 'settings', label: '设置', path: '/settings' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const { resolvedTheme, toggleTheme } = useTheme()
  const { enabled: mockEnabled, toggleMock } = useMockStore()

  // 检查登录状态
  useEffect(() => {
    logger.info('MainLayout - Auth状态检查:', { 
      isLoading, 
      isAuthenticated, 
      user: user?.name, 
      pathname: location.pathname 
    })
    
    if (!isLoading && !isAuthenticated) {
      logger.info('用户未登录，重定向到登录页')
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate, user, location.pathname])

  // 处理根路径重定向
  useEffect(() => {
    if (location.pathname === '/' && isAuthenticated && !isLoading) {
      navigate('/dashboard')
    }
  }, [location.pathname, isAuthenticated, isLoading, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      logger.error('退出登录失败:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">NSPass</span>
            </a>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {menuItems.map((item) => (
                <Button
                  key={item.key}
                  variant={location.pathname.startsWith(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              {/* Mock toggle */}
              {import.meta.env.DEV && (
                <Button
                  variant={mockEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleMock}
                  className="hidden sm:flex"
                >
                  Mock {mockEnabled ? 'ON' : 'OFF'}
                </Button>
              )}
              
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">切换主题</span>
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium hidden sm:inline-block">
                  {user?.name || '用户'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  退出
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/servers" element={<div>服务器管理页面 (开发中)</div>} />
          <Route path="/rules" element={<div>转发规则页面 (开发中)</div>} />
          <Route path="/settings" element={<div>设置页面 (开发中)</div>} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
