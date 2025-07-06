import { httpClient, ApiResponse } from '@/utils/http-client';

// iptables 配置信息接口
export interface IptablesConfigInfo {
  serverId: string;
  serverName: string;
  configName: string;
  tableName: string;
  chainName: string;
  ruleAction: string;
  sourceIp: string;
  sourcePort: string;
  destIp: string;
  destPort: string;
  protocol: string;
  ruleComment: string;
  priority: number;
  isEnabled: boolean;
  generatedRule: string;
  createdAt: string;
  updatedAt: string;
}

// iptables 重建任务接口
export interface IptablesRebuildTask {
  taskId: string;
  serverId: string;
  status: 'IPTABLES_REBUILD_STATUS_UNSPECIFIED' | 'IPTABLES_REBUILD_STATUS_PENDING' | 'IPTABLES_REBUILD_STATUS_RUNNING' | 'IPTABLES_REBUILD_STATUS_SUCCESS' | 'IPTABLES_REBUILD_STATUS_FAILED';
  totalRules: number;
  processedRules: number;
  failedRules: number;
  errorMessage: string;
  startedAt: string;
  completedAt: string;
}

// API 响应接口
export interface GetServerIptablesConfigResponse {
  response: {
    success: boolean;
    message: string;
    code: string;
  };
  configs: IptablesConfigInfo[];
}

export interface RebuildServerIptablesResponse {
  response: {
    success: boolean;
    message: string;
    code: string;
  };
  task: IptablesRebuildTask;
}

// 获取服务器 iptables 配置
export const getServerIptablesConfig = async (serverId: string): Promise<ApiResponse<IptablesConfigInfo[]>> => {
  return httpClient.get<IptablesConfigInfo[]>(`/api/v1/servers/${serverId}/iptables/configs`);
};

// 重建服务器 iptables 配置
export const rebuildServerIptables = async (serverId: string, options?: { force?: boolean }): Promise<ApiResponse<IptablesRebuildTask>> => {
  return httpClient.post<IptablesRebuildTask>(`/api/v1/servers/${serverId}/iptables/rebuild`, options || {});
};

// 获取转发路径规则相关的 iptables 配置
export const getForwardPathRuleIptables = async (ruleId: string): Promise<ApiResponse<IptablesConfigInfo[]>> => {
  return httpClient.get<IptablesConfigInfo[]>(`/api/v1/forward-path-rules/${ruleId}/iptables`);
};

// 重建转发路径规则 iptables 配置
export const rebuildForwardPathRuleIptables = async (ruleId: string, options?: { force?: boolean }): Promise<ApiResponse<IptablesRebuildTask>> => {
  return httpClient.post<IptablesRebuildTask>(`/api/v1/forward-path-rules/${ruleId}/iptables/rebuild`, options || {});
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
