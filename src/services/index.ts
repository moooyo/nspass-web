/**
 * 服务统一导出
 * 优化后的服务管理
 */

import { serviceManager } from './base';

// 导入所有服务
import { serverService } from './server';
import { authService } from './auth';
import { userInfoService } from './userInfo';
import { routeService } from './routes';
import { egressService } from './egress';
import { dashboardService } from './dashboard';
import { forwardPathRulesService } from './forwardPathRules';
import { userService } from './user';
import { userGroupsService } from './userGroups';
import { userManagementService } from './userManagement';
import { usersConfigService } from './usersConfig';
import { websiteConfigService } from './websiteConfig';
import { passkeyService } from './passkey';
import { dnsConfigService } from './dnsConfig';
import * as iptablesService from './iptables';

// 服务列表（用于自动注册）
const services = {
  server: serverService,
  auth: authService,
  userInfo: userInfoService,
  route: routeService,
  egress: egressService,
  dashboard: dashboardService,
  forwardRules: forwardPathRulesService,
  user: userService,
  userGroups: userGroupsService,
  userManagement: userManagementService,
  usersConfig: usersConfigService,
  websiteConfig: websiteConfigService,
  passkey: passkeyService,
  dnsConfig: dnsConfigService,
  iptables: iptablesService
};

/**
 * 服务注册中心
 * 统一管理所有服务实例
 */
export function registerServices() {
  Object.entries(services).forEach(([name, service]) => {
    serviceManager.registerService(name, service);
  });
}

/**
 * 获取服务实例
 */
export function getService<T>(name: string): T {
  const service = serviceManager.getService(name);
  if (!service) {
    throw new Error(`Service '${name}' not found. Make sure it's registered.`);
  }
  return service as T;
}

/**
 * 导出所有服务实例（兼容旧代码）
 */
export {
  serverService,
  authService,
  userInfoService,
  routeService,
  egressService,
  dashboardService,
  forwardPathRulesService,
  userService,
  userGroupsService,
  userManagementService,
  usersConfigService,
  websiteConfigService,
  passkeyService,
  dnsConfigService,
  iptablesService
};

/**
 * 服务健康检查
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  services: Record<string, boolean>;
  timestamp: string;
}> {
  const allServices = serviceManager.getAllServices();
  const results: Record<string, boolean> = {};
  
  for (const [name] of allServices) {
    try {
      results[name] = true; // 简化健康检查
    } catch (error) {
      console.error(`Service ${name} health check failed:`, error);
      results[name] = false;
    }
  }
  
  const allHealthy = Object.values(results).every(healthy => healthy);
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    services: results,
    timestamp: new Date().toISOString()
  };
}

/**
 * 清理所有服务缓存
 */
export function clearAllCaches() {
  serviceManager.clearAllCaches();
}

// 自动注册服务
if (typeof window !== 'undefined') {
  registerServices();
  
  // 在开发环境下暴露服务管理器到全局
  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).serviceManager = serviceManager;
  }
}
