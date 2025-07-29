import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { createServiceConfig } from '@/shared/services/ServiceConfig';
import type { StandardApiResponse } from '@/shared/types/common';
import {
  IptablesChainType,
  IptablesTableType,
  IptablesProtocol,
} from '@/types/generated/model/iptables';
import type {
  IptablesConfig,
  IptablesServerConfig,
  IptablesGeneratedRule,
  IptablesScript,
  IptablesConfigInfo,
} from '@/types/generated/model/iptables';
import type {
  GetServerIptablesConfigsRequest,
  GetServerIptablesConfigsResponse,
  GetServerIptablesOverviewRequest,
  GetServerIptablesOverviewResponse,
  GetServerIptablesRulesRequest,
  GetServerIptablesRulesResponse,
  GetServerIptablesScriptRequest,
  GetServerIptablesScriptResponse,
  GetIptablesConfigRequest,
  GetIptablesConfigResponse,
  GetForwardPathRuleIptablesRequest,
  GetForwardPathRuleIptablesResponse,
  GetServerIptablesConfigRequest,
  GetServerIptablesConfigResponse,
} from '@/types/generated/api/iptables/iptables_config';

// 重新导出枚举类型
export { IptablesChainType, IptablesTableType, IptablesProtocol };

// 重新导出生成的类型，提供更简洁的导入路径
export type { 
  IptablesConfig, 
  IptablesServerConfig,
  IptablesGeneratedRule,
  IptablesScript,
  IptablesConfigInfo,
  GetServerIptablesConfigsRequest,
  GetServerIptablesConfigsResponse,
  GetServerIptablesOverviewRequest,
  GetServerIptablesOverviewResponse,
  GetServerIptablesRulesRequest,
  GetServerIptablesRulesResponse,
  GetServerIptablesScriptRequest,
  GetServerIptablesScriptResponse,
  GetIptablesConfigRequest,
  GetIptablesConfigResponse,
  GetForwardPathRuleIptablesRequest,
  GetForwardPathRuleIptablesResponse,
  GetServerIptablesConfigRequest,
  GetServerIptablesConfigResponse,
};
export type IptablesConfigListParams = GetServerIptablesConfigsRequest;

class IptablesService extends EnhancedBaseService {
  constructor() {
    super(createServiceConfig('iptables'));
  }

  // 获取服务器 iptables 配置列表 - 支持分页和过滤
  async getServerIptablesConfigs(
    serverId: string,
    params?: Omit<GetServerIptablesConfigsRequest, 'serverId'>
  ): Promise<StandardApiResponse<IptablesConfig[]>> {
    const queryParams: Record<string, string> = {};

    if (params?.tableType) queryParams.tableType = params.tableType;
    if (params?.chainType) queryParams.chainType = params.chainType;
    if (params?.protocol) queryParams.protocol = params.protocol;
    if (params?.isEnabled !== undefined) queryParams.isEnabled = params.isEnabled.toString();
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();

    return this.get<IptablesConfig[]>(`/v1/servers/${serverId}/iptables/configs`, queryParams);
  }

  // 获取单个 iptables 配置
  async getIptablesConfig(serverId: string, configId: number): Promise<StandardApiResponse<IptablesConfig>> {
    return this.get<IptablesConfig>(`/v1/servers/${serverId}/iptables/configs/${configId}`);
  }

  // 获取服务器 iptables 概览
  async getServerIptablesOverview(serverId: string): Promise<StandardApiResponse<IptablesServerConfig>> {
    return this.get<IptablesServerConfig>(`/v1/servers/${serverId}/iptables/overview`);
  }

  // 获取服务器 iptables 生成的规则
  async getServerIptablesRules(
    serverId: string,
    onlyEnabled?: boolean
  ): Promise<StandardApiResponse<GetServerIptablesRulesResponse>> {
    const queryParams: Record<string, string> = {};
    if (onlyEnabled !== undefined) queryParams.onlyEnabled = onlyEnabled.toString();

    return this.get<GetServerIptablesRulesResponse>(`/v1/servers/${serverId}/iptables/rules`, queryParams);
  }

  // 获取服务器 iptables 脚本
  async getServerIptablesScript(
    serverId: string,
    params?: { onlyEnabled?: boolean; format?: string }
  ): Promise<StandardApiResponse<IptablesScript>> {
    const queryParams: Record<string, string> = {};
    if (params?.onlyEnabled !== undefined) queryParams.onlyEnabled = params.onlyEnabled.toString();
    if (params?.format) queryParams.format = params.format;

    return this.get<IptablesScript>(`/v1/servers/${serverId}/iptables/script`, queryParams);
  }

  // 获取转发路径规则相关的 iptables 配置
  async getForwardPathRuleIptables(ruleId: string): Promise<StandardApiResponse<IptablesConfigInfo[]>> {
    return this.get<IptablesConfigInfo[]>(`/v1/forward-path-rules/${ruleId}/iptables`);
  }

  // 获取服务器 iptables 配置（简化版，用于转发路径规则接口）
  async getServerIptablesConfig(serverId: string): Promise<StandardApiResponse<IptablesConfigInfo[]>> {
    return this.get<IptablesConfigInfo[]>(`/v1/servers/${serverId}/iptables/config`);
  }
}

// 创建并导出服务实例
export const iptablesService = new IptablesService();

// 为了向后兼容，导出函数形式的接口
export const getServerIptablesConfigs = (serverId: string, params?: Omit<GetServerIptablesConfigsRequest, 'serverId'>) =>
  iptablesService.getServerIptablesConfigs(serverId, params);

export const getIptablesConfig = (serverId: string, configId: number) =>
  iptablesService.getIptablesConfig(serverId, configId);

export const getServerIptablesOverview = (serverId: string) =>
  iptablesService.getServerIptablesOverview(serverId);

export const getServerIptablesRules = (serverId: string, onlyEnabled?: boolean) =>
  iptablesService.getServerIptablesRules(serverId, onlyEnabled);

export const getServerIptablesScript = (serverId: string, params?: { onlyEnabled?: boolean; format?: string }) =>
  iptablesService.getServerIptablesScript(serverId, params);

export const getForwardPathRuleIptables = (ruleId: string) =>
  iptablesService.getForwardPathRuleIptables(ruleId);

export const getServerIptablesConfig = (serverId: string) =>
  iptablesService.getServerIptablesConfig(serverId);
