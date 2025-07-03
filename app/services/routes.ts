import { httpClient, ApiResponse } from '@/utils/http-client';
import { 
  RouteType, 
  Protocol, 
  ShadowsocksMethod, 
  SnellVersion, 
  Route,
  ProtocolParams,
  ShadowsocksParams,
  SnellParams
} from '@/types/generated/model/route';

// 路由项类型 - 使用proto生成的类型
export interface RouteItem extends Omit<Route, 'id' | 'metadata'> {
  id: React.Key; // 保持React.Key用于表格
  metadata?: { [key: string]: string };
}

// 创建路由请求数据类型
export interface CreateRouteData {
  routeId?: string;
  routeName: string;
  entryPoint: string;
  port?: number;
  protocol: Protocol;
  protocolParams?: ProtocolParams;
  description?: string;
  metadata?: { [key: string]: string };
}

// 查询参数类型 - 匹配swagger接口
export interface RouteListParams {
  'pagination.page'?: number;
  'pagination.pageSize'?: number;
  type?: RouteType;
  status?: string; // RouteStatus enum
  protocol?: Protocol;
}

// 更新线路数据类型
export type UpdateRouteData = Partial<Omit<RouteItem, 'id'>>;

// 批量删除请求类型
export interface BatchDeleteRoutesRequest {
  ids: React.Key[];
}

// 批量更新状态请求类型
export interface BatchUpdateRouteStatusRequest {
  ids: React.Key[];
  status: string; // RouteStatus
}

class RouteService {
  private readonly endpoint = '/v1/routes';

  /**
   * 获取线路列表 - 匹配swagger接口 GET /v1/routes
   */
  async getRouteList(params: RouteListParams = {}): Promise<ApiResponse<RouteItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params['pagination.page']) queryParams['pagination.page'] = params['pagination.page'].toString();
    if (params['pagination.pageSize']) queryParams['pagination.pageSize'] = params['pagination.pageSize'].toString();
    if (params.type && params.type !== 'ROUTE_TYPE_UNSPECIFIED') queryParams.type = params.type;
    if (params.status && params.status !== 'ROUTE_STATUS_UNSPECIFIED') queryParams.status = params.status;
    if (params.protocol && params.protocol !== 'PROTOCOL_UNSPECIFIED') queryParams.protocol = params.protocol;

    return httpClient.get<RouteItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新线路 - 匹配swagger接口 POST /v1/routes
   */
  async createRoute(routeData: CreateRouteData): Promise<ApiResponse<RouteItem>> {
    return httpClient.post<RouteItem>(this.endpoint, routeData);
  }

  /**
   * 获取线路详情 - 匹配swagger接口 GET /v1/routes/{id}
   */
  async getRouteById(id: React.Key): Promise<ApiResponse<RouteItem>> {
    return httpClient.get<RouteItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新线路信息 - 匹配swagger接口 PUT /v1/routes/{id}
   */
  async updateRoute(id: React.Key, routeData: UpdateRouteData): Promise<ApiResponse<RouteItem>> {
    return httpClient.put<RouteItem>(`${this.endpoint}/${id}`, routeData);
  }

  /**
   * 删除线路 - 匹配swagger接口 DELETE /v1/routes/{id}
   */
  async deleteRoute(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量删除线路 - 匹配swagger接口 POST /v1/routes/batch/delete
   */
  async batchDeleteRoutes(ids: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batch/delete`, { ids });
  }

  /**
   * 批量更新线路状态 - 匹配swagger接口 POST /v1/routes/batch/status
   */
  async batchUpdateRouteStatus(ids: React.Key[], status: string): Promise<ApiResponse<RouteItem[]>> {
    return httpClient.post<RouteItem[]>(`${this.endpoint}/batch/status`, { ids, status });
  }

  /**
   * 搜索线路 - 匹配swagger接口 GET /v1/routes/search
   */
  async searchRoutes(params: {
    query?: string;
    fields?: string[];
    'pagination.page'?: number;
    'pagination.pageSize'?: number;
    type?: RouteType;
  }): Promise<ApiResponse<RouteItem[]>> {
    const queryParams: Record<string, any> = {};
    
    if (params.query) queryParams.query = params.query;
    if (params.fields && params.fields.length > 0) queryParams.fields = params.fields;
    if (params['pagination.page']) queryParams['pagination.page'] = params['pagination.page'].toString();
    if (params['pagination.pageSize']) queryParams['pagination.pageSize'] = params['pagination.pageSize'].toString();
    if (params.type && params.type !== 'ROUTE_TYPE_UNSPECIFIED') queryParams.type = params.type;

    return httpClient.get<RouteItem[]>(`${this.endpoint}/search`, queryParams);
  }

  /**
   * 生成线路配置 - 匹配swagger接口 GET /v1/routes/{id}/config
   */
  async generateRouteConfig(id: React.Key, format: string = 'json'): Promise<ApiResponse<{
    config: string;
    format: string;
  }>> {
    const queryParams = { format };
    return httpClient.get(`${this.endpoint}/${id}/config`, queryParams);
  }

  /**
   * 更新线路状态 - 匹配swagger接口 PUT /v1/routes/{id}/status
   */
  async updateRouteStatus(id: React.Key, status: string): Promise<ApiResponse<RouteItem>> {
    return httpClient.put<RouteItem>(`${this.endpoint}/${id}/status`, { status });
  }

  /**
   * 验证线路连通性 - 匹配swagger接口 POST /v1/routes/{id}/validate
   */
  async validateRouteConnectivity(id: React.Key, timeoutSeconds: number = 30): Promise<ApiResponse<{
    isReachable: boolean;
    latencyMs?: number;
    errorMessage?: string;
  }>> {
    return httpClient.post(`${this.endpoint}/${id}/validate`, { timeoutSeconds });
  }
}

// 创建并导出服务实例
export const routeService = new RouteService();
export default RouteService; 