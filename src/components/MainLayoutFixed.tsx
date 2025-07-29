import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  LogoutOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme, Dropdown, Avatar, Space, Typography, Spin } from 'antd';
import { message } from '@/utils/message';
import { useAuth } from '@/components/hooks/useAuth';
import { logger } from '@/utils/logger';
import { useTheme } from '@/components/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';

import { getMenuItems, findRouteByPath, findRouteByKey } from '@/config/routes';
import { AppRoutes } from '@/components/AppRoutes';

const { Header, Sider, Footer } = Layout;
const { Text } = Typography;

// type MenuItem = Required<MenuProps>['items'][number]; // 暂时未使用

// 从配置生成菜单项
const menuItems = getMenuItems();

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

  // 检查登录状态 - 优化日志输出
  useEffect(() => {
    logger.info('MainLayoutFixed - Auth状态检查:', { isLoading, isAuthenticated, user: user?.name, pathname: location.pathname });
    if (!isLoading && !isAuthenticated) {
      logger.info('用户未登录，重定向到登录页');
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate, user, location.pathname]);

  // 处理根路径重定向
  useEffect(() => {
    if (location.pathname === '/' && isAuthenticated && !isLoading) {
      logger.info('根路径重定向到首页');
      navigate('/home', { replace: true });
    }
  }, [location.pathname, isAuthenticated, isLoading, navigate]);

  // 从路径获取当前选中的菜单项
  const getCurrentMenuKey = useCallback(() => {
    const path = location.pathname;
    logger.debug('Current path:', path);

    const route = findRouteByPath(path);
    return route?.key ?? 'home';
  }, [location.pathname]);

  const [selectedKeys, setSelectedKeys] = useState([getCurrentMenuKey()]);

  // 更新选中的菜单项当路由变化时
  useEffect(() => {
    setSelectedKeys([getCurrentMenuKey()]);
  }, [location.pathname, getCurrentMenuKey]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const key = e.key;
    logger.debug('Menu clicked:', key);
    setSelectedKeys([key]);
    
    const route = findRouteByKey(key);
    if (route) {
      navigate(route.path);
    } else {
      navigate('/home');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success('已退出登录');
      navigate('/login');
    } catch (error) {
      logger.error('登出错误:', error);
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

  // 如果正在加载，显示加载状态
  if (isLoading) {
    logger.debug('MainLayoutFixed - 显示加载状态');
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
    logger.debug('MainLayoutFixed - 用户未认证，不渲染内容');
    return null;
  }

  logger.debug('MainLayoutFixed - 渲染主布局，用户:', user?.name);

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
          items={menuItems}
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
            <ThemeToggle />
            <Dropdown 
              menu={{ 
                items: userMenuItems,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text>{user?.name ?? 'Unknown User'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Layout.Content
          style={{
            margin: '24px',
            padding: '24px',
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto'
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
            <AppRoutes />
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
