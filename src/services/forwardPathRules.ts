import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { createServiceConfig } from '@/shared/services/ServiceConfig';
import type { StandardApiResponse } from '@/shared/types/common';

// 从生成的proto文件导入类型
import type {
  CreateForwardPathRuleRequest,
  UpdateForwardPathRuleRequest,
  GetForwardPathRulesRequest
} from '@/types/generated/api/forwardPath/forward_path_rule';

import type {
  ForwardPathRule,
  ForwardPathNode
} from '@/types/generated/model/forwardPath';

import {
  ForwardPathRuleType,
  ForwardPathRuleStatus
} from '@/types/generated/model/forwardPath';

// 重新导出类型和枚举以保持兼容性
export type {
  ForwardPathRule,
  ForwardPathNode,
  CreateForwardPathRuleRequest,
  UpdateForwardPathRuleRequest,
  GetForwardPathRulesRequest
};

export {
  ForwardPathRuleType,
  ForwardPathRuleStatus
};

class ForwardPathRulesService extends EnhancedBaseService {
  private readonly endpoint = '/v1/forward-path-rules';

  constructor() {
    super(createServiceConfig('forwardPathRules'));
  }

  /**
   * 获取转发路径规则列表
   */
  async getForwardPathRules(params: GetForwardPathRulesRequest = {}): Promise<StandardApiResponse<ForwardPathRule[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.status) queryParams.status = params.status;

    return this.get<ForwardPathRule[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新的转发路径规则
   */
  async createForwardPathRule(request: CreateForwardPathRuleRequest): Promise<StandardApiResponse<ForwardPathRule>> {
    return this.post<ForwardPathRule>(this.endpoint, request);
  }

  /**
   * 获取单个转发路径规则
   */
  async getForwardPathRule(id: number): Promise<StandardApiResponse<ForwardPathRule>> {
    return this.get<ForwardPathRule>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新转发路径规则
   */
  async updateForwardPathRule(request: UpdateForwardPathRuleRequest): Promise<StandardApiResponse<ForwardPathRule>> {
    const { id, ...updateData } = request;
    return this.put<ForwardPathRule>(`${this.endpoint}/${id}`, updateData);
  }

  /**
   * 删除转发路径规则
   */
  async deleteForwardPathRule(id: number): Promise<StandardApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 启用转发路径规则
   */
  async enableForwardPathRule(id: number): Promise<StandardApiResponse<void>> {
    return this.post<void>(`${this.endpoint}/${id}/enable`, {});
  }

  /**
   * 禁用转发路径规则
   */
  async disableForwardPathRule(id: number): Promise<StandardApiResponse<void>> {
    return this.post<void>(`${this.endpoint}/${id}/disable`, {});
  }

  /**
   * 获取转发路径规则流量统计
   */
  async getForwardPathRuleTraffic(id: number, days: number = 7): Promise<StandardApiResponse<{
    totalUpload: string;
    totalDownload: string;
    dailyStats: Array<{
      date: string;
      upload: string;
      download: string;
    }>;
  }>> {
    const queryParams = { days: days.toString() };
    return this.get(`${this.endpoint}/${id}/traffic`, queryParams);
  }

  /**
   * 获取转发路径规则iptables配置
   */
  async getForwardPathRuleIptables(id: number): Promise<StandardApiResponse<any[]>> {
    return this.get(`${this.endpoint}/${id}/iptables`);
  }

  /**
   * 重建转发路径规则iptables配置
   */
  async rebuildForwardPathRuleIptables(ruleId: number, options: {
    forceRebuild?: boolean;
    backupExisting?: boolean;
  } = {}): Promise<StandardApiResponse<any>> {
    return this.post(`${this.endpoint}/${ruleId}/iptables/rebuild`, options);
  }
}

// 创建并导出服务实例
export const forwardPathRulesService = new ForwardPathRulesService();
export default ForwardPathRulesService;
