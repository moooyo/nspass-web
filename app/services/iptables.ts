import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  IptablesConfig,
  IptablesRebuildTask,
  IptablesChainType,
  IptablesTableType,
  IptablesProtocol,
} from '@/types/generated/model/iptables';
import type {
  GetServerIptablesConfigsRequest,
  GetServerIptablesConfigsResponse,
  GetServerIptablesOverviewRequest,
  GetServerIptablesRulesRequest,
  GetServerIptablesScriptRequest,
} from '@/types/generated/api/iptables/iptables_config';

// 重新导出枚举类型
export { IptablesChainType, IptablesTableType, IptablesProtocol };

// 重新导出生成的类型，提供更简洁的导入路径
export type { IptablesConfig, IptablesRebuildTask };
export type IptablesConfigListParams = GetServerIptablesConfigsRequest;

export interface RebuildServerIptablesResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: IptablesRebuildTask;
}

// 获取服务器 iptables 配置列表 - 支持分页和过滤
export const getServerIptablesConfigs = async (
  serverId: string,
  params?: {
    tableType?: string;
    chainType?: string;
    protocol?: string;
    isEnabled?: boolean;
    page?: number;
    pageSize?: number;
  }
): Promise<ApiResponse<GetServerIptablesConfigsResponse>> => {
  const queryParams = new URLSearchParams();
  if (params?.tableType) queryParams.append('tableType', params.tableType);
  if (params?.chainType) queryParams.append('chainType', params.chainType);
  if (params?.protocol) queryParams.append('protocol', params.protocol);
  if (params?.isEnabled !== undefined) queryParams.append('isEnabled', params.isEnabled.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  
  const url = `/v1/servers/${serverId}/iptables/configs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return httpClient.get<GetServerIptablesConfigsResponse>(url);
};

// 获取单个 iptables 配置
export interface GetIptablesConfigResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: IptablesConfig;
}

export const getIptablesConfig = async (serverId: string, configName: string): Promise<ApiResponse<GetIptablesConfigResponse>> => {
  return httpClient.get<GetIptablesConfigResponse>(`/v1/servers/${serverId}/iptables/configs/${configName}`);
};

// 获取服务器 iptables 概览
export interface IptablesServerConfig {
  serverId: string;
  totalConfigs: number;
  enabledConfigs: number;
  disabledConfigs: number;
  totalRules: number;
  lastRebuildTime: string;
  rebuildStatus: string;
}

export interface GetServerIptablesOverviewResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: IptablesServerConfig;
}

export const getServerIptablesOverview = async (serverId: string): Promise<ApiResponse<GetServerIptablesOverviewResponse>> => {
  return httpClient.get<GetServerIptablesOverviewResponse>(`/v1/servers/${serverId}/iptables/overview`);
};

// 获取服务器 iptables 生成的规则
export interface IptablesGeneratedRule {
  ruleCommand: string;
  configName: string;
  priority: number;
  isValid: boolean;
  errorMessage?: string;
}

export interface GetServerIptablesRulesResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: IptablesGeneratedRule[];
}

export const getServerIptablesRules = async (serverId: string, onlyEnabled?: boolean): Promise<ApiResponse<GetServerIptablesRulesResponse>> => {
  const url = `/v1/servers/${serverId}/iptables/rules${onlyEnabled ? '?onlyEnabled=true' : ''}`;
  return httpClient.get<GetServerIptablesRulesResponse>(url);
};

// 获取服务器 iptables 脚本
export interface GetServerIptablesScriptResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: {
    script: string;
    format: string;
  };
}

export const getServerIptablesScript = async (
  serverId: string, 
  params?: { onlyEnabled?: boolean; format?: string }
): Promise<ApiResponse<GetServerIptablesScriptResponse>> => {
  const queryParams = new URLSearchParams();
  if (params?.onlyEnabled) queryParams.append('onlyEnabled', params.onlyEnabled.toString());
  if (params?.format) queryParams.append('format', params.format);
  
  const url = `/v1/servers/${serverId}/iptables/script${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return httpClient.get<GetServerIptablesScriptResponse>(url);
};

// 重建服务器 iptables 配置
export const rebuildServerIptables = async (
  serverId: string, 
  options?: { force?: boolean; dryRun?: boolean }
): Promise<ApiResponse<IptablesRebuildTask>> => {
  return httpClient.post<IptablesRebuildTask>(`/v1/servers/${serverId}/iptables/rebuild`, options || {});
};

// 批量重建多个服务器 iptables 配置
export interface BatchRebuildServersIptablesRequest {
  serverIds: string[];
  force?: boolean;
  dryRun?: boolean;
}

export interface BatchRebuildServersIptablesResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: IptablesRebuildTask[];
}

export const batchRebuildServersIptables = async (
  request: BatchRebuildServersIptablesRequest
): Promise<ApiResponse<BatchRebuildServersIptablesResponse>> => {
  return httpClient.post<BatchRebuildServersIptablesResponse>('/v1/iptables/batch-rebuild', request);
};

// 获取重建任务状态
export interface GetRebuildTaskStatusResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: IptablesRebuildTask;
}

