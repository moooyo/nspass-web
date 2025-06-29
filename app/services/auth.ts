// 认证相关的API服务
import { httpClient, ApiResponse } from '@/utils/http-client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  base: {
    success: boolean;
    message: string;
    errorCode?: string;
  };
  data?: {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      username: string;
      email: string;
      avatar: string;
      createdAt: string;
      lastLoginAt?: string;
    };
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  base: {
    success: boolean;
    message: string;
    errorCode?: string;
  };
  data?: {
    userId: string;
    username: string;
    email: string;
  };
}

class AuthService {
  private endpoint = '/v1/auth';

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse['data']>(`${this.endpoint}/login`, credentials);
      
      return {
        base: {
          success: response.success,
          message: response.message || (response.success ? '登录成功' : '登录失败'),
          errorCode: response.success ? undefined : 'LOGIN_FAILED'
        },
        data: response.data
      };
    } catch (error) {
      return {
        base: {
          success: false,
          message: error instanceof Error ? error.message : '网络请求失败',
          errorCode: 'NETWORK_ERROR'
        }
      };
    }
  }

  /**
   * 用户注册
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await httpClient.post<RegisterResponse['data']>(`${this.endpoint}/register`, userData);
      
      return {
        base: {
          success: response.success,
          message: response.message || (response.success ? '注册成功' : '注册失败'),
          errorCode: response.success ? undefined : 'REGISTER_FAILED'
        },
        data: response.data
      };
    } catch (error) {
      return {
        base: {
          success: false,
          message: error instanceof Error ? error.message : '网络请求失败',
          errorCode: 'NETWORK_ERROR'
        }
      };
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      // 清理本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('login_method');
      localStorage.removeItem('auth_token');
      
      // 清理所有OAuth2相关的配置
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('oauth2_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  /**
   * 检查邮箱格式
   */
  isEmailFormat(input: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }

  /**
   * 保存认证信息
   */
  saveAuthData(authData: LoginResponse['data']): void {
    if (!authData) return;
    
    try {
      localStorage.setItem('auth_token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    } catch (error) {
      console.error('保存认证信息失败:', error);
    }
  }

  /**
   * 获取保存的认证token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const authService = new AuthService(); 