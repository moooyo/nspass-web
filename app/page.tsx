'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EditOutlined, HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined, UserOutlined, ApiOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme, Dropdown, Avatar, Space, Typography, Spin } from 'antd';
import { message } from '@/utils/message';
import { useAuth } from '@/components/hooks/useAuth';

// 导入内容组件
import HomeContent from './components/content/Home';
import UserInfo from './components/content/UserInfo';
import ForwardRules from './components/content/ForwardRules';
import Egress from './components/content/Egress';
import Routes from './components/content/Routes';
import Dashboard from './components/content/config/Dashboard';
import Website from './components/content/config/Website';
import Users from './components/content/config/Users';
import UserGroups from './components/content/config/UserGroups';
import Servers from './components/content/config/Servers';
import DnsConfig from './components/content/config/DnsConfig';

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
  
  getItem('系统配置', 'config', <EditOutlined />, [
    getItem('仪表盘', 'dashboard'),
    getItem('网站配置', 'website'),
    getItem('用户管理', 'users'),
    getItem('用户组管理', 'user_groups'),
    getItem('服务器管理', 'servers'),
    getItem('DNS配置', 'dns_config'),
  ]),
];

// rootSubmenuKeys of first level
const rootSubmenuKeys = ['config'];

// 根据菜单项生成层级键映射
type LevelKeysProps = {
  key?: string;
  children?: LevelKeysProps[];
};

const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const levelKeys = getLevelKeys(items as LevelKeysProps[]);

// Logo组件
const Logo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  return (
    <div 
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '0' : '0 16px',
        background: 'rgba(255, 255, 255, 0.3)',
        margin: '16px',
        borderRadius: '8px',
      }}
    >
      <div 
        style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
        }}
      >
        N
      </div>
      {!collapsed && (
        <Text 
          style={{ 
            color: 'white', 
            marginLeft: '12px', 
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          NSPass
        </Text>
      )}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  // 修改初始状态，不默认展开任何菜单
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('home');

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
    
    // 如果URL中没有hash，设置默认hash
    if (typeof window !== 'undefined' && !window.location.hash) {
      const hash = keyToHashMap[initialTab] || initialTab;
      const newUrl = `${window.location.pathname}${window.location.search}#${hash}`;
      window.history.replaceState(null, '', newUrl);
    }
    
    // 如果是子菜单项，自动展开父菜单
    if (['dashboard', 'website', 'users', 'user_groups', 'servers', 'dns_config'].includes(initialTab)) {
      setStateOpenKeys(['config']);
    }
  }, []);

  // 监听hash变化（浏览器前进后退）
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getInitialTabFromHash();
      setSelectedKey(newTab);
      
      // 如果是子菜单项，自动展开父菜单
      if (['dashboard', 'website', 'users', 'user_groups', 'servers', 'dns_config'].includes(newTab)) {
        setStateOpenKeys(['config']);
      }
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

  const onOpenChange: MenuProps['onOpenChange'] = (openKeys) => {
    const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };

  const handleMenuSelect = ({ key }: { key: string }) => {
    setSelectedKey(key);
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

  const renderContent = () => {
    switch (selectedKey) {
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
        <Logo collapsed={collapsed} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
          onSelect={handleMenuSelect}
          items={items}
        />
      </Sider>
      <Layout style={{ width: '100%', overflow: 'hidden' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['dashboard', 'website', 'users', 'user_groups', 'servers', 'dns_config'].includes(selectedKey) && (
                <>
                  <Text type="secondary">系统配置</Text>
                  <Text type="secondary">/</Text>
                </>
              )}
              <Text strong style={{ fontSize: '16px' }}>
                {keyToDisplayNameMap[selectedKey] || '首页'}
              </Text>
            </div>
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
