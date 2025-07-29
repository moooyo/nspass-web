'use client';

/**
 * 运行时环境变量工具
 * 支持 Vite 环境变量系统和动态 API base URL 更新
 */

// 环境变量接口
interface RuntimeEnv {
  VITE_API_BASE_URL?: string;
  NODE_ENV?: string;
}

// 动态 API base URL 存储
let dynamicApiBaseUrl: string | null = null;

// 从window获取注入的环境变量，或使用Vite的环境变量作为fallback
const getRuntimeEnv = (): RuntimeEnv => {
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__;
  }

  // Rolldown环境变量作为fallback - 使用MODE而不是NODE_ENV避免undefined错误
  return {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    NODE_ENV: import.meta.env.MODE || 'production' // 使用MODE，确保不为undefined
  };
};

export const runtimeEnv = getRuntimeEnv();

// 辅助函数 - 添加安全检查
export const isDevelopment = () => (runtimeEnv.NODE_ENV || 'production') === 'development';
export const isProduction = () => (runtimeEnv.NODE_ENV || 'production') === 'production';

// 获取静态环境变量中的 API base URL
export const getApiBaseUrl = () => runtimeEnv.VITE_API_BASE_URL || 'https://api.nspass.xforward.de';

// 获取运行时 API base URL（支持动态更新）
export const getRuntimeApiBaseUrl = (): string => {
  // 优先返回动态设置的 URL，否则返回环境变量中的 URL
  return dynamicApiBaseUrl || getApiBaseUrl();
};

// 动态更新运行时 API base URL
export const updateRuntimeApiBaseUrl = (newBaseUrl: string): void => {
  dynamicApiBaseUrl = newBaseUrl;
  console.log(`🔄 运行时 API base URL 已更新为: ${newBaseUrl}`);
};
