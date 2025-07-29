import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { createServiceConfig } from '@/shared/services/ServiceConfig';
import type { StandardApiResponse } from '@/shared/types/common';
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

class ForwardRulesService extends EnhancedBaseService {
  constructor() {
    super(createServiceConfig('ForwardRulesService'));
  }
  private readonly endpoint = '/v1/forward-path-rules';

  /**
   * 获取转发规则列表
   */
  async getRules(params: GetRulesRequest = {}): Promise<StandardApiResponse<{data: ForwardRule[], total: number, page: number, pageSize: number}>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.name) queryParams.name = params.name;
    if (params.status) queryParams.status = params.status.toString();

    return this.get<{
      data: ForwardRule[];
      total: number;
      page: number;
      pageSize: number;
    }>(this.endpoint, queryParams);
  }

  /**
   * 创建新转发规则
   */
  async createRule(ruleData: CreateRuleRequest): Promise<StandardApiResponse<ForwardRule>> {
    return this.post<ForwardRule>(this.endpoint, ruleData);
  }

  /**
   * 获取转发规则详情
   */
  async getRule(request: GetRuleRequest): Promise<StandardApiResponse<ForwardRule>> {
    return this.get<ForwardRule>(`${this.endpoint}/${request.id}`);
  }

  /**
   * 更新转发规则信息
   */
  async updateRule(request: UpdateRuleRequest): Promise<StandardApiResponse<ForwardRule>> {
    const { id, ...updateData } = request;
    return this.put<ForwardRule>(`${this.endpoint}/${id}`, updateData);
  }

  /**
   * 删除转发规则
   */
  async deleteRule(request: DeleteRuleRequest): Promise<StandardApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${request.id}`);
  }

  /**
   * 批量删除转发规则
   */
  async batchDeleteRules(request: BatchDeleteRulesRequest): Promise<StandardApiResponse<{ deletedCount: number }>> {
    return this.post<{ deletedCount: number }>(`${this.endpoint}/batch-delete`, { ids: request.ids });
  }

  /**
   * 启用/禁用转发规则
   */
  async toggleRule(request: ToggleRuleRequest): Promise<StandardApiResponse<ForwardRule>> {
    return this.post<ForwardRule>(`${this.endpoint}/${request.id}/toggle`, { enabled: request.enabled });
  }

  /**
   * 获取规则流量统计
   */
  async getRuleTrafficStats(request: GetRuleTrafficStatsRequest): Promise<StandardApiResponse<RuleTrafficStats>> {
    const queryParams: Record<string, string> = {};
    if (request.days) queryParams.days = request.days.toString();

    return this.get<RuleTrafficStats>(`${this.endpoint}/${request.id}/traffic-stats`, queryParams);
  }

  /**
   * 获取可用服务器列表
   */
  async getAvailableServers(): Promise<StandardApiResponse<ServerItem[]>> {
    return this.get<ServerItem[]>(`${this.endpoint}/servers`);
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
  }): Promise<StandardApiResponse<ForwardRuleItem>> {
    return this.post<ForwardRuleItem>(`${this.endpoint}/create-with-path`, data);
  }

  /**
   * 验证规则配置
   */
  async validateRuleConfig(ruleData: CreateForwardRuleData): Promise<StandardApiResponse<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  }>> {
    return this.post<{ valid: boolean; errors?: string[]; warnings?: string[] }>(`${this.endpoint}/validate`, ruleData);
  }

  /**
   * 获取规则性能建议
   */
  async getRuleOptimizationSuggestions(id: React.Key): Promise<StandardApiResponse<{
    suggestions: {
      type: 'performance' | 'security' | 'reliability';
      message: string;
      action?: string;
    }[];
  }>> {
    return this.get(`${this.endpoint}/${id}/optimize`);
  }

  /**
   * 批量更新规则状态
   */
  async batchUpdateRuleStatus(ids: React.Key[], status: RuleStatus): Promise<StandardApiResponse<ForwardRuleItem[]>> {
    return this.put<ForwardRuleItem[]>(`${this.endpoint}/batch-status`, { ids, status });
  }
}

// 创建并导出服务实例
export const forwardRulesService = new ForwardRulesService();
export default ForwardRulesService; 