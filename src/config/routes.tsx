import React from 'react';
import { 
  HomeOutlined, 
  UserOutlined, 
  UnorderedListOutlined, 
  DashboardOutlined, 
  SettingOutlined, 
  TeamOutlined,
  CloudServerOutlined,
  ApiOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
  CloudOutlined
} from '@ant-design/icons';

// 懒加载所有页面组件
const HomeContent = React.lazy(() => import('../components/content/Home'));
const UserInfo = React.lazy(() => import('../components/content/UserInfo'));
const ForwardRules = React.lazy(() => import('../components/content/ForwardRules'));
const Egress = React.lazy(() => import('../components/content/Egress'));
const Iptables = React.lazy(() => import('../components/content/Iptables'));
const Routes = React.lazy(() => import('../components/content/Routes'));
const Dashboard = React.lazy(() => import('../components/content/config/Dashboard'));
const Website = React.lazy(() => import('../components/content/config/Website'));
const Users = React.lazy(() => import('../components/content/config/Users'));
const UserGroups = React.lazy(() => import('../components/content/config/UserGroups'));
const Servers = React.lazy(() => import('../components/content/config/Servers'));
const DnsConfig = React.lazy(() => import('../components/content/config/DnsConfig'));

export interface RouteConfig {
  key: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  aliases?: string[]; // 路径别名
  group?: 'basic' | 'admin'; // 路由分组
}

// 路由配置
export const routeConfigs: RouteConfig[] = [
  // 基础功能组
  {
    key: 'home',
    path: '/home',
    label: '首页',
    icon: <HomeOutlined />,
    component: HomeContent,
    group: 'basic'
  },
  {
    key: 'user',
    path: '/user',
    label: '用户信息',
    icon: <UserOutlined />,
    component: UserInfo,
    group: 'basic'
  },
  {
    key: 'forward_rules',
    path: '/forward_rules',
    label: '转发规则',
    icon: <UnorderedListOutlined />,
    component: ForwardRules,
    aliases: ['/rules'],
    group: 'basic'
  },
  {
    key: 'egress',
    path: '/egress',
    label: '出口配置',
    icon: <ApiOutlined />,
    component: Egress,
    group: 'basic'
  },
  {
    key: 'iptables',
    path: '/iptables',
    label: 'iptables 管理',
    icon: <SafetyCertificateOutlined />,
    component: Iptables,
    group: 'basic'
  },
  {
    key: 'routes',
    path: '/routes',
    label: '查看线路',
    icon: <UnorderedListOutlined />,
    component: Routes,
    group: 'basic'
  },
  
  // 系统管理组
  {
    key: 'dashboard',
    path: '/dashboard',
    label: '仪表盘',
    icon: <DashboardOutlined />,
    component: Dashboard,
    group: 'admin'
  },
  {
    key: 'website',
    path: '/website',
    label: '网站配置',
    icon: <SettingOutlined />,
    component: Website,
    group: 'admin'
  },
  {
    key: 'users',
    path: '/users',
    label: '用户管理',
    icon: <TeamOutlined />,
    component: Users,
    group: 'admin'
  },
  {
    key: 'user_groups',
    path: '/user_groups',
    label: '用户组管理',
    icon: <UsergroupAddOutlined />,
    component: UserGroups,
    aliases: ['/groups'],
    group: 'admin'
  },
  {
    key: 'servers',
    path: '/servers',
    label: '服务器管理',
    icon: <CloudServerOutlined />,
    component: Servers,
    group: 'admin'
  },
  {
    key: 'dns_config',
    path: '/dns_config',
    label: 'DNS配置',
    icon: <CloudOutlined />,
    component: DnsConfig,
    aliases: ['/dns'],
    group: 'admin'
  }
];

// 生成菜单项
export const getMenuItems = () => {
  const basicItems = routeConfigs
    .filter(route => route.group === 'basic')
    .map(route => ({
      key: route.key,
      label: route.label,
      icon: route.icon,
    }));

  const adminItems = routeConfigs
    .filter(route => route.group === 'admin')
    .map(route => ({
      key: route.key,
      label: route.label,
      icon: route.icon,
    }));

  return [
    ...basicItems,
    { type: 'divider' as const },
    ...adminItems
  ];
};

// 根据路径查找路由配置
export const findRouteByPath = (pathname: string): RouteConfig | undefined => {
  return routeConfigs.find(route => {
    if (route.path === pathname) return true;
    if (route.aliases?.includes(pathname)) return true;
    return false;
  });
};

// 根据 key 查找路由配置
export const findRouteByKey = (key: string): RouteConfig | undefined => {
  return routeConfigs.find(route => route.key === key);
};

// 获取所有路径（包括别名）
export const getAllPaths = (): string[] => {
  const paths: string[] = [];
  routeConfigs.forEach(route => {
    paths.push(route.path);
    if (route.aliases) {
      paths.push(...route.aliases);
    }
  });
  return paths;
};
