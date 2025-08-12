import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Menu as MenuIcon, 
  X, 
  List, 
  User, 
  Zap, 
  LogOut, 
  ChevronDown, 
  BarChart3, 
  Settings, 
  Users, 
  UsersRound, 
  Server, 
  Cloud, 
  Shield, 
  Rocket,
  PanelLeft,
  PanelRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { message } from '@/utils/message';
import { useAuth } from '@/components/hooks/useAuth';
import { logger } from '@/utils/logger';
// import { useTheme } from '@/components/hooks/useTheme'; // 暂时未使用
import ThemeToggle from '@/components/ThemeToggle';


// 使用 React.lazy 懒加载组件
const HomeContent = React.lazy(() => import('./content/Home'));
const UserInfo = React.lazy(() => import('./content/UserInfo'));
const ForwardRules = React.lazy(() => import('./content/ForwardRules'));
const Egress = React.lazy(() => import('./content/Egress'));
const Iptables = React.lazy(() => import('./content/Iptables'));
const Routes = React.lazy(() => import('./content/Routes'));
const Dashboard = React.lazy(() => import('./content/config/Dashboard'));
const Website = React.lazy(() => import('./content/config/Website'));
const Users = React.lazy(() => import('./content/config/Users'));
const UserGroups = React.lazy(() => import('./content/config/UserGroups'));
const Servers = React.lazy(() => import('./content/config/Servers'));
const DnsConfig = React.lazy(() => import('./content/config/DnsConfig'));
const Subscription = React.lazy(() => import('./content/Subscription'));

// 菜单项配置
interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  group: 'basic' | 'admin';
}

