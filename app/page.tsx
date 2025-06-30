'use client'
import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined, UserOutlined, ApiOutlined, LogoutOutlined, DownOutlined, DashboardOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined, CloudServerOutlined, CloudOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme, Dropdown, Avatar, Space, Typography, Spin } from 'antd';
import { message } from '@/utils/message';
import { useAuth } from '@/components/hooks/useAuth';
import { useTheme } from '@/components/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';

// 使用 React.lazy 懒加载组件
const HomeContent = React.lazy(() => import('./components/content/Home'));
const UserInfo = React.lazy(() => import('./components/content/UserInfo'));
const ForwardRules = React.lazy(() => import('./components/content/ForwardRules'));
const Egress = React.lazy(() => import('./components/content/Egress'));
const Routes = React.lazy(() => import('./components/content/Routes'));
const Dashboard = React.lazy(() => import('./components/content/config/Dashboard'));
const Website = React.lazy(() => import('./components/content/config/Website'));
const Users = React.lazy(() => import('./components/content/config/Users'));
const UserGroups = React.lazy(() => import('./components/content/config/UserGroups'));
const Servers = React.lazy(() => import('./components/content/config/Servers'));
const DnsConfig = React.lazy(() => import('./components/content/config/DnsConfig'));

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('首页', 'home', <HomeOutlined />),
  getItem('用户信息', 'user', <UserOutlined />),
  getItem('转发规则', 'forward_rules', <UnorderedListOutlined />),
  getItem('出口配置', 'egress', <ApiOutlined />),
  getItem('查看线路', 'routes', <UnorderedListOutlined />),
  
  // 分隔线，分隔基础功能和系统管理功能
  { type: 'divider' },
  
  getItem('仪表盘', 'dashboard', <DashboardOutlined />),
  getItem('网站配置', 'website', <SettingOutlined />),
  getItem('用户管理', 'users', <TeamOutlined />),
  getItem('用户组管理', 'user_groups', <UsergroupAddOutlined />),
  getItem('服务器管理', 'servers', <CloudServerOutlined />),
  getItem('DNS配置', 'dns_config', <CloudOutlined />),
];

