'use client'
import React, { useState } from 'react';
import { EditOutlined, HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UnorderedListOutlined, UserOutlined, ApiOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme } from 'antd';

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

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: 'Home',
  },
  {
    key: 'user',
    icon: <UserOutlined />,
    label: 'User Info',
  },
  {
    key: 'forward_rules',
    icon: <UnorderedListOutlined />,
    label: 'Forward Rules',
  },
  {
    key: 'egress',
    icon: <ApiOutlined />,
    label: 'Egress',
  },
  {
    key: 'config',
    icon: <EditOutlined />,
    label: 'Config',
    children: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'website', label: 'Website' },
      { key: 'users', label: 'Users' },
      { key: 'user_groups', label: 'User Groups' },
      { key: 'servers', label: 'Servers' },
    ],
  }
];

interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}

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

export default function Home() {
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>(['config'])  ;
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
      <Sider trigger={null} collapsible collapsed={collapsed} width={256} collapsedWidth={80}>
        <div className="logo" style={{ 
          height: '64px', 
          margin: '16px', 
          background: 'rgba(255, 255, 255, 0.2)', 
          borderRadius: borderRadiusLG 
        }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['home']}
          selectedKeys={[selectedKey]}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
          onSelect={handleMenuSelect}
          items={items}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
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
