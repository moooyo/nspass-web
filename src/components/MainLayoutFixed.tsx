import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useNavigate, useLocation, Routes as RouterRoutes, Route } from 'react-router-dom';
import { 
  HomeOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UnorderedListOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  SettingOutlined, 
  TeamOutlined,
  CloudServerOutlined,
  ApiOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
  CloudOutlined
} from '@ant-design/icons';
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

const MainLayoutFixed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 检查登录状态
  useEffect(() => {
    console.log('MainLayoutFixed - Auth状态检查:', { isLoading, isAuthenticated, user: user?.name });
    if (!isLoading && !isAuthenticated) {
      console.log('用户未登录，重定向到登录页');
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate, user]);

  // 从路径获取当前选中的菜单项
  const getCurrentMenuKey = () => {
    const path = location.pathname;
    console.log('Current path:', path);
    
    if (path === '/' || path === '/home') return 'home';
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/user') && !path.startsWith('/user_')) return 'user';
    if (path.startsWith('/forward_rules') || path.startsWith('/rules')) return 'forward_rules';
    if (path.startsWith('/egress')) return 'egress';
    if (path.startsWith('/iptables')) return 'iptables';
    if (path.startsWith('/routes')) return 'routes';
    if (path.startsWith('/website')) return 'website';
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/user_groups') || path.startsWith('/groups')) return 'user_groups';
    if (path.startsWith('/servers')) return 'servers';
    if (path.startsWith('/dns') || path.startsWith('/dns_config')) return 'dns_config';
    return 'home';
  };

  const [selectedKeys, setSelectedKeys] = useState([getCurrentMenuKey()]);

  // 更新选中的菜单项当路由变化时
  useEffect(() => {
    setSelectedKeys([getCurrentMenuKey()]);
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const key = e.key;
    console.log('Menu clicked:', key);
    setSelectedKeys([key]);
    
    // 根据菜单项导航到相应路由
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'user':
        navigate('/user');
        break;
      case 'forward_rules':
        navigate('/forward_rules');
        break;
      case 'egress':
        navigate('/egress');
        break;
      case 'iptables':
        navigate('/iptables');
        break;
      case 'routes':
        navigate('/routes');
        break;
      case 'website':
        navigate('/website');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'user_groups':
        navigate('/user_groups');
        break;
      case 'servers':
        navigate('/servers');
        break;
      case 'dns_config':
        navigate('/dns_config');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success('已退出登录');
      navigate('/login');
    } catch (error) {
      console.error('登出错误:', error);
      message.error('登出失败');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const renderContent = () => {
    const path = location.pathname;
    console.log('Rendering content for path:', path);
    
    if (path === '/' || path === '/home') return <HomeContent />;
    if (path === '/dashboard') return <Dashboard />;
    if (path.startsWith('/user') && !path.startsWith('/user_')) return <UserInfo />;
    if (path.startsWith('/forward_rules') || path.startsWith('/rules')) return <ForwardRules />;
    if (path.startsWith('/egress')) return <Egress />;
    if (path.startsWith('/iptables')) return <Iptables />;
    if (path.startsWith('/routes')) return <Routes />;
    if (path.startsWith('/website')) return <Website />;
    if (path.startsWith('/users')) return <Users />;
    if (path.startsWith('/user_groups') || path.startsWith('/groups')) return <UserGroups />;
    if (path.startsWith('/servers')) return <Servers />;
    if (path.startsWith('/dns') || path.startsWith('/dns_config')) return <DnsConfig />;
    
    // 默认显示首页
    return <HomeContent />;
  };

  // 如果正在加载，显示加载状态
  if (isLoading) {
    console.log('MainLayoutFixed - 显示加载状态');
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

  // 如果未登录，不渲染内容（useEffect会处理跳转）
  if (!isAuthenticated) {
    console.log('MainLayoutFixed - 用户未认证，不渲染内容');
    return null;
  }

  console.log('MainLayoutFixed - 渲染主布局，用户:', user?.name);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme={isDark ? 'dark' : 'light'}
        style={{
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div 
          style={{
            height: 32,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontSize: '18px',
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#1890ff',
          }}
        >
          {collapsed ? 'NS' : 'NSPass'}
        </div>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={selectedKeys}
          items={items}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
          }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Space size="middle" style={{ marginRight: 24 }}>
            {import.meta.env.DEV && <MSWToggle />}
            <ThemeToggle />
            <Dropdown 
              menu={{ 
                items: userMenuItems,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text>{user?.name || 'Unknown User'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Layout.Content
          style={{
            margin: 0,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Suspense fallback={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              minHeight: '200px'
            }}>
              <Spin size="large" />
            </div>
          }>
            {renderContent()}
          </Suspense>
        </Layout.Content>
        
        <Footer style={{ textAlign: 'center' }}>
          NSPass ©{new Date().getFullYear()} Created by NSPass Team
        </Footer>
      </Layout>
    </Layout>
  );
};

MainLayoutFixed.displayName = 'MainLayoutFixed';

export default MainLayoutFixed;
