import { logger } from '@/utils/logger';
import { configManager } from '@/config';

// 基础服务类型定义
export interface StandardApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

export interface QueryParams {
  [key: string]: any
}

export interface BatchOperationRequest {
  ids: string[]
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface BatchStatusUpdateRequest {
  ids: string[]
  status: string
}

// API 响应的分页信息
export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 标准列表响应
export interface ListResponse<T> {
  items: T[]
  pagination: PaginationInfo
}

// 操作结果
export interface OperationResult {
  success: boolean
  message?: string
}

// 批量操作结果
export interface BatchOperationResult {
  success: boolean
  successCount: number
  failureCount: number
  errors?: string[]
}

/**
 * HTTP 请求选项
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * 基础服务类
 * 提供统一的HTTP API调用能力
 */
export abstract class BaseService<TItem = any, TCreateData = any, TUpdateData = any> {
  protected readonly serviceName: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    const config = configManager.getConfig();
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.retryAttempts = config.api.retryAttempts;
    this.retryDelay = config.api.retryDelay;
  }

  /**
   * 构建查询参数
   */
  protected buildQueryParams(params: QueryParams): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    return searchParams;
  }

  /**
   * 处理HTTP请求
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<StandardApiResponse<T>> {
    const { headers = {}, timeout = this.timeout, retries = this.retryAttempts, retryDelay = this.retryDelay, ...fetchOptions } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.debug(`[${this.serviceName}] ${fetchOptions.method || 'GET'} ${url}`, {
          attempt: attempt + 1,
          maxAttempts: retries + 1
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          headers: defaultHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        logger.debug(`[${this.serviceName}] Success:`, data);

        return {
          success: true,
          data,
          code: response.status
        };

      } catch (error) {
        lastError = error as Error;
        
        logger.warn(`[${this.serviceName}] Request failed (attempt ${attempt + 1}/${retries + 1}):`, {
          error: lastError.message,
          url,
          method: fetchOptions.method || 'GET'
        });

        if (attempt < retries) {
          await this.delay(retryDelay);
        }
      }
    }

    return this.handleError(lastError!, `${fetchOptions.method || 'GET'} ${endpoint}`);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET 请求
   */
  protected async get<T>(endpoint: string, params?: QueryParams): Promise<StandardApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const queryString = this.buildQueryParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.makeRequest<T>(url, { method: 'GET' });
  }

  /**
   * POST 请求
   */
  protected async post<T>(endpoint: string, data?: any): Promise<StandardApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * PUT 请求
   */
  protected async put<T>(endpoint: string, data?: any): Promise<StandardApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * DELETE 请求
   */
  protected async delete<T>(endpoint: string): Promise<StandardApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH 请求
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<StandardApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * 通用 CRUD 操作
   */

  // 创建资源
  protected async create<T>(endpoint: string, data: TCreateData): Promise<StandardApiResponse<T>> {
    return this.post<T>(endpoint, data);
  }

  // 更新资源
  protected async update<T>(endpoint: string, id: string | number, data: TUpdateData): Promise<StandardApiResponse<T>> {
    return this.put<T>(`${endpoint}/${id}`, data);
  }

  // 根据ID获取资源
  protected async getById<T>(endpoint: string, id: string | number): Promise<StandardApiResponse<T>> {
    return this.get<T>(`${endpoint}/${id}`);
  }

  // 搜索资源
  protected async search<T>(query: string, params: QueryParams = {}): Promise<StandardApiResponse<T[]>> {
    return this.get<T[]>(`${this.endpoint}/search`, { q: query, ...params });
  }

  // 批量删除
  protected async batchDelete<T>(endpoint: string, ids: (string | number)[]): Promise<StandardApiResponse<T>> {
    return this.post<T>(`${endpoint}/batch/delete`, { ids });
  }

  /**
   * 抽象属性，子类必须实现
   */
  protected abstract readonly endpoint: string;

  /**
   * 错误处理
   */
  protected handleError<T>(error: Error, operation?: string): StandardApiResponse<T> {
    const message = operation ? `${operation} 失败: ${error.message}` : error.message;
    
    logger.error(`[${this.serviceName}] ${message}`, {
      error: error.message,
      stack: error.stack,
      operation
    });

    return {
      success: false,
      message,
      code: 500
    };
  }
}

/**
 * 服务管理器
 * 统一管理所有服务实例
 */
export class ServiceManager {
  private services = new Map<string, any>();
  private static instance: ServiceManager;

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * 注册服务
   */
  registerService(name: string, service: any): void {
    this.services.set(name, service);
    logger.debug(`Service registered: ${name}`);
  }

  /**
   * 获取服务
   */
  getService<T>(name: string): T | undefined {
    return this.services.get(name);
  }

  /**
   * 获取所有服务
   */
  getAllServices(): Map<string, any> {
    return new Map(this.services);
  }

  /**
   * 清理所有缓存
   */
  clearAllCaches(): void {
    logger.info('Clearing all service caches');
    // 这里可以添加具体的缓存清理逻辑
  }
}

// 创建服务管理器实例
export const serviceManager = ServiceManager.getInstance();