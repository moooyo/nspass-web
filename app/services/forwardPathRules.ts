import { httpClient, ApiResponse } from '@/utils/http-client';

// 转发路径规则类型（基于proto定义）
export interface ForwardPathRule {
  id?: string;
  userId?: number;
  name: string;
  type: ForwardPathRuleType;
  status: ForwardPathRuleStatus;
  path: ForwardPathNode[];
  egressServerId: string;
  egressServerName?: string;
  trafficUp?: string;
  trafficDown?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 转发路径节点
export interface ForwardPathNode {
  serverId: string;
  serverName?: string;
  port?: number;
  order?: number;
}

// 转发类型枚举
export enum ForwardPathRuleType {
  UNSPECIFIED = 'FORWARD_PATH_RULE_TYPE_UNSPECIFIED',
  HTTP = 'FORWARD_PATH_RULE_TYPE_HTTP',
  SOCKS5 = 'FORWARD_PATH_RULE_TYPE_SOCKS5',
  SHADOWSOCKS = 'FORWARD_PATH_RULE_TYPE_SHADOWSOCKS',
  TROJAN = 'FORWARD_PATH_RULE_TYPE_TROJAN'
}

// 规则状态枚举
export enum ForwardPathRuleStatus {
  UNSPECIFIED = 'FORWARD_PATH_RULE_STATUS_UNSPECIFIED',
  ACTIVE = 'FORWARD_PATH_RULE_STATUS_ACTIVE',
  INACTIVE = 'FORWARD_PATH_RULE_STATUS_INACTIVE',
  ERROR = 'FORWARD_PATH_RULE_STATUS_ERROR'
}

// 创建转发路径规则请求
export interface CreateForwardPathRuleRequest {
  name: string;
  type: ForwardPathRuleType;
  pathServerIds: string[];
  egressServerId: string;
}

// 获取转发路径规则列表请求
export interface GetForwardPathRulesRequest {
  page?: number;
  pageSize?: number;
  status?: ForwardPathRuleStatus;
}

// 更新转发路径规则请求
export interface UpdateForwardPathRuleRequest {
  id: string;
  name?: string;
  type?: ForwardPathRuleType;
  status?: ForwardPathRuleStatus;
  pathServerIds?: string[];
  egressServerId?: string;
}

class ForwardPathRulesService {
  private readonly endpoint = '/v1/forward-path-rules';

  /**
   * 获取转发路径规则列表
   */
  async getForwardPathRules(params: GetForwardPathRulesRequest = {}): Promise<ApiResponse<{
    rules: ForwardPathRule[];
    total: number;
    page: number;
    pageSize: number;
  }>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.status) queryParams.status = params.status;

    return httpClient.get<{
      rules: ForwardPathRule[];
      total: number;
      page: number;
      pageSize: number;
    }>(this.endpoint, queryParams);
  }

  /**
   * 创建新的转发路径规则
   */
  async createForwardPathRule(request: CreateForwardPathRuleRequest): Promise<ApiResponse<ForwardPathRule>> {
    return httpClient.post<ForwardPathRule>(this.endpoint, request);
  }

  /**
   * 获取单个转发路径规则
   */
  async getForwardPathRule(id: string): Promise<ApiResponse<ForwardPathRule>> {
    return httpClient.get<ForwardPathRule>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新转发路径规则
   */
  async updateForwardPathRule(request: UpdateForwardPathRuleRequest): Promise<ApiResponse<ForwardPathRule>> {
    const { id, ...updateData } = request;
    return httpClient.put<ForwardPathRule>(`${this.endpoint}/${id}`, updateData);
  }

  /**
   * 删除转发路径规则
   */
  async deleteForwardPathRule(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 启用转发路径规则
   */
  async enableForwardPathRule(id: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/enable`, {});
  }

  /**
   * 禁用转发路径规则
   */
  async disableForwardPathRule(id: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/disable`, {});
  }

  /**
   * 获取转发路径规则流量统计
   */
  async getForwardPathRuleTraffic(id: string, days: number = 7): Promise<ApiResponse<{
    totalUpload: string;
    totalDownload: string;
    dailyStats: Array<{
      date: string;
      upload: string;
      download: string;
    }>;
  }>> {
    const queryParams = { days: days.toString() };
    return httpClient.get(`${this.endpoint}/${id}/traffic`, queryParams);
  }

  /**
   * 获取转发路径规则iptables配置
   */
  async getForwardPathRuleIptables(id: string): Promise<ApiResponse<any[]>> {
    return httpClient.get(`${this.endpoint}/${id}/iptables`);
  }

  /**
   * 重建转发路径规则iptables配置
   */
  async rebuildForwardPathRuleIptables(ruleId: string, options: {
    forceRebuild?: boolean;
    backupExisting?: boolean;
  } = {}): Promise<ApiResponse<any>> {
    return httpClient.post(`${this.endpoint}/${ruleId}/iptables/rebuild`, options);
  }
}

// 创建并导出服务实例
export const forwardPathRulesService = new ForwardPathRulesService();
export default ForwardPathRulesService;
