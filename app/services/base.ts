import { httpClient, ApiResponse } from '@/utils/http-client';

/**
 * 统一的分页参数接口
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  current?: number; // 兼容 Ant Design 的 ProTable
}

/**
 * 统一的查询参数接口
 */
export interface QueryParams extends PaginationParams {
  [key: string]: any;
}

/**
 * 统一的 API 响应接口
 */
export interface StandardApiResponse<T = any> extends ApiResponse<T> {
  total?: number;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 批量操作请求接口
 */
export interface BatchOperationRequest {
  ids: (string | number)[];
}

/**
 * 批量状态更新请求接口
 */
export interface BatchStatusUpdateRequest extends BatchOperationRequest {
  status: string;
}

/**
 * 基础 Service 抽象类
 * 提供通用的 CRUD 操作模板
 */
export abstract class BaseService<T = any, CreateData = any, UpdateData = any> {
  protected abstract readonly endpoint: string;
  protected readonly httpClient = httpClient;

  /**
   * 构建查询参数
   */
  protected buildQueryParams(params: QueryParams = {}): Record<string, string> {
    const queryParams: Record<string, string> = {};
    
    // 处理分页参数
    if (params.page || params.current) {
      queryParams.page = (params.page || params.current)!.toString();
    }
    if (params.pageSize) {
      queryParams.pageSize = params.pageSize.toString();
    }
    
    // 处理其他参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          !['page', 'pageSize', 'current'].includes(key)) {
        queryParams[key] = value.toString();
      }
    });
    
    return queryParams;
  }

  /**
   * 获取列表数据
   */
  async getList(params: QueryParams = {}): Promise<StandardApiResponse<T[]>> {
    const queryParams = this.buildQueryParams(params);
    return this.httpClient.get<T[]>(this.endpoint, queryParams);
  }

  /**
   * 根据 ID 获取单个数据
   */
  async getById(id: string | number): Promise<StandardApiResponse<T>> {
    return this.httpClient.get<T>(`${this.endpoint}/${id}`);
  }

  /**
   * 创建新数据
   */
  async create(data: CreateData): Promise<StandardApiResponse<T>> {
    return this.httpClient.post<T>(this.endpoint, data);
  }

  /**
   * 更新数据
   */
  async update(id: string | number, data: UpdateData): Promise<StandardApiResponse<T>> {
    return this.httpClient.put<T>(`${this.endpoint}/${id}`, data);
  }

  /**
   * 删除数据
   */
  async delete(id: string | number): Promise<StandardApiResponse<void>> {
    return this.httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量删除
   */
  async batchDelete(ids: (string | number)[]): Promise<StandardApiResponse<void>> {
    return this.httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids });
  }

  /**
   * 搜索数据
   */
  async search(query: string, params: QueryParams = {}): Promise<StandardApiResponse<T[]>> {
    const queryParams = this.buildQueryParams({ ...params, query });
    return this.httpClient.get<T[]>(`${this.endpoint}/search`, queryParams);
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: (string | number)[], status: string): Promise<StandardApiResponse<T[]>> {
    return this.httpClient.post<T[]>(`${this.endpoint}/batch/status`, { ids, status });
  }

  /**
   * 通用错误处理
   */
  protected handleError(error: any, operation: string): StandardApiResponse<any> {
    console.error(`${operation} 操作失败:`, error);
    return {
      success: false,
      message: error?.message || `${operation}失败，请稍后重试`,
      data: null
    };
  }
}

/**
 * 服务管理器 - 用于管理所有服务实例
 */
export class ServiceManager {
  private static instance: ServiceManager;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * 注册服务
   */
  registerService<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * 获取服务
   */
  getService<T>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  /**
   * 获取所有服务
   */
  getAllServices(): Map<string, any> {
    return this.services;
  }

  /**
   * 清理所有服务的缓存
   */
  clearAllCaches(): void {
    httpClient.clearCache();
  }
}

export const serviceManager = ServiceManager.getInstance();
