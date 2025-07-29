import { EnhancedBaseService, type ServiceConfig } from '@/shared/services/EnhancedBaseService';
import type { StandardApiResponse, QueryParams } from '@/shared/types/common';
import { createServiceConfig } from '@/shared/services/ServiceConfig';

/**
 * 统一的分页参数接口
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  current?: number; // 兼容 Ant Design 的 ProTable
}

/**
 * 扩展的查询参数接口
 */
export interface ExtendedQueryParams extends QueryParams {
  [key: string]: unknown;
}

// 重新导出共享类型
export type { StandardApiResponse, QueryParams } from '@/shared/types/common';

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
 * 继承 EnhancedBaseService 以获得统一的HTTP请求功能
 */
export abstract class BaseService<T = unknown, CreateData = unknown, UpdateData = unknown> extends EnhancedBaseService {
  protected abstract readonly endpoint: string;

  constructor(serviceName: string = 'base', config?: ServiceConfig) {
    // 使用配置管理器创建服务配置
    const serviceConfig = createServiceConfig(serviceName, config);

    super(serviceConfig);
  }

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
   * 获取列表数据 - 便利方法
   */
  async getItems(params: ExtendedQueryParams = {}): Promise<StandardApiResponse<T[]>> {
    return super.getList<T[]>(this.endpoint, params) as Promise<StandardApiResponse<T[]>>;
  }

  /**
   * 根据 ID 获取单个数据 - 便利方法
   */
  async getItem(id: string | number): Promise<StandardApiResponse<T>> {
    return super.getById<T>(this.endpoint, id);
  }

  /**
   * 创建新数据 - 便利方法
   */
  async createItem(data: CreateData): Promise<StandardApiResponse<T>> {
    return super.create<T>(this.endpoint, data);
  }

  /**
   * 更新数据 - 便利方法
   */
  async updateItem(id: string | number, data: UpdateData): Promise<StandardApiResponse<T>> {
    return super.update<T>(this.endpoint, id, data);
  }

  /**
   * 删除数据 - 便利方法
   */
  async removeItem(id: string | number): Promise<StandardApiResponse<void>> {
    return super.deleteItem<void>(this.endpoint, id);
  }

  /**
   * 批量删除 - 便利方法
   */
  async batchRemoveItems(ids: (string | number)[]): Promise<StandardApiResponse<void>> {
    return super.batchDelete<void>(this.endpoint, ids);
  }

  /**
   * 搜索数据
   */
  async search(query: string, params: ExtendedQueryParams = {}): Promise<StandardApiResponse<T[]>> {
    const searchParams = { ...params, query };
    return super.getList<T>(this.endpoint, searchParams);
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(ids: (string | number)[], status: string): Promise<StandardApiResponse<T[]>> {
    return this.post<T[]>(`${this.endpoint}/batch/status`, { ids, status });
  }

  /**
   * 通用错误处理
   */
  protected handleError<T>(error: unknown, operation: string): StandardApiResponse<T> {
    console.error(`${operation} 操作失败:`, error);
    const errorMessage = error instanceof Error ? error.message : `${operation}失败，请稍后重试`;
    return {
      success: false,
      message: errorMessage,
    } as StandardApiResponse<T>;
  }
}

/**
 * 服务管理器 - 用于管理所有服务实例
 */
export class ServiceManager {
  private static instance: ServiceManager;
  private services: Map<string, unknown> = new Map();

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
    // 清理所有服务实例的缓存
    this.services.forEach(service => {
      if (service && typeof (service as any).clearAllCache === 'function') {
        (service as any).clearAllCache();
      }
    });
  }
}

export const serviceManager = ServiceManager.getInstance();