export const getRebuildTaskStatus = async (taskId: string): Promise<ApiResponse<GetRebuildTaskStatusResponse>> => {
  return httpClient.get<GetRebuildTaskStatusResponse>(`/v1/iptables/rebuild-tasks/${taskId}`);
};

// 清理服务器 iptables 配置
export interface CleanupServerIptablesRequest {
  tables?: string[];
  chains?: string[];
  force?: boolean;
}

export interface CleanupServerIptablesResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: {
    cleanedRules: number;
    errors: string[];
  };
}

export const cleanupServerIptables = async (
  serverId: string,
  request?: CleanupServerIptablesRequest
): Promise<ApiResponse<CleanupServerIptablesResponse>> => {
  return httpClient.post<CleanupServerIptablesResponse>(`/v1/servers/${serverId}/iptables/cleanup`, request || {});
};

// 验证服务器 iptables 配置
export interface ValidateServerIptablesRequest {
  configNames?: string[];
  validateSyntax?: boolean;
  validateConflicts?: boolean;
}

export interface ValidateServerIptablesResponse {
  status: {
    success: boolean;
    message: string;
    code: string;
  };
  data: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export const validateServerIptables = async (
  serverId: string,
  request?: ValidateServerIptablesRequest
): Promise<ApiResponse<ValidateServerIptablesResponse>> => {
  return httpClient.post<ValidateServerIptablesResponse>(`/v1/servers/${serverId}/iptables/validate`, request || {});
};

// 获取转发路径规则相关的 iptables 配置（保留旧的API用于兼容性）
export const getForwardPathRuleIptables = async (ruleId: string): Promise<ApiResponse<IptablesConfig[]>> => {
  return httpClient.get<IptablesConfig[]>(`/v1/forward-path-rules/${ruleId}/iptables`);
};

// 重建转发路径规则 iptables 配置
export const rebuildForwardPathRuleIptables = async (ruleId: string, options?: { force?: boolean }): Promise<ApiResponse<IptablesRebuildTask>> => {
  return httpClient.post<IptablesRebuildTask>(`/v1/forward-path-rules/${ruleId}/iptables/rebuild`, options || {});
};

// 获取 iptables 重建状态的中文描述
export const getIptablesRebuildStatusText = (status: string): string => {
  switch (status) {
    case 'IPTABLES_REBUILD_STATUS_PENDING':
      return '等待中';
    case 'IPTABLES_REBUILD_STATUS_RUNNING':
      return '执行中';
    case 'IPTABLES_REBUILD_STATUS_SUCCESS':
      return '成功';
    case 'IPTABLES_REBUILD_STATUS_FAILED':
      return '失败';
    default:
      return '未知状态';
  }
};

// 获取 iptables 重建状态的颜色
export const getIptablesRebuildStatusColor = (status: string): string => {
  switch (status) {
    case 'IPTABLES_REBUILD_STATUS_PENDING':
      return 'default';
    case 'IPTABLES_REBUILD_STATUS_RUNNING':
      return 'processing';
    case 'IPTABLES_REBUILD_STATUS_SUCCESS':
      return 'success';
    case 'IPTABLES_REBUILD_STATUS_FAILED':
      return 'error';
    default:
      return 'default';
  }
};
