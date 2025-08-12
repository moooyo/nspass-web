import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'
import { 
  Home, Users, Server, Shield, Router, Database, Settings, 
  BarChart3, UserCheck, Globe, Menu, X, Bell, Search,
  LogOut, User, Moon, Sun, Monitor,
  Activity, Zap
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useMockStore } from '@/stores/mock'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { LoadingPage } from '@/components/ui/loading'
import { logger } from '@/utils/logger'

// Import pages
import ModernDashboard from '../pages/ModernDashboard'
import ModernUsers from '../pages/ModernUsers'
import ModernSubscription from '../pages/ModernSubscription'
import ModernEgress from '../pages/ModernEgress'
import ModernRoutes from '../pages/ModernRoutes'
import ModernIptables from '../pages/ModernIptables'
import ModernForwardRules from '../pages/ModernForwardRules'
import SettingsPage from '../pages/SettingsPage'

// Route configuration
const routes = [
  // Basic functionality group
  {
    key: 'home',
    path: '/home',
    label: '首页', 
    icon: Home,
    component: ModernDashboard,
    group: 'basic'
  },
  {
    key: 'user',
    path: '/user',
    label: '用户信息',
    icon: User,
    component: ModernDashboard, // TODO: 创建用户信息页面
    group: 'basic'
  },
  {
    key: 'forward_rules',
    path: '/forward_rules',
    label: '转发规则',
    icon: Router,
    component: ModernForwardRules,
    aliases: ['/rules'],
    group: 'basic'
  },
  {
    key: 'egress',
    path: '/egress',
    label: '出口配置',
    icon: Globe,
    component: ModernEgress,
    group: 'basic'
  },
  {
    key: 'iptables',
    path: '/iptables',
    label: 'IPTables 管理',
    icon: Shield,
    component: ModernIptables,
    group: 'basic'
  },
  {
    key: 'routes',
    path: '/routes',
    label: '查看线路',
    icon: Router,
    component: ModernRoutes,
    group: 'basic'
  },
  {
    key: 'subscription',
    path: '/subscription',
    label: '订阅管理',
    icon: Globe,
    component: ModernSubscription,
    aliases: ['/subscriptions'],
    group: 'basic'
  },
  
  // Admin functionality group
  {
    key: 'dashboard',
    path: '/dashboard',
    label: '仪表盘',
    icon: BarChart3,
    component: ModernDashboard,
    group: 'admin'
  },
  {
    key: 'users',
    path: '/users',
    label: '用户管理',
    icon: Users,
    component: ModernUsers,
    group: 'admin'
  },
  {
    key: 'user_groups',
    path: '/user_groups',
    label: '用户组管理',
    icon: UserCheck,
    component: ModernDashboard, // TODO: 创建用户组管理页面
    aliases: ['/groups'],
    group: 'admin'
  },
  {
    key: 'servers',
    path: '/servers',
    label: '服务器管理',
    icon: Server,
    component: ModernDashboard, // TODO: 创建服务器管理页面
    group: 'admin'
  },
  {
    key: 'dns_config',
    path: '/dns_config',
    label: 'DNS配置',
    icon: Database,
    component: ModernDashboard, // TODO: 创建DNS配置页面
    aliases: ['/dns'],
    group: 'admin'
  },
  {
    key: 'website',
    path: '/website',
    label: '网站配置',
    icon: Settings,
    component: ModernDashboard, // TODO: 创建网站配置页面
    group: 'admin'
  },
  {
    key: 'settings',
    path: '/settings',
    label: '系统设置',
    icon: Settings,
    component: SettingsPage,
    group: 'admin'
  },
]

export default function ModernMainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading, logout, hasPermission } = useAuthStore()
  const { enabled: mockEnabled, toggleMock } = useMockStore()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 启用全局快捷键
  useKeyboardShortcuts()

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
      if (route.group === 'basic') return true
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

  // Filter routes by search
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return groupedRoutes
    
    const filterGroup = (group: typeof routes) => 
      group.filter(route => 
        route.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    return {
      basic: filterGroup(groupedRoutes.basic),
      admin: filterGroup(groupedRoutes.admin)
    }
  }, [groupedRoutes, searchQuery])

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
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  // Loading state
  if (isLoading) {
    return <LoadingPage message="正在初始化系统..." />
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-lg gradient-text">NSPass</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索菜单..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-6">
            {/* Basic Functions */}
            {filteredRoutes.basic.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  基础功能
                </h3>
                <div className="space-y-1">
                  {filteredRoutes.basic.map((route) => (
                    <Button
                      key={route.key}
                      variant={currentRoute?.key === route.key ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start font-normal transition-all duration-200",
                        currentRoute?.key === route.key 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => handleRouteClick(route)}
                    >
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Functions */}
            {filteredRoutes.admin.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  管理功能
                </h3>
                <div className="space-y-1">
                  {filteredRoutes.admin.map((route) => (
                    <Button
                      key={route.key}
                      variant={currentRoute?.key === route.key ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start font-normal transition-all duration-200",
                        currentRoute?.key === route.key 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => handleRouteClick(route)}
                    >
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border">
            {mockEnabled && (
              <div className="mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={toggleMock}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Mock模式
                </Button>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>系统正常运行</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "lg:ml-0"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-full items-center justify-between px-4">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div>
                <h2 className="font-semibold text-lg">{currentRoute?.label}</h2>
                <p className="text-xs text-muted-foreground">
                  {location.pathname}
                </p>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {/* Theme toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {getThemeIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    浅色模式
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    深色模式
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("auto")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    跟随系统
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/user')}>
                    <User className="mr-2 h-4 w-4" />
                    个人信息
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={<route.component />}
              />
            ))}
            {/* Aliases */}
            {routes.flatMap(route => 
              route.aliases?.map(alias => (
                <Route
                  key={`${route.key}-${alias}`}
                  path={alias}
                  element={<route.component />}
                />
              )) || []
            )}
            {/* Default route */}
            <Route path="/" element={<ModernDashboard />} />
            <Route path="*" element={<ModernDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
