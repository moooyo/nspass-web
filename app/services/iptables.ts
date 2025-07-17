import { httpClient, ApiResponse } from '@/utils/http-client';
import {
  IptablesChainType,
  IptablesTableType,
  IptablesProtocol,
  IptablesRebuildStatus,
} from '@/types/generated/model/iptables';
import type {
  IptablesConfig,
  IptablesRebuildTask,
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
  RebuildServerIptablesRequest,
  RebuildServerIptablesResponse,
  GetRebuildTaskStatusRequest,
  GetRebuildTaskStatusResponse,
  BatchRebuildServersIptablesRequest,
  BatchRebuildServersIptablesResponse,
  ValidateServerIptablesRequest,
  ValidateServerIptablesResponse,
  CleanupServerIptablesRequest,
  CleanupServerIptablesResponse,
  GetForwardPathRuleIptablesRequest,
  GetForwardPathRuleIptablesResponse,
  RebuildForwardPathRuleIptablesRequest,
  RebuildForwardPathRuleIptablesResponse,
} from '@/types/generated/api/iptables/iptables_config';

// 重新导出枚举类型
export { IptablesChainType, IptablesTableType, IptablesProtocol, IptablesRebuildStatus };

// 重新导出生成的类型，提供更简洁的导入路径
export type { 
  IptablesConfig, 
  IptablesRebuildTask,
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
  RebuildServerIptablesRequest,
  RebuildServerIptablesResponse,
  GetRebuildTaskStatusRequest,
  GetRebuildTaskStatusResponse,
  BatchRebuildServersIptablesRequest,
  BatchRebuildServersIptablesResponse,
  ValidateServerIptablesRequest,
  ValidateServerIptablesResponse,
  CleanupServerIptablesRequest,
  CleanupServerIptablesResponse,
  GetForwardPathRuleIptablesRequest,
  GetForwardPathRuleIptablesResponse,
  RebuildForwardPathRuleIptablesRequest,
  RebuildForwardPathRuleIptablesResponse,
};
export type IptablesConfigListParams = GetServerIptablesConfigsRequest;

// 获取服务器 iptables 配置列表 - 支持分页和过滤
export const getServerIptablesConfigs = async (
  serverId: string,
  params?: GetServerIptablesConfigsRequest
): Promise<ApiResponse<GetServerIptablesConfigsResponse>> => {
  const queryParams: Record<string, string> = {};
  
  if (params?.tableType) queryParams.tableType = params.tableType;
  if (params?.chainType) queryParams.chainType = params.chainType;
  if (params?.protocol) queryParams.protocol = params.protocol;
  if (params?.isEnabled !== undefined) queryParams.isEnabled = params.isEnabled.toString();
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();
  
  return httpClient.get<GetServerIptablesConfigsResponse>(`/v1/servers/${serverId}/iptables/configs`, queryParams);
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

// 重建服务器 iptables 配置
export const rebuildServerIptables = async (
  serverId: string, 
  options?: RebuildServerIptablesRequest
): Promise<ApiResponse<RebuildServerIptablesResponse>> => {
  return httpClient.post<RebuildServerIptablesResponse>(`/v1/servers/${serverId}/iptables/rebuild`, options || {});
};

// 批量重建多个服务器 iptables 配置
export const batchRebuildServersIptables = async (
  request: BatchRebuildServersIptablesRequest
): Promise<ApiResponse<BatchRebuildServersIptablesResponse>> => {
  return httpClient.post<BatchRebuildServersIptablesResponse>('/v1/iptables/batch-rebuild', request);
};

// 获取重建任务状态
export const getRebuildTaskStatus = async (
  taskId: string
): Promise<ApiResponse<GetRebuildTaskStatusResponse>> => {
  return httpClient.get<GetRebuildTaskStatusResponse>(`/v1/iptables/rebuild-tasks/${taskId}`);
};

// 清理服务器 iptables 配置
export const cleanupServerIptables = async (
  serverId: string,
  request?: CleanupServerIptablesRequest
): Promise<ApiResponse<CleanupServerIptablesResponse>> => {
  return httpClient.post<CleanupServerIptablesResponse>(`/v1/servers/${serverId}/iptables/cleanup`, request || {});
};

// 验证服务器 iptables 配置
export const validateServerIptables = async (
  serverId: string,
  request?: ValidateServerIptablesRequest
): Promise<ApiResponse<ValidateServerIptablesResponse>> => {
  return httpClient.post<ValidateServerIptablesResponse>(`/v1/servers/${serverId}/iptables/validate`, request || {});
};

// 获取转发路径规则相关的 iptables 配置（保留旧的API用于兼容性）
export const getForwardPathRuleIptables = async (ruleId: string): Promise<ApiResponse<IptablesConfigInfo[]>> => {
  return httpClient.get<IptablesConfigInfo[]>(`/v1/forward-path-rules/${ruleId}/iptables`);
};

// 重建转发路径规则 iptables 配置
export const rebuildForwardPathRuleIptables = async (ruleId: string, options?: RebuildForwardPathRuleIptablesRequest): Promise<ApiResponse<RebuildForwardPathRuleIptablesResponse>> => {
  return httpClient.post<RebuildForwardPathRuleIptablesResponse>(`/v1/forward-path-rules/${ruleId}/iptables/rebuild`, options || {});
};

// 获取 iptables 重建状态的中文描述
export const getIptablesRebuildStatusText = (status: IptablesRebuildStatus | undefined): string => {
  if (!status) return '未知状态';
  
  switch (status) {
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_PENDING:
      return '等待中';
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_RUNNING:
      return '执行中';
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_SUCCESS:
      return '成功';
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_FAILED:
      return '失败';
    default:
      return '未知状态';
  }
};

// 获取 iptables 重建状态的颜色
export const getIptablesRebuildStatusColor = (status: IptablesRebuildStatus | undefined): string => {
  if (!status) return 'default';
  
  switch (status) {
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_PENDING:
      return 'default';
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_RUNNING:
      return 'processing';
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_SUCCESS:
      return 'success';
    case IptablesRebuildStatus.IPTABLES_REBUILD_STATUS_FAILED:
      return 'error';
    default:
      return 'default';
  }
};
