/**
 * 全局服务配置管理器
 * 统一管理所有服务的配置，确保配置一致性
 */

import type { ServiceConfig } from './EnhancedBaseService';

/**
 * 默认服务配置
 */
export const DEFAULT_SERVICE_CONFIG: ServiceConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
};

/**
 * 特定服务的配置覆盖
 * 简化版本，只保留必要的配置
 */
export const SERVICE_CONFIGS: Record<string, Partial<ServiceConfig>> = {
  // 可以为特定服务设置不同的超时时间
  auth: {
    timeout: 15000, // 认证服务15秒超时
  },

  dashboard: {
    timeout: 10000, // 仪表盘10秒超时
  },

  userInfo: {
    timeout: 10000, // 用户信息10秒超时
  },
};

/**
 * 获取服务配置
 * @param serviceName 服务名称
 * @returns 合并后的服务配置
 */
export function getServiceConfig(serviceName: string): ServiceConfig {
  const specificConfig = SERVICE_CONFIGS[serviceName] || {};
  return {
    ...DEFAULT_SERVICE_CONFIG,
    ...specificConfig,
  };
}

/**
 * 更新全局baseURL
 * 当运行时环境变化时调用此方法
 * @param newBaseURL 新的API基础URL
 */
export function updateGlobalBaseURL(newBaseURL: string): void {
  DEFAULT_SERVICE_CONFIG.baseURL = newBaseURL;
  
  // 通知所有已创建的服务实例更新配置
  // 这里可以添加事件通知机制
  console.log(`全局服务配置已更新，新的baseURL: ${newBaseURL}`);
}

/**
 * 服务配置验证器
 * 确保配置的有效性
 */
export function validateServiceConfig(config: ServiceConfig): boolean {
  if (!config.baseURL) {
    console.error('服务配置错误: baseURL 不能为空');
    return false;
  }

  if (config.timeout && config.timeout <= 0) {
    console.error('服务配置错误: timeout 必须大于0');
    return false;
  }

  return true;
}

/**
 * 创建服务配置的工厂函数
 * @param serviceName 服务名称
 * @param overrides 配置覆盖
 * @returns 验证后的服务配置
 */
export function createServiceConfig(
  serviceName: string,
  overrides: Partial<ServiceConfig> = {}
): ServiceConfig {
  const config = {
    ...getServiceConfig(serviceName),
    ...overrides,
  };

  if (!validateServiceConfig(config)) {
    throw new Error(`服务 ${serviceName} 的配置无效`);
  }

  return config;
}

export default {
  DEFAULT_SERVICE_CONFIG,
  SERVICE_CONFIGS,
  getServiceConfig,
  updateGlobalBaseURL,
  validateServiceConfig,
  createServiceConfig,
};
