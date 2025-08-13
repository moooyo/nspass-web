// 简化的认证服务
export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  permissions: string[]
  provider?: string
  role?: string
}

import { logger } from '@/utils/logger';

// Mock 认证服务
export const authService = {
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    // Mock 登录实现
    logger.debug('Mock login:', data)
    return {
      user: {
        id: '1',
        name: 'Admin User',
        email: data.email,
        permissions: ['admin'],
        role: 'admin'
      },
      token: 'mock-token'
    }
  },

  async logout(): Promise<void> {
    // Mock 登出实现
    logger.debug('Mock logout')
  },

  async getCurrentUser(): Promise<User | null> {
    // Mock 获取当前用户
    return {
      id: '1',
      name: 'Admin User',
      email: 'admin@nspass.local',
      permissions: ['admin'],
      role: 'admin'
    }
  },

  async refreshToken(): Promise<string> {
    // Mock 刷新令牌
    return 'mock-refreshed-token'
  }
}