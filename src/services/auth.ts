// 认证相关的API服务
import { httpClient } from '@/utils/http-client';
import {
  LoginType,
  type LoginRequest as GeneratedLoginRequest,
  type RegisterRequest as GeneratedRegisterRequest,
  type LoginResponse as GeneratedLoginResponse,
  type RegisterResponse as GeneratedRegisterResponse,
} from '@/types/generated/api/users/user_auth';// 重新导出枚举类型
export { LoginType };

// 重新导出生成的类型，提供更简洁的导入路径
export type LoginRequest = GeneratedLoginRequest;
export type RegisterRequest = GeneratedRegisterRequest;
export type LoginResponse = GeneratedLoginResponse;
export type RegisterResponse = GeneratedRegisterResponse;

// 为了保持向后兼容，添加一个简化的接口
export interface LegacyLoginRequest {
  username: string;
  password: string;
}

class AuthService {
  private endpoint = '/v1/auth';

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest | LegacyLoginRequest): Promise<LoginResponse> {
    try {
      let requestData: LoginRequest;
      
      // 检查是否是旧格式的请求
      if ('username' in credentials) {
        // 转换旧格式为新格式
        const isEmail = credentials.username.includes('@');
        requestData = {
          loginType: isEmail ? LoginType.LOGIN_TYPE_EMAIL : LoginType.LOGIN_TYPE_USERNAME,
          identifier: credentials.username,
          password: credentials.password
        };
      } else {
        requestData = credentials;
      }

      const response = await httpClient.post<LoginResponse['data']>(`${this.endpoint}/login`, requestData);
      
      return {
        status: {
          success: response.success,
          message: response.message || (response.success ? '登录成功' : '登录失败'),
          errorCode: response.success ? undefined : 'LOGIN_FAILED'
        },
        data: response.data
      };
    } catch (error) {
      return {
        status: {
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
        status: {
          success: response.success,
          message: response.message || (response.success ? '注册成功' : '注册失败'),
          errorCode: response.success ? undefined : 'REGISTER_FAILED'
        },
        data: response.data
      };
    } catch (error) {
      return {
        status: {
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
    if (!authData || !authData.token) return;
    
    try {
      localStorage.setItem('auth_token', authData.token);
      
      // 将API数据转换为前端期望的用户格式
      const user = {
        id: authData.id?.toString() || 'unknown-id',
        username: authData.name || 'Unknown User',
        email: authData.email || '',
        avatar: '', // API没有返回avatar，使用默认值
        createdAt: new Date().toISOString(), // API没有返回，使用当前时间
        lastLoginAt: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(user));
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