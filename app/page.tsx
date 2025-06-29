'use client'
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EditOutlined, HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined, UserOutlined, ApiOutlined, LogoutOutlined, DownOutlined, SunOutlined, MoonOutlined, DashboardOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined, CloudServerOutlined, CloudOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme, Dropdown, Avatar, Space, Typography, Spin } from 'antd';
import { message } from '@/utils/message';
import { useAuth } from '@/components/hooks/useAuth';
import { useTheme } from '@/components/hooks/useTheme';

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
  const { theme: currentTheme, toggleTheme } = useTheme();
  
  const [selectedKey, setSelectedKey] = useState<string>('home');
  
  // 缓存已渲染的组件
  const [renderedTabs, setRenderedTabs] = useState<Set<string>>(new Set(['home']));

  // URL hash与菜单key的映射关系
  const hashToKeyMap: Record<string, string> = {
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
  };

  const keyToHashMap: Record<string, string> = {
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
  };

  // 页面标题映射
  const keyToTitleMap: Record<string, string> = {
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
  };

  // 页面显示名称映射
  const keyToDisplayNameMap: Record<string, string> = {
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
  };

  // 从URL hash获取初始tab
  const getInitialTabFromHash = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1); // 移除 # 号
      if (hash && hashToKeyMap[hash]) {
        return hashToKeyMap[hash];
      }
    }
    return 'home';
  };

  // 初始化时根据URL hash设置selectedKey
  useEffect(() => {
    const initialTab = getInitialTabFromHash();
    setSelectedKey(initialTab);
    // 确保初始tab被添加到渲染缓存中
    setRenderedTabs(prev => new Set([...prev, initialTab]));
    
    // 如果URL中没有hash，设置默认hash
    if (typeof window !== 'undefined' && !window.location.hash) {
      const hash = keyToHashMap[initialTab] || initialTab;
      const newUrl = `${window.location.pathname}${window.location.search}#${hash}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  // 监听hash变化（浏览器前进后退）
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getInitialTabFromHash();
      setSelectedKey(newTab);
      // 确保新tab被添加到渲染缓存中
      setRenderedTabs(prev => new Set([...prev, newTab]));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 更新页面标题
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = keyToTitleMap[selectedKey] || 'NSPass';
    }
  }, [selectedKey]);

  // 在开发环境下显示导航提示
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔗 NSPass URL导航提示:');
      console.log('您可以直接通过URL访问以下页面:');
      console.log('• 首页: #home');
      console.log('• 用户信息: #user');
      console.log('• 转发规则: #rules');
      console.log('• 出口配置: #egress');
      console.log('• 查看线路: #routes');
      console.log('• 仪表盘: #config');
      console.log('• 网站配置: #website');
      console.log('• 用户管理: #users');
      console.log('• 用户组管理: #groups');
      console.log('• 服务器管理: #servers');
      console.log('• DNS配置: #dns');
    }
  }, []);

  // 检查登录状态
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // 由于现在都是一级菜单，不再需要复杂的openKeys逻辑

  const handleMenuSelect = ({ key }: { key: string }) => {
    setSelectedKey(key);
    // 将新选中的tab添加到已渲染集合中
    setRenderedTabs(prev => new Set([...prev, key]));
    // 更新URL hash，使用简化的hash名称
    if (typeof window !== 'undefined') {
      const hash = keyToHashMap[key] || key;
      const newUrl = `${window.location.pathname}${window.location.search}#${hash}`;
      window.history.pushState(null, '', newUrl);
    }
  };

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

  // 获取组件的函数
  const getComponent = (key: string) => {
    switch (key) {
      case 'home':
        return <HomeContent />;
      case 'user':
        return <UserInfo />;
      case 'forward_rules':
        return <ForwardRules />;
      case 'egress':
        return <Egress />;
      case 'routes':
        return <Routes />;
      case 'dashboard':
        return <Dashboard />;
      case 'website':
        return <Website />;
      case 'users':
        return <Users />;
      case 'user_groups':
        return <UserGroups />;
      case 'servers':
        return <Servers />;
      case 'dns_config':
        return <DnsConfig />;
      default:
        return <HomeContent />;
    }
  };

  // 使用 useMemo 缓存已渲染的组件
  const cachedComponents = useMemo(() => {
    const components: Record<string, React.ReactNode> = {};
    renderedTabs.forEach(tabKey => {
      components[tabKey] = (
        <div
          key={tabKey}
          style={{
            display: selectedKey === tabKey ? 'block' : 'none',
            width: '100%',
            height: '100%'
          }}
        >
          <Suspense fallback={
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
          }>
            {getComponent(tabKey)}
          </Suspense>
        </div>
      );
    });
    return components;
  }, [renderedTabs, selectedKey]);

  // 渲染内容 - 只显示当前选中的tab，但保持其他已渲染tab的状态
  const renderContent = () => {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {Object.entries(cachedComponents).map(([tabKey, component]) => component)}
      </div>
    );
  };

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
                background: currentTheme === 'light'
                  ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                  : 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: currentTheme === 'light'
                  ? '0 4px 20px rgba(24, 144, 255, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.2)'
                  : '0 4px 20px rgba(19, 194, 194, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                border: currentTheme === 'light'
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
            <div 
              className="theme-toggle"
              onClick={toggleTheme}
              title={currentTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            >
              {currentTheme === 'light' ? <MoonOutlined /> : <SunOutlined />}
            </div>
            
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
