import { httpClient, ApiResponse } from '@/utils/http-client';

// 入口类型
export type EntryType = 'HTTP' | 'SOCKS5' | 'SHADOWSOCKS' | 'TROJAN';

// 出口类型
export type ExitType = 'DIRECT' | 'PROXY' | 'REJECT';

// 规则状态
export type RuleStatus = 'ACTIVE' | 'PAUSED' | 'ERROR';

// 服务器类型
export type ServerType = 'NORMAL' | 'EXIT';

// 服务器项数据类型
export interface ServerItem {
  id: string;
  name: string;
  type: ServerType;
  ip: string;
  location: {
    country: string;
    latitude: number;
    longitude: number;
    x: number;
    y: number;
  };
}

// 转发规则数据类型定义
export interface ForwardRuleItem {
  id: React.Key;
  ruleId: string;
  entryType: EntryType;
  entryConfig: string;
  trafficUsed: number; // MB
  exitType: ExitType;
  exitConfig: string;
  status: RuleStatus;
  viaNodes: string[]; // 途径节点数组
}

// 创建转发规则数据类型
export interface CreateForwardRuleData {
  ruleId?: string;
  entryType: EntryType;
  entryConfig: string;
  exitType: ExitType;
  exitConfig: string;
  status?: RuleStatus;
  viaNodes?: string[];
}

// 查询参数类型
export interface ForwardRuleListParams {
  page?: number;
  pageSize?: number;
  ruleId?: string;
  entryType?: EntryType;
  exitType?: ExitType;
  status?: RuleStatus;
}

// 更新转发规则数据类型
export type UpdateForwardRuleData = Partial<Omit<ForwardRuleItem, 'id'>>;

class ForwardRulesService {
  private readonly endpoint = '/forward-rules';

  /**
   * 获取转发规则列表
   */
  async getForwardRules(params: ForwardRuleListParams = {}): Promise<ApiResponse<ForwardRuleItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.ruleId) queryParams.ruleId = params.ruleId;
    if (params.entryType) queryParams.entryType = params.entryType;
    if (params.exitType) queryParams.exitType = params.exitType;
    if (params.status) queryParams.status = params.status;

    return httpClient.get<ForwardRuleItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新转发规则
   */
  async createForwardRule(ruleData: CreateForwardRuleData): Promise<ApiResponse<ForwardRuleItem>> {
    return httpClient.post<ForwardRuleItem>(this.endpoint, ruleData);
  }

  /**
   * 获取转发规则详情
   */
  async getForwardRuleById(id: React.Key): Promise<ApiResponse<ForwardRuleItem>> {
    return httpClient.get<ForwardRuleItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新转发规则信息
   */
  async updateForwardRule(id: React.Key, ruleData: UpdateForwardRuleData): Promise<ApiResponse<ForwardRuleItem>> {
    return httpClient.put<ForwardRuleItem>(`${this.endpoint}/${id}`, ruleData);
  }

  /**
   * 删除转发规则
   */
  async deleteForwardRule(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量删除转发规则
   */
  async batchDeleteForwardRules(ids: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids });
  }

  /**
   * 暂停/启动转发规则
   */
  async toggleRuleStatus(id: React.Key, status: RuleStatus): Promise<ApiResponse<ForwardRuleItem>> {
    return httpClient.put<ForwardRuleItem>(`${this.endpoint}/${id}/status`, { status });
  }

  /**
   * 复制转发规则
   */
  async copyForwardRule(id: React.Key): Promise<ApiResponse<ForwardRuleItem>> {
    return httpClient.post<ForwardRuleItem>(`${this.endpoint}/${id}/copy`);
  }

  /**
   * 诊断转发规则
   */
  async diagnoseRule(id: React.Key): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details: {
      entryConnectionTest: boolean;
      exitConnectionTest: boolean;
      latency: number;
      throughput: number;
    };
  }>> {
    return httpClient.post(`${this.endpoint}/${id}/diagnose`);
  }

  /**
   * 获取转发规则统计信息
   */
  async getRuleStats(id: React.Key): Promise<ApiResponse<{
    totalConnections: number;
    activeConnections: number;
    bytesTransferred: number;
    latency: number;
    throughput: number;
  }>> {
    return httpClient.get(`${this.endpoint}/${id}/stats`);
  }

  /**
   * 获取可用服务器列表
   */
  async getAvailableServers(): Promise<ApiResponse<ServerItem[]>> {
    return httpClient.get<ServerItem[]>(`${this.endpoint}/servers`);
  }

  /**
   * 创建带路径配置的转发规则
   */
  async createRuleWithPath(data: {
    ruleId?: string;
    entryType: EntryType;
    entryConfig: string;
    viaNodes: string[];
    exitServerId: string;
  }): Promise<ApiResponse<ForwardRuleItem>> {
    return httpClient.post<ForwardRuleItem>(`${this.endpoint}/create-with-path`, data);
  }

  /**
   * 验证规则配置
   */
  async validateRuleConfig(ruleData: CreateForwardRuleData): Promise<ApiResponse<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  }>> {
    return httpClient.post<{ valid: boolean; errors?: string[]; warnings?: string[] }>(`${this.endpoint}/validate`, ruleData);
  }

  /**
   * 获取规则性能建议
   */
  async getRuleOptimizationSuggestions(id: React.Key): Promise<ApiResponse<{
    suggestions: {
      type: 'performance' | 'security' | 'reliability';
      message: string;
      action?: string;
    }[];
  }>> {
    return httpClient.get(`${this.endpoint}/${id}/optimize`);
  }

  /**
   * 批量更新规则状态
   */
  async batchUpdateRuleStatus(ids: React.Key[], status: RuleStatus): Promise<ApiResponse<ForwardRuleItem[]>> {
    return httpClient.put<ForwardRuleItem[]>(`${this.endpoint}/batch-status`, { ids, status });
  }
}

// 创建并导出服务实例
export const forwardRulesService = new ForwardRulesService();
export default ForwardRulesService; 