import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  User, 
  UsersIcon, 
  Server, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  Shield,
  Globe,
  Database,
  Router,
  UserCheck,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useMockStore } from '@/stores/mock'
import { useTheme } from '@/components/providers/ThemeProvider'
import { logger } from '@/utils/logger'
import { cn } from '@/lib/utils'

// Import pages
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'

// Route configuration with complete menu structure
const routes = [
  // Basic functionality group
  {
    key: 'home',
    path: '/home',
    label: '首页', 
    icon: Home,
    component: Dashboard,
    group: 'basic'
  },
  {
    key: 'user',
    path: '/user',
    label: '用户信息',
    icon: User,
    component: Dashboard, // Placeholder - can be replaced with actual UserInfo component
    group: 'basic'
  },
  {
    key: 'forward_rules',
    path: '/forward_rules',
    label: '转发规则',
    icon: Router,
    component: Dashboard, // Placeholder
    aliases: ['/rules'],
    group: 'basic'
  },
  {
    key: 'egress',
    path: '/egress',
    label: '出口配置',
    icon: Globe,
    component: Dashboard, // Placeholder
    group: 'basic'
  },
  {
    key: 'iptables',
    path: '/iptables',
    label: 'iptables 管理',
    icon: Shield,
    component: Dashboard, // Placeholder
    group: 'basic'
  },
  {
    key: 'routes',
    path: '/routes',
    label: '查看线路',
    icon: Router,
    component: Dashboard, // Placeholder
    group: 'basic'
  },
  
  // Admin functionality group
  {
    key: 'dashboard',
    path: '/dashboard',
    label: '仪表盘',
    icon: BarChart3,
    component: Dashboard,
    group: 'admin'
  },
  {
    key: 'users',
    path: '/users',
    label: '用户管理',
    icon: UsersIcon,
    component: Users,
    group: 'admin'
  },
  {
    key: 'user_groups',
    path: '/user_groups',
    label: '用户组管理',
    icon: UserCheck,
    component: Dashboard, // Placeholder
    aliases: ['/groups'],
    group: 'admin'
  },
  {
    key: 'servers',
    path: '/servers',
    label: '服务器管理',
    icon: Server,
    component: Dashboard, // Placeholder
    group: 'admin'
  },
  {
    key: 'dns_config',
    path: '/dns_config',
    label: 'DNS配置',
    icon: Database,
    component: Dashboard, // Placeholder
    aliases: ['/dns'],
    group: 'admin'
  },
  {
    key: 'website',
    path: '/website',
    label: '网站配置',
    icon: Settings,
    component: Dashboard, // Placeholder
    group: 'admin'
  },
]

export default function MainLayoutNew() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading, logout, hasPermission } = useAuthStore()
  const { enabled: mockEnabled, toggleMock, requestCount: mockRequestCount } = useMockStore()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      logger.info('User not authenticated, redirecting to login')
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  // Get current route
  const currentRoute = useMemo(() => {
    return routes.find(route => {
      if (route.path === location.pathname) return true
      if (route.aliases?.includes(location.pathname)) return true
      return false
    }) || routes[0]
  }, [location.pathname])

  // Filter routes based on user permissions
  const visibleRoutes = useMemo(() => {
    return routes.filter(route => {
      // Basic routes are visible to all authenticated users
      if (route.group === 'basic') return true
      // Admin routes require admin permission
      if (route.group === 'admin') return hasPermission('admin') || user?.role === 'admin'
      return true
    })
  }, [hasPermission, user?.role])

  // Group routes for sidebar display
  const groupedRoutes = useMemo(() => {
    const basic = visibleRoutes.filter(r => r.group === 'basic')
    const admin = visibleRoutes.filter(r => r.group === 'admin')
    return { basic, admin }
  }, [visibleRoutes])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      logger.error('Logout failed:', error)
    }
  }

  const handleRouteClick = (route: typeof routes[0]) => {
    navigate(route.path)
    setSidebarOpen(false)
  }

  const getThemeIcon = () => {
    switch (resolvedTheme) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null // useEffect will handle redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">NSPass</h1>
              {mockEnabled && (
                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                  Mock ({mockRequestCount})
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {getThemeIcon()}
            </Button>

            {/* Mock toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMock}
              className={cn(
                mockEnabled && "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
              )}
            >
              Mock {mockEnabled ? 'ON' : 'OFF'}
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user?.name || 'User'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full pt-14 md:pt-0">
            <div className="flex-1 px-3 py-4">
              {/* Basic functionality */}
              {groupedRoutes.basic.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    基础功能
                  </h3>
                  <nav className="space-y-1">
                    {groupedRoutes.basic.map((route) => {
                      const Icon = route.icon
                      const isActive = currentRoute?.key === route.key
                      
                      return (
                        <Button
                          key={route.key}
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleRouteClick(route)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {route.label}
                        </Button>
                      )
                    })}
                  </nav>
                </div>
              )}

              {/* Admin functionality */}
              {groupedRoutes.admin.length > 0 && (
                <div>
                  <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    系统管理
                  </h3>
                  <nav className="space-y-1">
                    {groupedRoutes.admin.map((route) => {
                      const Icon = route.icon
                      const isActive = currentRoute?.key === route.key
                      
                      return (
                        <Button
                          key={route.key}
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleRouteClick(route)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {route.label}
                        </Button>
                      )
                    })}
                  </nav>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                {currentRoute?.label || '首页'}
              </h2>
              <p className="text-muted-foreground">
                {user ? `欢迎，${user.name}` : '欢迎使用 NSPass 管理系统'}
              </p>
            </div>

            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Main routes */}
              {routes.map((route) => {
                const Component = route.component
                return (
                  <Route 
                    key={route.key}
                    path={route.path} 
                    element={<Component />} 
                  />
                )
              })}
              
              {/* Alias routes */}
              {routes
                .filter(route => route.aliases && route.aliases.length > 0)
                .flatMap(route => 
                  route.aliases!.map(alias => {
                    const Component = route.component
                    return (
                      <Route 
                        key={`${route.key}-${alias}`}
                        path={alias} 
                        element={<Component />} 
                      />
                    )
                  })
                )}

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
