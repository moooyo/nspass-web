import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined, UserOutlined, ApiOutlined, LogoutOutlined, DownOutlined, DashboardOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined, CloudServerOutlined, CloudOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme, Dropdown, Avatar, Space, Typography, Spin } from 'antd';
import { message } from '@/utils/message';
import { useAuth } from '@/components/hooks/useAuth';
import { useTheme } from '@/components/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';
import { MSWToggle } from '@/components/MSWProvider';

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

const { Header, Sider, Footer } = Layout;
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
  getItem('iptables 管理', 'iptables', <SafetyCertificateOutlined />),
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

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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
    '/': 'home',
    '/home': 'home',
    '/user': 'user', 
    '/rules': 'forward_rules',
    '/forward': 'forward_rules',
    '/forward_rules': 'forward_rules',
    '/egress': 'egress',
    '/iptables': 'iptables',
    '/routes': 'routes',
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

  // 菜单折叠状态
  const [collapsed, setCollapsed] = useState(false);

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
      case 'iptables':
        component = <Iptables key={`${key}-cached`} />;
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
    
    componentCacheRef.current[key] = component;
    return component;
  }, []);

  // Loading状态
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 未登录状态
  if (!isAuthenticated) {
    return null; // useEffect 会处理跳转
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
        }}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'N' : 'NSPass'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onSelect={handleMenuSelect}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                marginRight: 16,
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
            {import.meta.env.DEV && <MSWToggle />}
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}>
                <Avatar 
                  src={user?.avatar || undefined}
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
        
        <Layout.Content
          style={{
            margin: '24px',
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto'
          }}
        >
          <div style={{ padding: '24px' }}>
            <Suspense fallback={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
              }}>
                <Spin size="large" />
              </div>
            }>
              {/* 只渲染已经访问过的组件，使用缓存 */}
              <div>
                {Array.from(renderedTabs).map(key => (
                  <div 
                    key={key} 
                    style={{ 
                      display: key === selectedKey ? 'block' : 'none',
                      minHeight: '500px'
                    }}
                  >
                    {getComponent(key)}
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
        </Layout.Content>
        
        <Footer style={{ textAlign: 'center', padding: '12px 50px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            NSPass Web ©2024 Created with Vite + Antd
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
