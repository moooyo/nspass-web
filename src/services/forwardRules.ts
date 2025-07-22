import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  ForwardRule,
  RuleStatus,
  RuleTrafficStats,
  GetRulesRequest,
  CreateRuleRequest,
  GetRuleRequest,
  UpdateRuleRequest,
  DeleteRuleRequest,
  BatchDeleteRulesRequest,
  ToggleRuleRequest,
  GetRuleTrafficStatsRequest,
  ForwardRuleType,
  EgressMode,
} from '@/types/generated/api/rules/rule_management';

// 重新导出枚举类型
export { ForwardRuleType, EgressMode, RuleStatus };

// 入口类型 - 保持向后兼容的自定义类型
export type EntryType = 'HTTP' | 'SOCKS5' | 'SHADOWSOCKS' | 'TROJAN';

// 出口类型 - 保持向后兼容的自定义类型
export type ExitType = 'DIRECT' | 'PROXY' | 'REJECT';

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

// 转发规则数据类型定义（使用生成的类型）
export interface ForwardRuleItem extends ForwardRule {
  // 保持向后兼容性的额外字段
  ruleId?: string;
  entryType?: EntryType;
  entryConfig?: string;
  trafficUsed?: number; // MB
  exitType?: ExitType;
  exitConfig?: string;
  viaNodes?: string[]; // 途径节点数组
}

// 重新导出生成的类型，提供更简洁的导入路径
export type CreateForwardRuleData = CreateRuleRequest;
export type UpdateForwardRuleData = UpdateRuleRequest;
export type ForwardRuleListParams = GetRulesRequest;
export type { RuleTrafficStats };

class ForwardRulesService {
  private readonly endpoint = '/v1/forward-path-rules';

  /**
   * 获取转发规则列表
   */
  async getRules(params: GetRulesRequest = {}): Promise<ApiResponse<{data: ForwardRule[], total: number, page: number, pageSize: number}>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.name) queryParams.name = params.name;
    if (params.status) queryParams.status = params.status.toString();

    return httpClient.get<{
      data: ForwardRule[];
      total: number;
      page: number;
      pageSize: number;
    }>(this.endpoint, queryParams);
  }

  /**
   * 创建新转发规则
   */
  async createRule(ruleData: CreateRuleRequest): Promise<ApiResponse<ForwardRule>> {
    return httpClient.post<ForwardRule>(this.endpoint, ruleData);
  }

  /**
   * 获取转发规则详情
   */
  async getRule(request: GetRuleRequest): Promise<ApiResponse<ForwardRule>> {
    return httpClient.get<ForwardRule>(`${this.endpoint}/${request.id}`);
  }

  /**
   * 更新转发规则信息
   */
  async updateRule(request: UpdateRuleRequest): Promise<ApiResponse<ForwardRule>> {
    const { id, ...updateData } = request;
    return httpClient.put<ForwardRule>(`${this.endpoint}/${id}`, updateData);
  }

  /**
   * 删除转发规则
   */
  async deleteRule(request: DeleteRuleRequest): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${request.id}`);
  }

  /**
   * 批量删除转发规则
   */
  async batchDeleteRules(request: BatchDeleteRulesRequest): Promise<ApiResponse<{ deletedCount: number }>> {
    return httpClient.post<{ deletedCount: number }>(`${this.endpoint}/batch-delete`, { ids: request.ids });
  }

  /**
   * 启用/禁用转发规则
   */
  async toggleRule(request: ToggleRuleRequest): Promise<ApiResponse<ForwardRule>> {
    return httpClient.post<ForwardRule>(`${this.endpoint}/${request.id}/toggle`, { enabled: request.enabled });
  }

  /**
   * 获取规则流量统计
   */
  async getRuleTrafficStats(request: GetRuleTrafficStatsRequest): Promise<ApiResponse<RuleTrafficStats>> {
    const queryParams: Record<string, string> = {};
    if (request.days) queryParams.days = request.days.toString();

    return httpClient.get<RuleTrafficStats>(`${this.endpoint}/${request.id}/traffic-stats`, queryParams);
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