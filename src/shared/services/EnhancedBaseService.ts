/**
 * 简化的服务基类
 *
 * 设计原则：
 * - 所有API都必须返回标准的Proto响应格式（proto/common中定义）
 * - 不支持其他响应格式，如果API返回非标准格式，说明Proto定义需要修改
 * - 统一的错误处理，所有错误都转换为标准Proto格式返回
 */

import type { StandardApiResponse, QueryParams } from '../types/common';

import { logger } from '@/utils/logger';

export interface ServiceConfig {
  baseURL?: string;
  timeout?: number;
}

// 标准Proto API响应结构
interface ProtoApiResponse<T = unknown> {
  status: {
    success: boolean;
    message: string;
    errorCode?: string;
  };
  data?: T;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * 将Proto响应转换为标准响应格式
 */
function normalizeProtoResponse<T>(response: ProtoApiResponse<T>): StandardApiResponse<T> {
  const normalized: StandardApiResponse<T> = {
    success: response.status.success,
    message: response.status.message,
    data: response.data,
  };

  // 处理分页信息
  if (response.pagination) {
    normalized.pagination = {
      current: response.pagination.page,
      pageSize: response.pagination.pageSize,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages
    };
  }

  return normalized;
}

export class EnhancedBaseService {
  protected config: ServiceConfig;

  constructor(config: ServiceConfig = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de',
      timeout: 3000, // 3秒超时
      ...config,
    };
  }

  /**
   * 动态更新 baseURL
   */
  updateBaseURL(newBaseURL: string) {
    this.config.baseURL = newBaseURL;
    logger.info(`服务 baseURL 已更新为: ${newBaseURL}`);
  }

  /**
   * 获取当前 baseURL
   */
  getCurrentBaseURL(): string {
    return this.config.baseURL || import.meta.env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de';
  }

  /**
   * 构建完整的URL
   */
  private buildURL(endpoint: string, params?: QueryParams): string {
    // 使用当前配置的baseURL
    const baseURL = this.config.baseURL || import.meta.env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de';
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    let fullUrl: string;
    if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
      try {
        const url = new URL(`${baseURL}${normalizedEndpoint}`);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value));
            }
          });
        }
        fullUrl = url.toString();
      } catch (error) {
        logger.error('构建URL失败:', error);
        fullUrl = `${baseURL}${normalizedEndpoint}`;
      }
    } else {
      fullUrl = `${baseURL}${normalizedEndpoint}`;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          fullUrl += `?${queryString}`;
        }
      }
    }

    return fullUrl;
  }

  /**
   * 执行HTTP请求的通用方法
   */
  protected async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<StandardApiResponse<T>> {
    try {
      // 使用AbortController处理超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // 自动添加Authorization header（除了登录和注册接口）
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (!isAuthEndpoint && typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, {
        signal: controller.signal,
        ...options,
        headers,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        this.handleUnauthorized();
        // 返回标准Proto格式的错误响应
        const errorResponse: ProtoApiResponse<T> = {
          status: {
            success: false,
            message: '未授权访问，请重新登录',
            errorCode: 'UNAUTHORIZED'
          }
        };
        return normalizeProtoResponse<T>(errorResponse);
      }

      if (!response.ok) {
        // 尝试解析错误响应，如果是标准Proto格式
        try {
          const errorData = await response.json();
          return normalizeProtoResponse<T>(errorData);
        } catch {
          // 如果解析失败，返回标准格式的HTTP错误
          const errorResponse: ProtoApiResponse<T> = {
            status: {
              success: false,
              message: `HTTP ${response.status}: ${response.statusText}`,
              errorCode: `HTTP_${response.status}`
            }
          };
          return normalizeProtoResponse<T>(errorResponse);
        }
      }

      const data = await response.json();

      // 直接处理标准Proto响应格式
      return normalizeProtoResponse<T>(data);
    } catch (error) {
      logger.error('API request failed:', error);

      // 所有错误都返回标准Proto格式
      let errorMessage = '请求失败，请稍后重试';
      let errorCode = 'UNKNOWN_ERROR';

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = '网络请求失败，请检查网络连接或服务器状态';
        errorCode = 'NETWORK_ERROR';
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorCode = 'REQUEST_ERROR';
      }

      const errorResponse: ProtoApiResponse<T> = {
        status: {
          success: false,
          message: errorMessage,
          errorCode
        }
      };

      return normalizeProtoResponse<T>(errorResponse);
    }
  }

  /**
   * 处理未授权错误
   */
  private handleUnauthorized() {
    // 仅在浏览器环境中执行
    if (typeof window === 'undefined') {
      return;
    }

    logger.warn('检测到未授权访问，正在注销登录...');

    // 清理认证信息
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

    // 跳转到登录页面
    window.location.href = '/login';
  }

  /**
   * GET请求
   */
  public async get<T>(
    endpoint: string,
    params?: QueryParams
  ): Promise<StandardApiResponse<T>> {
    const url = this.buildURL(endpoint, params);
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST请求
   */
  public async post<T>(
    endpoint: string,
    data?: unknown
  ): Promise<StandardApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求
   */
  public async put<T>(
    endpoint: string,
    data?: unknown
  ): Promise<StandardApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求
   */
  public async delete<T>(endpoint: string): Promise<StandardApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.request<T>(url, { method: 'DELETE' });
  }

  // ===== 便利方法 - 兼容现有服务调用 =====

  /**
   * 获取列表数据
   */
  async getList<T>(endpoint: string, params?: QueryParams): Promise<StandardApiResponse<T[]>> {
    return this.get<T[]>(endpoint, params);
  }

  /**
   * 根据ID获取单个数据
   */
  async getById<T>(endpoint: string, id: string | number): Promise<StandardApiResponse<T>> {
    return this.get<T>(`${endpoint}/${id}`);
  }

  /**
   * 创建新数据
   */
  async create<T>(endpoint: string, data: unknown): Promise<StandardApiResponse<T>> {
    return this.post<T>(endpoint, data);
  }

  /**
   * 更新数据
   */
  async update<T>(endpoint: string, id: string | number, data: unknown): Promise<StandardApiResponse<T>> {
    return this.put<T>(`${endpoint}/${id}`, data);
  }

  /**
   * 删除单个数据
   */
  async deleteItem<T>(endpoint: string, id: string | number): Promise<StandardApiResponse<T>> {
    return this.delete<T>(`${endpoint}/${id}`);
  }

  /**
   * 批量删除
   */
  async batchDelete<T>(endpoint: string, ids: (string | number)[]): Promise<StandardApiResponse<T>> {
    return this.post<T>(`${endpoint}/batch-delete`, { ids });
  }
}

// 创建全局共享的HTTP客户端实例
export const globalHttpClient = new EnhancedBaseService();