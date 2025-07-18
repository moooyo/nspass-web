import { httpClient, ApiResponse } from '@/utils/http-client';
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
  ValidateServerIptablesRequest,
  ValidateServerIptablesResponse,
  CleanupServerIptablesRequest,
  CleanupServerIptablesResponse,
  GetForwardPathRuleIptablesRequest,
  GetForwardPathRuleIptablesResponse,
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
  ValidateServerIptablesRequest,
  ValidateServerIptablesResponse,
  CleanupServerIptablesRequest,
  CleanupServerIptablesResponse,
  GetForwardPathRuleIptablesRequest,
  GetForwardPathRuleIptablesResponse,
};
export type IptablesConfigListParams = GetServerIptablesConfigsRequest;

// 获取服务器 iptables 配置列表 - 支持分页和过滤
export const getServerIptablesConfigs = async (
  serverId: string,
  params?: GetServerIptablesConfigsRequest
): Promise<ApiResponse<IptablesConfig[]>> => {
  const queryParams: Record<string, string> = {};
  
  if (params?.tableType) queryParams.tableType = params.tableType;
  if (params?.chainType) queryParams.chainType = params.chainType;
  if (params?.protocol) queryParams.protocol = params.protocol;
  if (params?.isEnabled !== undefined) queryParams.isEnabled = params.isEnabled.toString();
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();
  
  return httpClient.get<IptablesConfig[]>(`/v1/servers/${serverId}/iptables/configs`, queryParams);
};

// 获取单个 iptables 配置
export const getIptablesConfig = async (serverId: string, configName: string): Promise<ApiResponse<GetIptablesConfigResponse>> => {
  return httpClient.get<GetIptablesConfigResponse>(`/v1/servers/${serverId}/iptables/configs/${configName}`);
};

// 获取服务器 iptables 概览
export const getServerIptablesOverview = async (serverId: string): Promise<ApiResponse<GetServerIptablesOverviewResponse>> => {
  return httpClient.get<GetServerIptablesOverviewResponse>(`/v1/servers/${serverId}/iptables/overview`);
};

// 获取服务器 iptables 生成的规则
export const getServerIptablesRules = async (serverId: string, onlyEnabled?: boolean): Promise<ApiResponse<GetServerIptablesRulesResponse>> => {
  const queryParams: Record<string, string> = {};
  if (onlyEnabled !== undefined) queryParams.onlyEnabled = onlyEnabled.toString();
  
  return httpClient.get<GetServerIptablesRulesResponse>(`/v1/servers/${serverId}/iptables/rules`, queryParams);
};

// 获取服务器 iptables 脚本
export const getServerIptablesScript = async (
  serverId: string, 
  params?: { onlyEnabled?: boolean; format?: string }
): Promise<ApiResponse<GetServerIptablesScriptResponse>> => {
  const queryParams: Record<string, string> = {};
  if (params?.onlyEnabled !== undefined) queryParams.onlyEnabled = params.onlyEnabled.toString();
  if (params?.format) queryParams.format = params.format;
  
  return httpClient.get<GetServerIptablesScriptResponse>(`/v1/servers/${serverId}/iptables/script`, queryParams);
};

// 获取转发路径规则相关的 iptables 配置（保留旧的API用于兼容性）
export const getForwardPathRuleIptables = async (ruleId: string): Promise<ApiResponse<IptablesConfigInfo[]>> => {
  return httpClient.get<IptablesConfigInfo[]>(`/v1/forward-path-rules/${ruleId}/iptables`);
};