// 由于现在都是一级菜单，不再需要复杂的层级逻辑

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  
  const [selectedKey, setSelectedKey] = useState<string>('home');
  
  // 缓存已渲染的组件
  const [renderedTabs, setRenderedTabs] = useState<Set<string>>(new Set(['home']));
  
  // 使用 useRef 来存储 URL 更新的定时器，避免频繁的同步操作
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 使用 useMemo 缓存映射对象，避免重新创建导致无限循环
  const hashToKeyMap = useMemo<Record<string, string>>(() => ({
    // 主菜单简化映射
    'home': 'home',
    'user': 'user', 
    'rules': 'forward_rules',
    'forward': 'forward_rules',
    'forward_rules': 'forward_rules',
    'egress': 'egress',
    'routes': 'routes',
    // 系统配置简化映射
    'config': 'dashboard',
    'dashboard': 'dashboard',
    'website': 'website',
    'users': 'users',
    'groups': 'user_groups',
    'user_groups': 'user_groups',
    'servers': 'servers',
    'dns': 'dns_config',
    'dns_config': 'dns_config',
  }), []);

  const keyToHashMap = useMemo<Record<string, string>>(() => ({
    'home': 'home',
    'user': 'user',
    'forward_rules': 'rules',
    'egress': 'egress', 
    'routes': 'routes',
    'dashboard': 'config',
    'website': 'website',
    'users': 'users',
    'user_groups': 'groups',
    'servers': 'servers',
    'dns_config': 'dns',
  }), []);

  // 页面标题映射
  const keyToTitleMap = useMemo<Record<string, string>>(() => ({
    'home': 'NSPass - 首页',
    'user': 'NSPass - 用户信息',
    'forward_rules': 'NSPass - 转发规则',
    'egress': 'NSPass - 出口配置',
    'routes': 'NSPass - 查看线路',
    'dashboard': 'NSPass - 仪表盘',
    'website': 'NSPass - 网站配置',
    'users': 'NSPass - 用户管理',
    'user_groups': 'NSPass - 用户组管理',
    'servers': 'NSPass - 服务器管理',
    'dns_config': 'NSPass - DNS配置',
  }), []);

  // 页面显示名称映射
  const keyToDisplayNameMap = useMemo<Record<string, string>>(() => ({
    'home': '首页',
    'user': '用户信息',
    'forward_rules': '转发规则',
    'egress': '出口配置',
    'routes': '查看线路',
    'dashboard': '仪表盘',
    'website': '网站配置',
    'users': '用户管理',
    'user_groups': '用户组管理',
    'servers': '服务器管理',
    'dns_config': 'DNS配置',
  }), []);

  // 从URL hash获取初始tab
  const getInitialTabFromHash = useCallback(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1); // 移除 # 号
      if (hash && hashToKeyMap[hash]) {
        return hashToKeyMap[hash];
      }
    }
    return 'home';
  }, [hashToKeyMap]);

  // 异步更新URL，避免阻塞UI
  const updateUrlAsync = useCallback((key: string) => {
    // 清除之前的定时器或idle回调
    if (urlUpdateTimeoutRef.current) {
      if (typeof window !== 'undefined' && window.cancelIdleCallback) {
        window.cancelIdleCallback(urlUpdateTimeoutRef.current as any);
      } else {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    }
    
    // 使用 requestIdleCallback 优先，降级到 setTimeout
    const updateFn = () => {
      if (typeof window !== 'undefined') {
        const hash = keyToHashMap[key] || key;
        const newUrl = `${window.location.pathname}${window.location.search}#${hash}`;
        window.history.replaceState(null, '', newUrl);
      }
    };

    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      urlUpdateTimeoutRef.current = window.requestIdleCallback(updateFn, { timeout: 100 }) as any;
    } else {
      urlUpdateTimeoutRef.current = setTimeout(updateFn, 16); // 约1帧的时间
    }
  }, [keyToHashMap]);

  // 优化：减少初始化时的 useEffect
  useEffect(() => {
    const initialTab = getInitialTabFromHash();
    setSelectedKey(initialTab);
    setRenderedTabs(prev => new Set([...prev, initialTab]));
    
    // 异步更新URL
    if (typeof window !== 'undefined' && !window.location.hash) {
      updateUrlAsync(initialTab);
    }
  }, [getInitialTabFromHash, updateUrlAsync]);

  // 监听hash变化（浏览器前进后退） - 优化为单一useEffect
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getInitialTabFromHash();
      setSelectedKey(newTab);
      setRenderedTabs(prev => new Set([...prev, newTab]));
    };

    // 使用 passive 监听器提高性能
    const options = { passive: true };
    window.addEventListener('hashchange', handleHashChange, options);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [getInitialTabFromHash]);

  // 合并页面标题和开发提示到单一useEffect
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = keyToTitleMap[selectedKey] || 'NSPass';
    }

    // 只在开发环境且首次加载时显示导航提示
    if (typeof window !== 'undefined' && 
        process.env.NODE_ENV === 'development' && 
        selectedKey === 'home') {
      console.log('🔗 NSPass URL导航提示:');
      Object.entries(keyToHashMap).forEach(([key, hash]) => {
        console.log(`• ${keyToDisplayNameMap[key]}: #${hash}`);
      });
    }
  }, [selectedKey]);

  // 检查登录状态
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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
      router.push('/login');
    } catch (error) {
      message.error('注销失败');
      console.error('注销错误:', error);
    }
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '注销',
      onClick: handleLogout,
    },
  ];

  // 使用 useRef 来持久化组件实例，避免重新创建
  const componentCacheRef = useRef<Record<string, React.ReactNode>>({});
  
  // 获取组件的函数 - 使用 useCallback 缓存
  const getComponent = useCallback((key: string) => {
    // 如果组件已经缓存，直接返回
    if (componentCacheRef.current[key]) {
      return componentCacheRef.current[key];
    }
    
    // 创建带有Suspense包装的组件并缓存
    let component: React.ReactNode;
    switch (key) {
      case 'home':
        component = <HomeContent key={`${key}-cached`} />;
        break;
      case 'user':
        component = <UserInfo key={`${key}-cached`} />;
        break;
      case 'forward_rules':
        component = <ForwardRules key={`${key}-cached`} />;
        break;
      case 'egress':
        component = <Egress key={`${key}-cached`} />;
        break;
      case 'routes':
        component = <Routes key={`${key}-cached`} />;
        break;
      case 'dashboard':
        component = <Dashboard key={`${key}-cached`} />;
        break;
      case 'website':
        component = <Website key={`${key}-cached`} />;
        break;
      case 'users':
        component = <Users key={`${key}-cached`} />;
        break;
      case 'user_groups':
        component = <UserGroups key={`${key}-cached`} />;
        break;
      case 'servers':
        component = <Servers key={`${key}-cached`} />;
        break;
      case 'dns_config':
        component = <DnsConfig key={`${key}-cached`} />;
        break;
      default:
        component = <HomeContent key={`${key}-cached`} />;
    }
    
    // 包装在Suspense中并缓存
    const wrappedComponent = (
      <Suspense 
        key={`suspense-${key}`}
        fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Spin size="large" />
            <Text type="secondary">正在加载组件...</Text>
          </div>
        }
      >
        {component}
      </Suspense>
    );
    
    componentCacheRef.current[key] = wrappedComponent;
    return wrappedComponent;
  }, []);

  // 优化：使用简单的渲染逻辑，减少复杂计算
  const renderContent = useCallback(() => {
    // 预加载已渲染的标签页组件
    Array.from(renderedTabs).forEach(tabKey => {
      if (!componentCacheRef.current[tabKey]) {
        getComponent(tabKey);
      }
    });

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {Array.from(renderedTabs).map(tabKey => (
          <div
            key={`tab-content-${tabKey}`}
            style={{
              display: selectedKey === tabKey ? 'block' : 'none',
              width: '100%',
              height: '100%'
            }}
          >
            {componentCacheRef.current[tabKey] || getComponent(tabKey)}
          </div>
        ))}
      </div>
    );
  }, [selectedKey, renderedTabs, getComponent]);

  // 清理定时器和idle回调
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        if (typeof window !== 'undefined' && window.cancelIdleCallback) {
          window.cancelIdleCallback(urlUpdateTimeoutRef.current as any);
        } else {
          clearTimeout(urlUpdateTimeoutRef.current);
        }
      }
    };
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 如果正在加载或未登录，显示加载状态
  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text type="secondary">正在加载...</Text>
      </div>
    );
  }

  // 如果未登录，不渲染任何内容（将被重定向到登录页）
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        {/* LOGO放在侧边栏顶部 */}
        <div style={{ 
          padding: collapsed ? '16px 8px' : '20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '8px'
        }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? '0' : '12px',
              justifyContent: collapsed ? 'center' : 'flex-start'
            }}
          >
            <div 
              style={{
                width: '36px',
                height: '36px',
                background: resolvedTheme === 'light'
                  ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                  : 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: resolvedTheme === 'light'
                  ? '0 4px 20px rgba(24, 144, 255, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.2)'
                  : '0 4px 20px rgba(19, 194, 194, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                border: resolvedTheme === 'light'
                  ? '2px solid rgba(255, 255, 255, 0.3)'
                  : '2px solid rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite'
              }} />
              N
            </div>
                         {!collapsed && (
               <div>
                 <div 
                   style={{ 
                     color: '#ffffff !important',
                     fontWeight: '700',
                     fontSize: '20px',
                     letterSpacing: '0.5px',
                     lineHeight: 1.2,
                     textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                   }}
                 >
                   NSPass
                 </div>
                 <div 
                   style={{ 
                     color: 'rgba(255, 255, 255, 0.9) !important',
                     fontSize: '12px',
                     fontWeight: '600',
                     letterSpacing: '1px',
                     textTransform: 'uppercase',
                     marginTop: '2px',
                     textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                   }}
                 >
                   管理中心
                 </div>
               </div>
             )}
          </div>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={handleMenuSelect}
          items={items}
        />
      </Sider>
      <Layout style={{ width: '100%', overflow: 'hidden' }}>
        <Header style={{ 
          padding: '0', 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%', padding: '0 16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 48,
                height: 48,
                borderRadius: '12px'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                {keyToDisplayNameMap[selectedKey] || '首页'}
              </Text>
            </div>
          </div>
          
          <Space size="middle">
            <ThemeToggle size="middle" placement="bottomLeft" />
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}>
                <Avatar 
                  src={user?.avatar}
                  style={{ 
                    backgroundColor: '#1890ff' 
                  }} 
                  icon={<UserOutlined />} 
                />
                <Text>{user?.name || '用户'}</Text>
                <DownOutlined style={{ fontSize: '12px' }} />
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowX: 'hidden'
          }}
        >
          {renderContent()}
        </Content>
        <Footer style={{ textAlign: 'center', color: '#999', padding: '12px 0' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '6px',
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            <img 
              src="https://www.cursor.com/assets/images/logo.svg" 
              alt="Cursor Logo" 
              width="16" 
              height="16" 
              style={{ 
                opacity: 0.6,
                filter: 'grayscale(1)'
              }}
              onError={(e) => {
                // 如果官方logo加载失败，使用备用的SVG
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'block';
                }
              }}
            />
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ 
                opacity: 0.6,
                display: 'none'
              }}
            >
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.09L19.18 8L12 11.91L4.82 8L12 4.09ZM4 9.5L11 13.41V20L4 16.5V9.5ZM13 20V13.41L20 9.5V16.5L13 20Z"/>
            </svg>
            <Text type="secondary" style={{ 
              fontSize: '12px',
              userSelect: 'none',
              pointerEvents: 'none'
            }}>
              Powered by Cursor
            </Text>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
}
