/**
 * 服务适配器
 * 用于适配不同的服务方法名到标准接口
 */

import type { StandardApiResponse, QueryParams } from '../types/common';

/**
 * 标准化服务接口
 * hooks期望的服务接口格式
 */
export interface StandardService<T, CreateData = unknown, UpdateData = unknown> {
  getList: (params?: QueryParams) => Promise<StandardApiResponse<T[]>>;
  create: (data: CreateData) => Promise<StandardApiResponse<T>>;
  update: (id: string | number, data: UpdateData) => Promise<StandardApiResponse<T>>;
  delete: (id: string | number) => Promise<StandardApiResponse<void>>;
  batchDelete?: (ids: (string | number)[]) => Promise<StandardApiResponse<void>>;
}

/**
 * 服务适配器配置
 */
export interface ServiceAdapterConfig<T, CreateData = unknown, UpdateData = unknown> {
  // 原始服务实例
  service: unknown;

  // 方法映射
  methodMapping: {
    getList?: string;
    create?: string;
    update?: string;
    delete?: string;
    batchDelete?: string;
  };

  // 参数转换器
  paramTransformers?: {
    getList?: (params: QueryParams) => unknown;
    create?: (data: CreateData) => unknown;
    update?: (id: string | number, data: UpdateData) => [unknown, unknown];
    delete?: (id: string | number) => unknown;
    batchDelete?: (ids: (string | number)[]) => unknown;
  };

  // 响应转换器
  responseTransformers?: {
    getList?: (response: unknown) => StandardApiResponse<T[]>;
    create?: (response: unknown) => StandardApiResponse<T>;
    update?: (response: unknown) => StandardApiResponse<T>;
    delete?: (response: unknown) => StandardApiResponse<void>;
    batchDelete?: (response: unknown) => StandardApiResponse<void>;
  };
}

/**
 * 创建服务适配器
 * 将任意服务转换为标准化接口
 */
export function createServiceAdapter<T, CreateData = unknown, UpdateData = unknown>(
  config: ServiceAdapterConfig<T, CreateData, UpdateData>
): StandardService<T, CreateData, UpdateData> {
  const {
    service,
    methodMapping,
    paramTransformers = {},
    responseTransformers = {}
  } = config;

  const adapter: StandardService<T, CreateData, UpdateData> = {
    async getList(params?: QueryParams): Promise<StandardApiResponse<T[]>> {
      const methodName = methodMapping.getList || 'getList';
      const transformedParams = paramTransformers.getList
        ? paramTransformers.getList(params || {})
        : params;

      const response = await (service as any)[methodName](transformedParams);

      return responseTransformers.getList
        ? responseTransformers.getList(response)
        : response;
    },

    async create(data: CreateData): Promise<StandardApiResponse<T>> {
      const methodName = methodMapping.create || 'create';
      const transformedData = paramTransformers.create
        ? paramTransformers.create(data)
        : data;

      const response = await (service as any)[methodName](transformedData);

      return responseTransformers.create
        ? responseTransformers.create(response)
        : response;
    },

    async update(id: string | number, data: UpdateData): Promise<StandardApiResponse<T>> {
      const methodName = methodMapping.update || 'update';
      const transformedParams = paramTransformers.update
        ? paramTransformers.update(id, data)
        : [id, data];

      const response = await (service as any)[methodName](...(transformedParams as any[]));

      return responseTransformers.update
        ? responseTransformers.update(response)
        : response;
    },

    async delete(id: string | number): Promise<StandardApiResponse<void>> {
      const methodName = methodMapping.delete || 'delete';
      const transformedParams = paramTransformers.delete
        ? paramTransformers.delete(id)
        : id;

      const response = await (service as any)[methodName](transformedParams);

      return responseTransformers.delete
        ? responseTransformers.delete(response)
        : response;
    },

    async batchDelete(ids: (string | number)[]): Promise<StandardApiResponse<void>> {
      if (!methodMapping.batchDelete) {
        throw new Error('Batch delete not supported by this service');
      }

      const methodName = methodMapping.batchDelete;
      const transformedParams = paramTransformers.batchDelete
        ? paramTransformers.batchDelete(ids)
        : ids;

      const response = await (service as any)[methodName](transformedParams);

      return responseTransformers.batchDelete
        ? responseTransformers.batchDelete(response)
        : response;
    }
  };

  // 如果服务不支持批量删除，则移除该方法
  if (!methodMapping.batchDelete) {
    delete adapter.batchDelete;
  }

  return adapter;
}

/**
 * 常用的服务适配器预设
 */
export const ServiceAdapterPresets = {
  /**
   * Routes 服务适配器
   */
  routes: <T, CreateData = unknown, UpdateData = unknown>(
    routeService: unknown
  ): StandardService<T, CreateData, UpdateData> => createServiceAdapter<T, CreateData, UpdateData>({
    service: routeService,
    methodMapping: {
      getList: 'getRouteList',
      create: 'createRoute',
      update: 'updateRoute',
      delete: 'deleteRoute',
      batchDelete: 'batchDeleteRoutes'
    },
    paramTransformers: {
      getList: (params: QueryParams) => {
        // 转换标准参数格式到 routes 服务期望的格式
        const transformed: Record<string, unknown> = {};

        if (params.page) transformed['pagination.page'] = params.page;
        if (params.pageSize) transformed['pagination.pageSize'] = params.pageSize;
        if (params.search) transformed.query = params.search;

        // 添加过滤器参数
        if (params.filters) {
          (params.filters as any[]).forEach((filter: any) => {
            if (filter.field === 'protocol') {
              transformed.protocol = filter.value;
            } else if (filter.field === 'type') {
              transformed.type = filter.value;
            } else if (filter.field === 'status') {
              transformed.status = filter.value;
            }
          });
        }

        return transformed;
      }
    },
    responseTransformers: {
      getList: (response: unknown): StandardApiResponse<T[]> => {
        const resp = response as any;
        // 如果响应格式已经是标准格式，直接返回
        if (resp.success !== undefined) {
          return resp;
        }

        // 转换为标准格式
        return {
          success: true,
          data: resp.data || resp,
          message: resp.message || '获取成功',
          total: resp.total,
          pagination: resp.pagination
        };
      }
    }
  }),

  /**
   * 转发规则服务适配器
   */
  forwardRules: <T>(rulesService: any): StandardService<T> => createServiceAdapter<T>({
    service: rulesService,
    methodMapping: {
      getList: 'getRules',
      create: 'createRule',
      update: 'updateRule',
      delete: 'deleteRule',
      batchDelete: 'batchDeleteRules'
    },
    paramTransformers: {
      getList: (params: QueryParams) => {
        const transformed: any = {};
        if (params.page) transformed.page = params.page;
        if (params.pageSize) transformed.pageSize = params.pageSize;
        if (params.search) transformed.name = params.search;
        return transformed;
      }
    }
  }),

  /**
   * 用户服务适配器
   */
  users: <T, CreateData = unknown, UpdateData = unknown>(
    userService: unknown
  ): StandardService<T, CreateData, UpdateData> => createServiceAdapter<T, CreateData, UpdateData>({
    service: userService,
    methodMapping: {
      getList: 'getUserList',
      create: 'createUser',
      update: 'updateUser',
      delete: 'deleteUser',
      batchDelete: 'batchDeleteUsers'
    }
  }),

  /**
   * 通用服务适配器
   * 适用于方法名已经标准化的服务
   */
  standard: <T, CreateData = unknown, UpdateData = unknown>(
    service: unknown
  ): StandardService<T, CreateData, UpdateData> => service as StandardService<T, CreateData, UpdateData>
};

export default createServiceAdapter;
