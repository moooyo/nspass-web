import { httpClient, ApiResponse } from '@/utils/http-client';

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
  async getForwardPathRule(id: number): Promise<ApiResponse<ForwardPathRule>> {
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
  async deleteForwardPathRule(id: number): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 启用转发路径规则
   */
  async enableForwardPathRule(id: number): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/enable`, {});
  }

  /**
   * 禁用转发路径规则
   */
  async disableForwardPathRule(id: number): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/disable`, {});
  }

  /**
   * 获取转发路径规则流量统计
   */
  async getForwardPathRuleTraffic(id: number, days: number = 7): Promise<ApiResponse<{
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
  async getForwardPathRuleIptables(id: number): Promise<ApiResponse<any[]>> {
    return httpClient.get(`${this.endpoint}/${id}/iptables`);
  }

  /**
   * 重建转发路径规则iptables配置
   */
  async rebuildForwardPathRuleIptables(ruleId: number, options: {
    forceRebuild?: boolean;
    backupExisting?: boolean;
  } = {}): Promise<ApiResponse<any>> {
    return httpClient.post(`${this.endpoint}/${ruleId}/iptables/rebuild`, options);
  }
}

// 创建并导出服务实例
export const forwardPathRulesService = new ForwardPathRulesService();
export default ForwardPathRulesService;
