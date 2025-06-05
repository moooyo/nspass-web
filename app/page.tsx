'use client'
import React, { useState } from 'react';
import { EditOutlined, HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined, UserOutlined, ApiOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme, Dropdown, Avatar, Space, Typography } from 'antd';
import { message } from '@/utils/message';

// 导入内容组件
import HomeContent from './components/content/Home';
import UserInfo from './components/content/UserInfo';
import ForwardRules from './components/content/ForwardRules';
import Egress from './components/content/Egress';
import Dashboard from './components/content/config/Dashboard';
import Website from './components/content/config/Website';
import Users from './components/content/config/Users';
import UserGroups from './components/content/config/UserGroups';
import Servers from './components/content/config/Servers';

const { Header, Sider, Content } = Layout;
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
  
  getItem('系统配置', 'config', <EditOutlined />, [
    getItem('仪表盘', 'dashboard'),
    getItem('网站配置', 'website'),
    getItem('用户管理', 'users'),
    getItem('用户组管理', 'user_groups'),
    getItem('服务器管理', 'servers'),
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
  // 修改初始状态，不默认展开任何菜单
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('home');

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
  };

  const handleLogout = () => {
    message.success('注销成功');
    // 这里可以添加实际的注销逻辑，比如清除token、跳转到登录页等
    console.log('执行注销操作');
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
      default:
        return <HomeContent />;
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
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
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}>
              <Avatar 
                style={{ 
                  backgroundColor: '#1890ff' 
                }} 
                icon={<UserOutlined />} 
              />
              <Text>管理员</Text>
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
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
