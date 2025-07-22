import { httpClient, ApiResponse } from '@/utils/http-client';
// 使用 generated 类型定义
import type { EgressItem } from '@/types/generated/model/egressItem';
import { EgressMode, ForwardType } from '@/types/generated/model/egress';
import type {
  CreateEgressRequest,
  UpdateEgressRequest,
  GetEgressListRequest,
  TestEgressConnectionRequest,
  ValidateEgressConfigRequest,
  AvailableServerItem
} from '@/types/generated/api/egress/egress_management';

// 重新导出枚举类型，以便其他模块可以使用
export { EgressMode, ForwardType };

// 重新导出生成的类型，提供更简洁的导入路径
export type { EgressItem };
export type CreateEgressData = CreateEgressRequest;
export type UpdateEgressData = UpdateEgressRequest;
export type EgressListParams = GetEgressListRequest;
export type TestEgressConnectionData = TestEgressConnectionRequest;
export type ValidateEgressConfigData = ValidateEgressConfigRequest;

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
  async getAvailableServers(): Promise<ApiResponse<AvailableServerItem[]>> {
    return httpClient.get<AvailableServerItem[]>(`${this.endpoint}/available-servers`);
  }

  /**
   * 验证出口配置 - 匹配swagger接口 POST /v1/egress/validate-config
   */
  async validateEgressConfig(configData: ValidateEgressConfigData): Promise<ApiResponse<{
    valid: boolean;
    errors?: string[];
  }>> {
    return httpClient.post<{ valid: boolean; errors?: string[] }>(`${this.endpoint}/validate-config`, configData);
  }
}

// 创建并导出服务实例
export const egressService = new EgressService();
export default EgressService; 