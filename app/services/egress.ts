import { httpClient, ApiResponse } from '@/utils/http-client';

// 出口模式枚举 - 匹配swagger定义
export enum EgressMode {
  EGRESS_MODE_UNSPECIFIED = 'EGRESS_MODE_UNSPECIFIED',
  EGRESS_MODE_DIRECT = 'EGRESS_MODE_DIRECT',
  EGRESS_MODE_IPTABLES = 'EGRESS_MODE_IPTABLES',
  EGRESS_MODE_SS2022 = 'EGRESS_MODE_SS2022'
}

// 转发类型枚举
export enum ForwardType {
  FORWARD_TYPE_UNSPECIFIED = 'FORWARD_TYPE_UNSPECIFIED',
  FORWARD_TYPE_TCP = 'FORWARD_TYPE_TCP',
  FORWARD_TYPE_UDP = 'FORWARD_TYPE_UDP',
  FORWARD_TYPE_ALL = 'FORWARD_TYPE_ALL'
}

// 出口数据类型定义 - 匹配swagger schema
export interface EgressItem {
  id: React.Key;
  egressName?: string;  // 原来的egressId改为egressName，用于显示
  serverId: string;
  egressMode: EgressMode;
  
  // 直出模式字段
  targetAddress?: string;
  
  // iptables模式字段
  forwardType?: ForwardType;
  destAddress?: string;
  destPort?: string;
  
  // shadowsocks-2022模式字段
  password?: string;
  supportUdp?: boolean;
  port?: number;  // shadowsocks端口
}

// 创建出口请求类型 - 匹配swagger CreateEgressRequest
export interface CreateEgressData {
  egressName?: string;  // 原来的egressId改为egressName，用于显示
  serverId: string;
  egressMode: EgressMode;
  
  // 直出模式字段
  targetAddress?: string;
  
  // iptables模式字段
  forwardType?: ForwardType;
  destAddress?: string;
  destPort?: string;
  
  // shadowsocks-2022模式字段
  password?: string;
  supportUdp?: boolean;
  port?: number;  // shadowsocks端口，默认从20000到50000之间随机生成
}

// 更新出口请求类型 - 匹配swagger UpdateEgressRequest
export interface UpdateEgressData {
  egressName?: string;  // 原来的egressId改为egressName，用于显示
  serverId?: string;
  egressMode?: EgressMode;
  targetAddress?: string;
  forwardType?: ForwardType;
  destAddress?: string;
  destPort?: string;
  password?: string;
  supportUdp?: boolean;
  port?: number;  // shadowsocks端口
}

// 查询参数类型 - 匹配swagger GetEgressListRequest
export interface EgressListParams {
  page?: number;
  pageSize?: number;
  egressName?: string;  // 原来的egressId改为egressName，用于查询
  serverId?: string;
  egressMode?: EgressMode;
}

// 测试连接请求类型
export interface TestEgressConnectionData {
  timeout?: number; // 超时时间（秒）
}

// 验证配置请求类型
export interface ValidateEgressConfigData {
  egressId?: string;
  serverId: string;
  egressMode: EgressMode;
  targetAddress?: string;
  forwardType?: ForwardType;
  destAddress?: string;
  destPort?: string;
  password?: string;
  supportUdp?: boolean;
}

class EgressService {
  private readonly endpoint = '/v1/egress';

  /**
   * 获取出口列表 - 匹配swagger接口 GET /v1/egress
   */
  async getEgressList(params: EgressListParams = {}): Promise<ApiResponse<EgressItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.egressName) queryParams.egressName = params.egressName;
    if (params.serverId) queryParams.serverId = params.serverId;
    if (params.egressMode && params.egressMode !== EgressMode.EGRESS_MODE_UNSPECIFIED) {
      queryParams.egressMode = params.egressMode;
    }

    return httpClient.get<EgressItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新出口 - 匹配swagger接口 POST /v1/egress
   */
  async createEgress(egressData: CreateEgressData): Promise<ApiResponse<EgressItem>> {
    return httpClient.post<EgressItem>(this.endpoint, egressData);
  }

  /**
   * 获取出口详情 - 匹配swagger接口 GET /v1/egress/{id}
   */
  async getEgressById(id: React.Key): Promise<ApiResponse<EgressItem>> {
    return httpClient.get<EgressItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新出口信息 - 匹配swagger接口 PUT /v1/egress/{id}
   */
  async updateEgress(id: React.Key, egressData: UpdateEgressData): Promise<ApiResponse<EgressItem>> {
    return httpClient.put<EgressItem>(`${this.endpoint}/${id}`, egressData);
  }

  /**
   * 删除出口 - 匹配swagger接口 DELETE /v1/egress/{id}
   */
  async deleteEgress(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 获取出口统计信息 - 匹配swagger接口 GET /v1/egress/{id}/stats
   */
  async getEgressStats(id: React.Key, days?: number): Promise<ApiResponse<{
    connectionsCount: number;
    bytesTransferred: number;
    lastActivity: string;
  }>> {
    const queryParams: Record<string, string> = {};
    if (days) queryParams.days = days.toString();
    
    return httpClient.get(`${this.endpoint}/${id}/stats`, queryParams);
  }

  /**
   * 测试出口连接 - 匹配swagger接口 POST /v1/egress/{id}/test
   */
  async testEgressConnection(id: React.Key, data: TestEgressConnectionData = {}): Promise<ApiResponse<{
    success: boolean;
    latency: number;
    error?: string;
  }>> {
    return httpClient.post(`${this.endpoint}/${id}/test`, data);
  }

  /**
   * 获取可用服务器列表 - 匹配swagger接口 GET /v1/egress/available-servers
   */
  async getAvailableServers(): Promise<ApiResponse<{ id: string; name: string; country: string }[]>> {
    return httpClient.get<{ id: string; name: string; country: string }[]>(`${this.endpoint}/available-servers`);
  }

  /**
   * 验证出口配置 - 匹配swagger接口 POST /v1/egress/validate-config
   */
  async validateEgressConfig(configData: ValidateEgressConfigData): Promise<ApiResponse<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  }>> {
    return httpClient.post<{ valid: boolean; errors?: string[]; warnings?: string[] }>(`${this.endpoint}/validate-config`, configData);
  }
}

// 创建并导出服务实例
export const egressService = new EgressService();
export default EgressService; 