const navigationItems: NavigationItem[] = [
  // 基础功能组
  { key: 'home', label: '首页', icon: <Home className="h-4 w-4" />, group: 'basic' },
  { key: 'user', label: '用户信息', icon: <User className="h-4 w-4" />, group: 'basic' },
  { key: 'forward_rules', label: '转发规则', icon: <List className="h-4 w-4" />, group: 'basic' },
  { key: 'egress', label: '出口配置', icon: <Zap className="h-4 w-4" />, group: 'basic' },
  { key: 'iptables', label: 'iptables 管理', icon: <Shield className="h-4 w-4" />, group: 'basic' },
  { key: 'routes', label: '查看线路', icon: <List className="h-4 w-4" />, group: 'basic' },
  { key: 'subscription', label: '订阅管理', icon: <Rocket className="h-4 w-4" />, group: 'basic' },
  
  // 高级功能组
  { key: 'dashboard', label: '仪表盘', icon: <BarChart3 className="h-4 w-4" />, group: 'admin' },
  { key: 'website', label: '网站配置', icon: <Settings className="h-4 w-4" />, group: 'admin' },
  { key: 'users', label: '用户管理', icon: <Users className="h-4 w-4" />, group: 'admin' },
  { key: 'user_groups', label: '用户组管理', icon: <UsersRound className="h-4 w-4" />, group: 'admin' },
  { key: 'servers', label: '服务器管理', icon: <Server className="h-4 w-4" />, group: 'admin' },
  { key: 'dns_config', label: 'DNS配置', icon: <Cloud className="h-4 w-4" />, group: 'admin' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  // const { resolvedTheme } = useTheme(); // 暂时未使用
  
  const [selectedKey, setSelectedKey] = useState<string>('home');
  
  // 缓存已渲染的组件
  const [renderedTabs, setRenderedTabs] = useState<Set<string>>(new Set(['home']));
  
  // 使用 useRef 来存储 URL 更新的定时器，避免频繁的同步操作
  const urlUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 使用 useMemo 缓存映射对象，避免重新创建导致无限循环
  const hashToKeyMap = useMemo<Record<string, string>>(() => ({
    // 主菜单简化映射
    '/': 'home',
    '/home': 'home',
    '/user': 'user', 
    '/rules': 'forward_rules',
    '/forward': 'forward_rules',
    '/forward_rules': 'forward_rules',
    '/egress': 'egress',
    '/iptables': 'iptables',
    '/routes': 'routes',
    '/subscription': 'subscription',
    '/subscriptions': 'subscription',
    // 系统配置简化映射
    '/config': 'dashboard',
    '/dashboard': 'dashboard',
    '/website': 'website',
    '/users': 'users',
    '/groups': 'user_groups',
    '/user_groups': 'user_groups',
    '/servers': 'servers',
    '/dns': 'dns_config',
    '/dns_config': 'dns_config',
  }), []);

  const keyToHashMap = useMemo<Record<string, string>>(() => ({
    'home': '/',
    'user': '/user',
    'forward_rules': '/rules',
    'egress': '/egress',
    'iptables': '/iptables',
    'routes': '/routes',
    'subscription': '/subscription',
    'dashboard': '/config',
    'website': '/website',
    'users': '/users',
    'user_groups': '/groups',
    'servers': '/servers',
    'dns_config': '/dns',
  }), []);

  const keyToDisplayNameMap = useMemo<Record<string, string>>(() => ({
    'home': '首页',
    'user': '用户信息',
    'forward_rules': '转发规则',
    'egress': '出口配置',
    'iptables': 'iptables 管理',
    'routes': '查看线路',
    'subscription': '订阅管理',
    'dashboard': '仪表盘',
    'website': '网站配置',
    'users': '用户管理',
    'user_groups': '用户组管理',
    'servers': '服务器管理',
    'dns_config': 'DNS配置',
  }), []);

  // 从URL路径获取初始tab
  const getInitialTabFromPath = useCallback(() => {
    const pathname = location.pathname;
    if (pathname && hashToKeyMap[pathname]) {
      return hashToKeyMap[pathname];
    }
    return 'home';
  }, [hashToKeyMap, location.pathname]);

  // 异步更新URL，避免阻塞UI
  const updateUrlAsync = useCallback((key: string) => {
    // 清除之前的定时器
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }
    
    // 设置新的定时器，延迟执行URL更新
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const newPath = keyToHashMap[key] || '/';
      if (location.pathname !== newPath) {
        navigate(newPath, { replace: true });
      }
    }, 100); // 100ms延迟，避免频繁更新
  }, [keyToHashMap, location.pathname, navigate]);

  // 菜单折叠状态 - 从localStorage读取初始状态
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nspass-sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // 从路径初始化selectedKey
  useEffect(() => {
    const initialKey = getInitialTabFromPath();
    setSelectedKey(initialKey);
    // 确保初始组件也被添加到渲染缓存中
    setRenderedTabs(prev => new Set([...prev, initialKey]));
  }, [getInitialTabFromPath]);

  // 监听路径变化，更新选中的菜单项
  useEffect(() => {
    const newKey = getInitialTabFromPath();
    if (newKey !== selectedKey) {
      setSelectedKey(newKey);
      setRenderedTabs(prev => new Set([...prev, newKey]));
    }
  }, [location.pathname, getInitialTabFromPath, selectedKey]);

  // 检查登录状态
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // 持久化折叠状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nspass-sidebar-collapsed', JSON.stringify(collapsed));
    }
  }, [collapsed]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+\ 或 Cmd+\ 切换侧边栏
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setCollapsed(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 响应式设计 - 检测屏幕尺寸
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        // 在小屏幕设备上自动折叠
        if (width < 768 && !collapsed) {
          setCollapsed(true);
        }
      }
    };

    handleResize(); // 初始检查
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // 优化：延迟URL更新的菜单选择处理
  const handleMenuSelect = useCallback(({ key }: { key: string }) => {
    // 批量更新状态，减少重渲染次数
    React.startTransition(() => {
      setSelectedKey(key);
      setRenderedTabs(prev => {
        if (prev.has(key)) {
          return prev; // 如果已存在，直接返回原对象避免重新创建
        }
        return new Set([...prev, key]);
      });
    });
    
    // 异步更新URL，避免阻塞
    updateUrlAsync(key);
  }, [updateUrlAsync]);

  const handleLogout = async () => {
    try {
      await logout();
      message.success('注销成功');
      
      // 确保跳转到登录页面，使用多种方式确保成功
      setTimeout(() => {
        navigate('/login');
        // 备用跳转方式，确保在各种情况下都能跳转
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 500);
    } catch (error) {
      message.error('注销失败');
      logger.error('注销错误:', error);
    }
  };

  // 用户下拉菜单处理
  const handleUserMenuAction = (action: string) => {
    if (action === 'logout') {
      handleLogout();
    }
  };

  // 组件映射 - 使用useMemo缓存组件映射关系
  const componentMap = useMemo(() => ({
    'home': HomeContent,
    'user': UserInfo,
    'forward_rules': ForwardRules,
    'egress': Egress,
    'iptables': Iptables,
    'routes': Routes,
    'subscription': Subscription,
    'dashboard': Dashboard,
    'website': Website,
    'users': Users,
    'user_groups': UserGroups,
    'servers': Servers,
    'dns_config': DnsConfig,
  }), []);

  // 使用 useRef 来持久化组件实例，避免重新创建
  const componentCacheRef = useRef<Record<string, React.ReactNode>>({});

  // 获取组件的函数 - 使用 useCallback 缓存
  const getComponent = useCallback((key: string) => {
    // 如果组件已经缓存，直接返回
    if (componentCacheRef.current[key]) {
      return componentCacheRef.current[key];
    }

    // 从映射中获取组件类型
    const ComponentType = componentMap[key as keyof typeof componentMap] || HomeContent;

    // 创建带有Suspense包装的组件并缓存
    const component = <ComponentType key={`${key}-cached`} />;

    componentCacheRef.current[key] = component;
    return component;
  }, [componentMap]);

  // Loading状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!isAuthenticated) {
    return null; // useEffect 会处理跳转
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 侧边栏 */}
      <aside 
        className={`fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo区域 */}
        <div className="h-16 flex items-center justify-center border-b px-4">
          <div className="font-bold text-lg text-foreground">
            {collapsed ? 'N' : 'NSPass'}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="p-2 space-y-1">
          {/* 基础功能组 */}
          {navigationItems.filter(item => item.group === 'basic').map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuSelect({ key: item.key })}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedKey === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}

          {/* 分隔线 */}
          <div className="my-4 border-t" />

          {/* 高级功能组 */}
          {navigationItems.filter(item => item.group === 'admin').map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuSelect({ key: item.key })}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedKey === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* 主内容区域 */}
      <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {/* 顶部导航栏 */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {/* 折叠按钮 - 固定在左侧 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-10 w-10 hover:bg-accent"
              title={`${collapsed ? '展开' : '收起'}侧边栏 (Ctrl+\\)`}
            >
              {collapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>

            {/* 当前页面标题 */}
            <h1 className="text-xl font-semibold text-foreground">
              {keyToDisplayNameMap[selectedKey] || '首页'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* 主题切换按钮 */}
            <ThemeToggle size="middle" placement="bottomLeft" />

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-10">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name || '用户'} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">{user?.name ?? '用户'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleUserMenuAction('logout')}>
                  <LogOut className="mr-2 h-4 w-4" />
                  注销
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          <div className="bg-card rounded-lg border min-h-[calc(100vh-8rem)]">
            <div className="p-6">
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">正在加载组件...</p>
                  </div>
                </div>
              }>
                {/* 只渲染已经访问过的组件，使用缓存 */}
                <div>
                  {Array.from(renderedTabs).map(key => (
                    <div 
                      key={key} 
                      className={key === selectedKey ? 'block' : 'hidden'}
                      style={{ minHeight: '500px' }}
                    >
                      {getComponent(key)}
                    </div>
                  ))}
                </div>
              </Suspense>
            </div>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="border-t bg-background py-4">
          <div className="text-center text-sm text-muted-foreground">
            NSPass Web ©2024 Created with React + Vite + shadcn/ui
          </div>
        </footer>
      </div>
    </div>
  );
}
