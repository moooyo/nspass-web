import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
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
  CloudServerOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme, Dropdown, Avatar, Space, Typography, Spin } from 'antd';
import { message } from '@/utils/message';
import { useAuth } from '@/components/hooks/useAuth';
import { useTheme } from '@/components/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';
import { MSWToggle } from '@/components/MSWProvider';

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
  getItem('仪表盘', 'dashboard', <DashboardOutlined />),
  getItem('用户信息', 'user', <UserOutlined />),
  getItem('转发规则', 'forward_rules', <UnorderedListOutlined />),
  getItem('系统设置', 'settings', <SettingOutlined />),
  getItem('用户管理', 'user_management', <TeamOutlined />),
  getItem('服务器管理', 'servers', <CloudServerOutlined />),
];

// 简单的内容组件
const DashboardContent = () => (
  <div style={{ padding: '24px' }}>
    <h2>仪表盘</h2>
    <p>欢迎使用 NSPass 密码管理平台!</p>
    <p>这是从 Next.js 迁移到 Vite 后的仪表盘页面。</p>
  </div>
);

const UserInfoContent = () => (
  <div style={{ padding: '24px' }}>
    <h2>用户信息</h2>
    <p>用户配置文件和设置页面</p>
  </div>
);

const ForwardRulesContent = () => (
  <div style={{ padding: '24px' }}>
    <h2>转发规则</h2>
    <p>网络转发规则管理</p>
  </div>
);

const SettingsContent = () => (
  <div style={{ padding: '24px' }}>
    <h2>系统设置</h2>
    <p>系统配置和设置</p>
  </div>
);

const UserManagementContent = () => (
  <div style={{ padding: '24px' }}>
    <h2>用户管理</h2>
    <p>管理系统用户</p>
  </div>
);

const ServersContent = () => (
  <div style={{ padding: '24px' }}>
    <h2>服务器管理</h2>
    <p>服务器配置和管理</p>
  </div>
);

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
    
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/user')) return 'user';
    if (path.startsWith('/forward_rules')) return 'forward_rules';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/user_management')) return 'user_management';
    if (path.startsWith('/servers')) return 'servers';
    return 'dashboard';
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
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'user':
        navigate('/user');
        break;
      case 'forward_rules':
        navigate('/forward_rules');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'user_management':
        navigate('/user_management');
        break;
      case 'servers':
        navigate('/servers');
        break;
      default:
        navigate('/dashboard');
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
    
    if (path === '/' || path === '/dashboard') return <DashboardContent />;
    if (path.startsWith('/user')) return <UserInfoContent />;
    if (path.startsWith('/forward_rules')) return <ForwardRulesContent />;
    if (path.startsWith('/settings')) return <SettingsContent />;
    if (path.startsWith('/user_management')) return <UserManagementContent />;
    if (path.startsWith('/servers')) return <ServersContent />;
    
    // 默认显示仪表盘
    return <DashboardContent />;
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
      
      {/* 为了React Router兼容性，保留Routes组件但不实际使用 */}
      <div style={{ display: 'none' }}>
        <Routes>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/user" element={<UserInfoContent />} />
          <Route path="/forward_rules" element={<ForwardRulesContent />} />
          <Route path="/settings" element={<SettingsContent />} />
          <Route path="/user_management" element={<UserManagementContent />} />
          <Route path="/servers" element={<ServersContent />} />
        </Routes>
      </div>
    </Layout>
  );
};

MainLayoutFixed.displayName = 'MainLayoutFixed';

export default MainLayoutFixed;
