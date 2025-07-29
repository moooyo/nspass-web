/**
 * 增强的服务基类
 * 提供标准化的服务功能和错误处理，以及服务适配器支持
 */

import type { StandardApiResponse, QueryParams } from '../types/common';
import { apiUtils, asyncUtils } from '../utils';
import { API_CONFIG } from '../constants';
import { createServiceAdapter, type ServiceAdapterConfig, type StandardService } from './ServiceAdapter';

export interface ServiceConfig {
  baseURL?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  enableCache?: boolean;
  cachePrefix?: string;
  cacheTTL?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class EnhancedBaseService {
  protected config: ServiceConfig;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(config: ServiceConfig = {}) {
    this.config = {
      timeout: API_CONFIG.TIMEOUT,
      retryCount: API_CONFIG.RETRY_COUNT,
      retryDelay: API_CONFIG.RETRY_DELAY,
      enableCache: false,
      cachePrefix: 'service_',
      cacheTTL: 5 * 60 * 1000, // 5分钟
      ...config,
    };
  }

  /**
   * 创建服务适配器
   * 用于适配现有服务到标准接口
   */
  protected createAdapter<T, CreateData = unknown, UpdateData = unknown>(
    config: Omit<ServiceAdapterConfig<T, CreateData, UpdateData>, 'service'>
  ): StandardService<T, CreateData, UpdateData> {
    return createServiceAdapter<T, CreateData, UpdateData>({
      ...config,
      service: this
    });
  }

  /**
   * 执行HTTP请求的通用方法
   */
  protected async request<T>(
    url: string,
    options: RequestInit & { 
      enableCache?: boolean;
      cacheKey?: string;
      cacheTTL?: number;
    } = {}
  ): Promise<StandardApiResponse<T>> {
    const { enableCache, cacheKey, cacheTTL, ...requestOptions } = options;
    
    // 检查缓存
    if (enableCache && cacheKey) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return apiUtils.createResponse(cached, true, '从缓存获取');
      }
    }

    // 构建请求
    const requestFn = async () => {
      // 使用AbortController处理超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          ...requestOptions,
          headers: {
            'Content-Type': 'application/json',
            ...requestOptions.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // 执行请求（带重试）
    const result = await asyncUtils.retry(
      requestFn,
      this.config.retryCount!,
      this.config.retryDelay!
    );

    // 缓存结果
    if (enableCache && cacheKey && result.success) {
      this.setCache(cacheKey, result.data, cacheTTL || this.config.cacheTTL!);
    }

    return result;
  }

  /**
   * GET请求
   */
  protected async get<T>(
    endpoint: string,
    params?: QueryParams,
    options: { enableCache?: boolean; cacheKey?: string; cacheTTL?: number } = {}
  ): Promise<StandardApiResponse<T>> {
    const url = this.buildURL(endpoint, params);
    const cacheKey = options.cacheKey || this.generateCacheKey('GET', url);
    
    return this.request<T>(url, {
      method: 'GET',
      enableCache: options.enableCache ?? this.config.enableCache,
      cacheKey,
      cacheTTL: options.cacheTTL,
    });
  }

  /**
   * POST请求
   */
  protected async post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<StandardApiResponse<T>> {
    return this.request<T>(this.buildURL(endpoint), {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT请求
   */
  protected async put<T>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<StandardApiResponse<T>> {
    return this.request<T>(this.buildURL(endpoint), {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE请求
   */
  protected async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<StandardApiResponse<T>> {
    return this.request<T>(this.buildURL(endpoint), {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * 批量请求处理
   */
  protected async batchRequest<T>(
    requests: Array<() => Promise<StandardApiResponse<T>>>,
    options: { concurrency?: number; failFast?: boolean } = {}
  ): Promise<StandardApiResponse<T[]>> {
    const { concurrency = 5, failFast = false } = options;

    try {
      let results: T[];

      if (failFast) {
        // 快速失败模式：任何一个请求失败都会立即失败
        const responses = await asyncUtils.limitConcurrency(requests, concurrency);
        results = responses.map(response => apiUtils.handleResponse(response));
      } else {
        // 容错模式：收集所有成功的结果
        const responses = await Promise.allSettled(
          requests.map(req => asyncUtils.limitConcurrency([req], 1))
        );
        
        results = responses
          .map(result => result.status === 'fulfilled' ? result.value[0] : null)
          .filter(Boolean)
          .map(response => apiUtils.handleResponse(response!));
      }

      return apiUtils.createResponse(results, true, `批量处理完成，成功 ${results.length} 项`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('批量请求失败');
      return apiUtils.createResponse([], false, err.message);
    }
  }

  /**
   * 标准的CRUD操作
   */
  public async getList<T>(
    endpoint: string,
    params?: QueryParams,
    options?: { enableCache?: boolean }
  ): Promise<StandardApiResponse<T[]>> {
    return this.get<T[]>(endpoint, params, {
      enableCache: options?.enableCache,
      cacheKey: this.generateCacheKey('GET_LIST', endpoint, params),
    });
  }

  public async getById<T>(
    endpoint: string,
    id: string | number,
    options?: { enableCache?: boolean }
  ): Promise<StandardApiResponse<T>> {
    return this.get<T>(`${endpoint}/${id}`, undefined, {
      enableCache: options?.enableCache,
      cacheKey: this.generateCacheKey('GET_BY_ID', endpoint, { id }),
    });
  }

  public async create<T>(
    endpoint: string,
    data: unknown
  ): Promise<StandardApiResponse<T>> {
    const response = await this.post<T>(endpoint, data);
    // 创建成功后清除相关缓存
    this.clearCacheByPattern(endpoint);
    return response;
  }

  public async update<T>(
    endpoint: string,
    id: string | number,
    data: unknown
  ): Promise<StandardApiResponse<T>> {
    const response = await this.put<T>(`${endpoint}/${id}`, data);
    // 更新成功后清除相关缓存
    this.clearCacheByPattern(endpoint);
    this.clearCacheByPattern(`${endpoint}/${id}`);
    return response;
  }

  public async deleteItem<T>(
    endpoint: string,
    id: string | number
  ): Promise<StandardApiResponse<T>> {
    const response = await this.delete<T>(`${endpoint}/${id}`);
    // 删除成功后清除相关缓存
    this.clearCacheByPattern(endpoint);
    this.clearCacheByPattern(`${endpoint}/${id}`);
    return response;
  }

  public async batchDelete<T>(
    endpoint: string,
    ids: (string | number)[]
  ): Promise<StandardApiResponse<T>> {
    const response = await this.post<T>(`${endpoint}/batch-delete`, { ids });
    // 批量删除成功后清除相关缓存
    this.clearCacheByPattern(endpoint);
    ids.forEach(id => this.clearCacheByPattern(`${endpoint}/${id}`));
    return response;
  }

  /**
   * 缓存管理
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private generateCacheKey(method: string, url: string, params?: unknown): string {
    const baseKey = `${this.config.cachePrefix}${method}_${url}`;
    if (params) {
      const paramsStr = JSON.stringify(params);
      return `${baseKey}_${Buffer.from(paramsStr).toString('base64')}`;
    }
    return baseKey;
  }

  private clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 工具方法
   */
  private buildURL(endpoint: string, params?: QueryParams): string {
    let url = endpoint;
    
    if (this.config.baseURL) {
      url = `${this.config.baseURL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    }

    if (params) {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });

      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    return url;
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): {
    size: number;
    keys: string[];
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 清空所有缓存
   */
  public clearAllCache(): void {
    this.cache.clear();
  }
}

export default EnhancedBaseService;
