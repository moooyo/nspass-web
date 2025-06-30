import { httpClient, ApiResponse } from '@/utils/http-client';
import { RouteType } from '@/types/generated/model/route';

// 简化的路由项类型，用于UI组件
export interface RouteItem {
  id: React.Key;
  routeId: string;
  routeName: string;
  entryPoint: string;
  protocol: 'shadowsocks' | 'snell';
  udpSupport: boolean;
  tcpFastOpen: boolean;
  password: string;
  otherParams: string;
  
  // 协议特有字段
  port?: string;
  method?: string; // shadowsocks加密方法
  snellVersion?: '4' | '5'; // snell版本
}

// 查询参数类型
export interface RouteListParams {
  page?: number;
  pageSize?: number;
  routeId?: string;
  routeName?: string;
  type?: RouteType; // 使用proto枚举类型
  protocol?: 'shadowsocks' | 'snell';
}

// 创建线路数据类型
export type CreateRouteData = Omit<RouteItem, 'id'>;

// 更新线路数据类型
export type UpdateRouteData = Partial<Omit<RouteItem, 'id'>>;

class RouteService {
  private readonly endpoint = '/v1/routes';

  /**
   * 获取线路列表
   */
  async getRouteList(params: RouteListParams = {}): Promise<ApiResponse<RouteItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.routeId) queryParams.routeId = params.routeId;
    if (params.routeName) queryParams.routeName = params.routeName;
    if (params.type) queryParams.type = params.type; // 直接使用proto枚举值
    if (params.protocol) queryParams.protocol = params.protocol;

    return httpClient.get<RouteItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新线路
   */
  async createRoute(routeData: CreateRouteData): Promise<ApiResponse<RouteItem>> {
    return httpClient.post<RouteItem>(this.endpoint, routeData);
  }

  /**
   * 获取线路详情
   */
  async getRouteById(id: React.Key): Promise<ApiResponse<RouteItem>> {
    return httpClient.get<RouteItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新线路信息
   */
  async updateRoute(id: React.Key, routeData: UpdateRouteData): Promise<ApiResponse<RouteItem>> {
    return httpClient.put<RouteItem>(`${this.endpoint}/${id}`, routeData);
  }

  /**
   * 删除线路
   */
  async deleteRoute(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量删除线路
   */
  async batchDeleteRoutes(ids: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids });
  }

  /**
   * 测试线路连接
   */
  async testRouteConnection(id: React.Key): Promise<ApiResponse<{
    success: boolean;
    latency: number;
    error?: string;
  }>> {
    return httpClient.post(`${this.endpoint}/${id}/test`);
  }

  /**
   * 生成线路配置
   */
  async generateRouteConfig(id: React.Key, format: string = 'json'): Promise<ApiResponse<{
    config: string;
    format: string;
  }>> {
    return httpClient.post(`${this.endpoint}/${id}/config`, { format });
  }

  /**
   * 验证线路连通性
   */
  async validateRouteConnectivity(id: React.Key, timeoutSeconds: number = 30): Promise<ApiResponse<{
    isReachable: boolean;
    latencyMs?: number;
    errorMessage?: string;
  }>> {
    return httpClient.post(`${this.endpoint}/${id}/connectivity`, { timeoutSeconds });
  }
}

// 创建并导出服务实例
export const routeService = new RouteService();
export default RouteService; 