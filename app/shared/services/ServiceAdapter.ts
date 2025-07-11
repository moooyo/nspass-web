/**
 * 服务适配器
 * 用于适配不同的服务方法名到标准接口
 */

import type { StandardApiResponse, QueryParams } from '../types/common';

/**
 * 标准化服务接口
 * hooks期望的服务接口格式
 */
export interface StandardService<T> {
  getList: (params?: QueryParams) => Promise<StandardApiResponse<T[]>>;
  create: (data: any) => Promise<StandardApiResponse<T>>;
  update: (id: string | number, data: any) => Promise<StandardApiResponse<T>>;
  delete: (id: string | number) => Promise<StandardApiResponse<void>>;
  batchDelete?: (ids: (string | number)[]) => Promise<StandardApiResponse<void>>;
}

/**
 * 服务适配器配置
 */
export interface ServiceAdapterConfig<T> {
  // 原始服务实例
  service: any;
  
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
    getList?: (params: QueryParams) => any;
    create?: (data: any) => any;
    update?: (id: string | number, data: any) => [any, any];
    delete?: (id: string | number) => any;
    batchDelete?: (ids: (string | number)[]) => any;
  };
  
  // 响应转换器
  responseTransformers?: {
    getList?: (response: any) => StandardApiResponse<T[]>;
    create?: (response: any) => StandardApiResponse<T>;
    update?: (response: any) => StandardApiResponse<T>;
    delete?: (response: any) => StandardApiResponse<void>;
    batchDelete?: (response: any) => StandardApiResponse<void>;
  };
}

/**
 * 创建服务适配器
 * 将任意服务转换为标准化接口
 */
export function createServiceAdapter<T>(
  config: ServiceAdapterConfig<T>
): StandardService<T> {
  const {
    service,
    methodMapping,
    paramTransformers = {},
    responseTransformers = {}
  } = config;

  const adapter: StandardService<T> = {
    async getList(params?: QueryParams): Promise<StandardApiResponse<T[]>> {
      const methodName = methodMapping.getList || 'getList';
      const transformedParams = paramTransformers.getList 
        ? paramTransformers.getList(params || {})
        : params;
      
      const response = await service[methodName](transformedParams);
      
      return responseTransformers.getList 
        ? responseTransformers.getList(response)
        : response;
    },

    async create(data: any): Promise<StandardApiResponse<T>> {
      const methodName = methodMapping.create || 'create';
      const transformedData = paramTransformers.create 
        ? paramTransformers.create(data)
        : data;
      
      const response = await service[methodName](transformedData);
      
      return responseTransformers.create 
        ? responseTransformers.create(response)
        : response;
    },

    async update(id: string | number, data: any): Promise<StandardApiResponse<T>> {
      const methodName = methodMapping.update || 'update';
      const transformedParams = paramTransformers.update 
        ? paramTransformers.update(id, data)
        : [id, data];
      
      const response = await service[methodName](...transformedParams);
      
      return responseTransformers.update 
        ? responseTransformers.update(response)
        : response;
    },

    async delete(id: string | number): Promise<StandardApiResponse<void>> {
      const methodName = methodMapping.delete || 'delete';
      const transformedParams = paramTransformers.delete 
        ? paramTransformers.delete(id)
        : id;
      
      const response = await service[methodName](transformedParams);
      
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
      
      const response = await service[methodName](transformedParams);
      
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
  routes: <T>(routeService: any): StandardService<T> => createServiceAdapter<T>({
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
        const transformed: any = {};
        
        if (params.page) transformed['pagination.page'] = params.page;
        if (params.pageSize) transformed['pagination.pageSize'] = params.pageSize;
        if (params.search) transformed.query = params.search;
        
        // 添加过滤器参数
        if (params.filters) {
          params.filters.forEach(filter => {
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
      getList: (response: any): StandardApiResponse<T[]> => {
        // 如果响应格式已经是标准格式，直接返回
        if (response.success !== undefined) {
          return response;
        }
        
        // 转换为标准格式
        return {
          success: true,
          data: response.data || response,
          message: response.message || '获取成功',
          total: response.total,
          pagination: response.pagination
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
  users: <T>(userService: any): StandardService<T> => createServiceAdapter<T>({
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
  standard: <T>(service: any): StandardService<T> => service as StandardService<T>
};

export default createServiceAdapter;
