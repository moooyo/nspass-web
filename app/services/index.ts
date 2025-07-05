import { serviceManager } from './base';
import { serverService } from './server';
import { authService } from './auth';
import { userInfoService } from './userInfo';
import { routeService } from './routes';
import { egressService } from './egress';
import { dashboardService } from './dashboard';
import { forwardRulesService } from './forwardRules';
import { userService } from './user';
import { userGroupsService } from './userGroups';
import { userManagementService } from './userManagement';
import { usersConfigService } from './usersConfig';
import { websiteConfigService } from './websiteConfig';
import { passkeyService } from './passkey';
import { dnsConfigService } from './dnsConfig';

/**
 * 服务注册中心
 * 统一管理所有服务实例
 */
export function registerServices() {
  // 注册所有服务
  serviceManager.registerService('server', serverService);
  serviceManager.registerService('auth', authService);
  serviceManager.registerService('userInfo', userInfoService);
  serviceManager.registerService('route', routeService);
  serviceManager.registerService('egress', egressService);
  serviceManager.registerService('dashboard', dashboardService);
  serviceManager.registerService('forwardRules', forwardRulesService);
  serviceManager.registerService('user', userService);
  serviceManager.registerService('userGroups', userGroupsService);
  serviceManager.registerService('userManagement', userManagementService);
  serviceManager.registerService('usersConfig', usersConfigService);
  serviceManager.registerService('websiteConfig', websiteConfigService);
  serviceManager.registerService('passkey', passkeyService);
  serviceManager.registerService('dnsConfig', dnsConfigService);
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
 * 服务健康检查
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  services: Record<string, boolean>;
  timestamp: string;
}> {
  const services = serviceManager.getAllServices();
  const results: Record<string, boolean> = {};
  
  for (const [name, _service] of services) {
    try {
      // 这里可以添加具体的健康检查逻辑
      // 例如调用服务的 ping 方法或者检查服务状态
      results[name] = true;
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

/**
 * 服务统计信息
 */
export function getServiceStats() {
  const services = serviceManager.getAllServices();
  
  return {
    total: services.size,
    services: Array.from(services.keys()),
    timestamp: new Date().toISOString()
  };
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
  forwardRulesService,
  userService,
  userGroupsService,
  userManagementService,
  usersConfigService,
  websiteConfigService,
  passkeyService,
  dnsConfigService
};

// 自动注册服务
if (typeof window !== 'undefined') {
  registerServices();
  
  // 在开发环境下暴露服务管理器到全局
  if (process.env.NODE_ENV === 'development') {
    (window as any).serviceManager = serviceManager;
    (window as any).getService = getService;
    (window as any).healthCheck = healthCheck;
    (window as any).clearAllCaches = clearAllCaches;
  }
}
