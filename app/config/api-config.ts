// API配置管理
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  isDevelopment: boolean;
  enableMockData: boolean;
}

// 获取当前环境配置
const getApiConfig = (): ApiConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    baseURL: isDevelopment 
      ? 'http://localhost:3000/api'  // 开发环境使用本地API
      : process.env.NEXT_PUBLIC_API_URL || '/api',  // 生产环境使用环境变量或相对路径
    timeout: 10000, // 10秒超时
    isDevelopment,
    enableMockData: isDevelopment || process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true',
  };
};

export const apiConfig = getApiConfig();

// API端点配置
export const API_ENDPOINTS = {
  // 用户相关
  USERS: '/users',
  PRODUCTS: '/products',
  AUTH_LOGIN: '/auth/login',
  
  // 你可以在这里添加更多的端点
  // ORDERS: '/orders',
  // NOTIFICATIONS: '/notifications',
} as const;

// 环境变量说明
export const ENV_DOCS = {
  NEXT_PUBLIC_API_URL: '生产环境API基础URL',
  NEXT_PUBLIC_ENABLE_MOCK: '是否启用模拟数据 (true/false)',
} as const; 