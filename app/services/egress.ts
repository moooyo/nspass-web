import { httpClient, ApiResponse } from '@/utils/http-client';

// 出口模式类型
export type EgressMode = 'direct' | 'iptables' | 'ss2022';

// 转发类型
export type ForwardType = 'tcp' | 'udp' | 'all';

// 出口数据类型定义
export interface EgressItem {
  id: React.Key;
  egressId: string;
  serverId: string;
  egressMode: EgressMode;
  egressConfig: string;
  
  // 直出模式字段
  targetAddress?: string;
  
  // iptables模式字段
  forwardType?: ForwardType;
  destAddress?: string;
  destPort?: string;
  
  // shadowsocks-2022模式字段
  password?: string;
  supportUdp?: boolean;
}

// 创建出口数据类型
export type CreateEgressData = Omit<EgressItem, 'id'>;

// 查询参数类型
export interface EgressListParams {
  page?: number;
  pageSize?: number;
  egressId?: string;
  serverId?: string;
  egressMode?: EgressMode;
}

// 更新出口数据类型
export type UpdateEgressData = Partial<Omit<EgressItem, 'id'>>;

class EgressService {
  private readonly endpoint = '/v1/egress';

  /**
   * 获取出口列表
   */
  async getEgressList(params: EgressListParams = {}): Promise<ApiResponse<EgressItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.egressId) queryParams.egressId = params.egressId;
    if (params.serverId) queryParams.serverId = params.serverId;
    if (params.egressMode) queryParams.egressMode = params.egressMode;

    return httpClient.get<EgressItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新出口
   */
  async createEgress(egressData: CreateEgressData): Promise<ApiResponse<EgressItem>> {
    return httpClient.post<EgressItem>(this.endpoint, egressData);
  }

  /**
   * 获取出口详情
   */
  async getEgressById(id: React.Key): Promise<ApiResponse<EgressItem>> {
    return httpClient.get<EgressItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新出口信息
   */
  async updateEgress(id: React.Key, egressData: UpdateEgressData): Promise<ApiResponse<EgressItem>> {
    return httpClient.put<EgressItem>(`${this.endpoint}/${id}`, egressData);
  }

  /**
   * 删除出口
   */
  async deleteEgress(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量删除出口
   */
  async batchDeleteEgress(ids: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids });
  }

  /**
   * 测试出口连接
   */
  async testEgressConnection(id: React.Key): Promise<ApiResponse<{
    success: boolean;
    latency: number;
    error?: string;
  }>> {
    return httpClient.post(`${this.endpoint}/${id}/test`);
  }

  /**
   * 获取出口统计信息
   */
  async getEgressStats(id: React.Key): Promise<ApiResponse<{
    connectionsCount: number;
    bytesTransferred: number;
    lastActivity: string;
  }>> {
    return httpClient.get(`${this.endpoint}/${id}/stats`);
  }

  /**
   * 获取可用服务器列表
   */
  async getAvailableServers(): Promise<ApiResponse<{ label: string; value: string }[]>> {
    return httpClient.get<{ label: string; value: string }[]>(`${this.endpoint}/servers`);
  }

  /**
   * 验证出口配置
   */
  async validateEgressConfig(egressData: CreateEgressData): Promise<ApiResponse<{
    valid: boolean;
    errors?: string[];
  }>> {
    return httpClient.post<{ valid: boolean; errors?: string[] }>(`${this.endpoint}/validate`, egressData);
  }
}

// 创建并导出服务实例
export const egressService = new EgressService();
export default EgressService; 