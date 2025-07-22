'use client';

/**
 * 运行时环境变量获取工具
 * 专门处理 Cloudflare Workers 部署时的环境变量获取
 */

'use client';

/**
 * 运行时环境变量工具
 * 支持 Vite 环境变量系统
 */

// 环境变量接口
interface RuntimeEnv {
  VITE_API_BASE_URL?: string;
  NODE_ENV?: string;
}

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
export const getApiBaseUrl = () => runtimeEnv.VITE_API_BASE_URL || 'https://api.nspass.xforward.de';
export const getRuntimeApiBaseUrl = getApiBaseUrl; // 为向后兼容添加别名
