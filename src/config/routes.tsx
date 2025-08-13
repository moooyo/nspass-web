import React from 'react';
import { 
  Home, 
  User, 
  List, 
  BarChart3, 
  Settings, 
  Users as UsersIcon,
  Server,
  Network,
  Shield,
  UserPlus,
  Cloud,
  Zap
} from 'lucide-react';

// 现代化页面组件
const ModernDashboard = React.lazy(() => import('../pages/ModernDashboard'));
const ModernUsers = React.lazy(() => import('../pages/ModernUsers'));
const ModernSubscription = React.lazy(() => import('../pages/ModernSubscription'));
const ModernEgress = React.lazy(() => import('../pages/ModernEgress'));
const ModernRoutes = React.lazy(() => import('../pages/ModernRoutes'));
const ModernIptables = React.lazy(() => import('../pages/ModernIptables'));
const ModernForwardRules = React.lazy(() => import('../pages/ModernForwardRules'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));

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
    icon: <Home size={16} />,
    component: ModernDashboard,
    group: 'basic'
  },
  {
    key: 'user',
    path: '/user',
    label: '用户信息',
    icon: <User size={16} />,
    component: ModernDashboard,
    group: 'basic'
  },
  {
    key: 'forward_rules',
    path: '/forward_rules',
    label: '转发规则',
    icon: <List size={16} />,
    component: ModernForwardRules,
    aliases: ['/rules'],
    group: 'basic'
  },
  {
    key: 'egress',
    path: '/egress',
    label: '出口配置',
    icon: <Network size={16} />,
    component: ModernEgress,
    group: 'basic'
  },
  {
    key: 'iptables',
    path: '/iptables',
    label: 'iptables 管理',
    icon: <Shield size={16} />,
    component: ModernIptables,
    group: 'basic'
  },
  {
    key: 'routes',
    path: '/routes',
    label: '查看线路',
    icon: <List size={16} />,
    component: ModernRoutes,
    group: 'basic'
  },
  {
    key: 'subscription',
    path: '/subscription',
    label: '订阅管理',
    icon: <Zap size={16} />,
    component: ModernSubscription,
    aliases: ['/subscriptions'],
    group: 'basic'
  },
  
  // 系统管理组
  {
    key: 'dashboard',
    path: '/dashboard',
    label: '仪表盘',
    icon: <BarChart3 size={16} />,
    component: ModernDashboard,
    group: 'admin'
  },
  {
    key: 'website',
    path: '/website',
    label: '网站配置',
    icon: <Settings size={16} />,
    component: SettingsPage,
    group: 'admin'
  },
  {
    key: 'users',
    path: '/users',
    label: '用户管理',
    icon: <UsersIcon size={16} />,
    component: ModernUsers,
    group: 'admin'
  },
  {
    key: 'user_groups',
    path: '/user_groups',
    label: '用户组管理',
    icon: <UserPlus size={16} />,
    component: ModernDashboard,
    aliases: ['/groups'],
    group: 'admin'
  },
  {
    key: 'servers',
    path: '/servers',
    label: '服务器管理',
    icon: <Server size={16} />,
    component: ModernDashboard,
    group: 'admin'
  },
  {
    key: 'dns_config',
    path: '/dns_config',
    label: 'DNS配置',
    icon: <Cloud size={16} />,
    component: ModernDashboard,
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
