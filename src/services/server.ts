import { BaseService, QueryParams, StandardApiResponse } from './base';
import { ServerItem, ServerStatus, CreateServerRequest, UpdateServerRequest, RegenerateServerTokenRequest, RegenerateAllServerTokensRequest, RegenerateServerTokenResponse, RegenerateAllServerTokensResponse } from '@/types/generated/api/servers/server_management';

// 服务器查询参数
export interface ServerQueryParams extends QueryParams {
  name?: string;
  status?: string;
  country?: string;
  group?: string;
}

// 服务器创建参数
export interface ServerCreateData extends Omit<CreateServerRequest, 'id'> {
  name: string;
  country?: string;
  group?: string;
  status?: ServerStatus;
  availablePorts?: string;
}

// 服务器更新参数
export interface ServerUpdateData extends Partial<Omit<UpdateServerRequest, 'id'>> {
  name?: string;
  ipv4?: string;
  ipv6?: string;
  country?: string;
  group?: string;
  status?: ServerStatus;
  uploadTraffic?: number;
  downloadTraffic?: number;
  availablePorts?: string;
}

// 服务器组信息
export interface ServerGroupInfo {
  label: string;
  value: string;
  count: number;
  onlineCount: number;
}

// 服务器统计信息
export interface ServerStats {
  total: number;
  online: number;
  offline: number;
  pending: number;
  unknown: number;
  groups: ServerGroupInfo[];
}

// 状态映射函数
export const statusToString = (status: ServerStatus): string => {
  switch (status) {
    case ServerStatus.SERVER_STATUS_ONLINE:
      return 'online';
    case ServerStatus.SERVER_STATUS_OFFLINE:
      return 'offline';
    case ServerStatus.SERVER_STATUS_PENDING_INSTALL:
      return 'pending_install';
    case ServerStatus.SERVER_STATUS_UNKNOWN:
      return 'unknown';
    case ServerStatus.SERVER_STATUS_UNSPECIFIED:
      return 'unknown';
    default:
      return 'unknown';
  }
};

export const stringToStatus = (status: string): ServerStatus => {
  switch (status) {
    case 'online':
      return ServerStatus.SERVER_STATUS_ONLINE;
    case 'offline':
      return ServerStatus.SERVER_STATUS_OFFLINE;
    case 'pending_install':
      return ServerStatus.SERVER_STATUS_PENDING_INSTALL;
    case 'unknown':
      return ServerStatus.SERVER_STATUS_UNKNOWN;
    default:
      return ServerStatus.SERVER_STATUS_UNKNOWN;
  }
};

/**
 * 统一的服务器服务
 * 合并了 ServerService 和 ServerManagementService 的功能
 */
class UnifiedServerService extends BaseService<ServerItem, ServerCreateData, ServerUpdateData> {
  protected readonly endpoint = '/v1/servers';

  /**
   * 获取服务器列表
   */
  async getServers(params: ServerQueryParams = {}): Promise<StandardApiResponse<ServerItem[]>> {
    try {
      const queryParams = this.buildQueryParams(params);
      
      // 处理特殊的状态参数
      if (params.status && params.status !== 'all') {
        queryParams.status = stringToStatus(params.status);
      }
      
      const response = await this.httpClient.get<ServerItem[]>(this.endpoint, queryParams);
      
      return {
        ...response,
        data: response.data || []
      };
    } catch (error) {
      return this.handleError(error, '获取服务器列表');
    }
  }

  /**
   * 获取服务器组列表
   */
  async getServerGroups(): Promise<StandardApiResponse<ServerGroupInfo[]>> {
    try {
      // 先获取所有服务器数据
      const response = await this.getServers();
      
      if (!response.success || !response.data) {
        return {
          success: false,
          message: '获取服务器数据失败',
          data: []
        };
      }

      // 统计服务器组信息
      const groupStats = new Map<string, { count: number; onlineCount: number }>();
      
      response.data.forEach(server => {
        const group = server.group || 'Default';
        const stats = groupStats.get(group) || { count: 0, onlineCount: 0 };
        
        stats.count++;
        if (server.status === ServerStatus.SERVER_STATUS_ONLINE) {
          stats.onlineCount++;
        }
        
        groupStats.set(group, stats);
      });

      // 转换为API需要的格式
      const groups = Array.from(groupStats.entries()).map(([groupName, stats]) => ({
        label: `${groupName} (${stats.onlineCount}/${stats.count})`,
        value: groupName,
        count: stats.count,
        onlineCount: stats.onlineCount
      }));

      // 添加"全部"选项
      const totalOnline = response.data.filter(s => s.status === ServerStatus.SERVER_STATUS_ONLINE).length;
      groups.unshift({
        label: `All (${totalOnline}/${response.data.length})`,
        value: 'all',
        count: response.data.length,
        onlineCount: totalOnline
      });

      return {
        success: true,
        data: groups
      };
    } catch (error) {
      return this.handleError(error, '获取服务器组');
    }
  }

  /**
   * 获取服务器统计信息
   */
  async getServerStats(): Promise<StandardApiResponse<ServerStats>> {
    try {
      const [serversResponse, groupsResponse] = await Promise.all([
        this.getServers(),
        this.getServerGroups()
      ]);

      if (!serversResponse.success || !groupsResponse.success) {
        return this.handleError(null, '获取服务器统计信息');
      }

      const servers = serversResponse.data || [];
      const groups = groupsResponse.data || [];

      const stats: ServerStats = {
        total: servers.length,
        online: servers.filter(s => s.status === ServerStatus.SERVER_STATUS_ONLINE).length,
        offline: servers.filter(s => s.status === ServerStatus.SERVER_STATUS_OFFLINE).length,
        pending: servers.filter(s => s.status === ServerStatus.SERVER_STATUS_PENDING_INSTALL).length,
        unknown: servers.filter(s => s.status === ServerStatus.SERVER_STATUS_UNKNOWN).length,
        groups: groups.filter(g => g.value !== 'all') // 排除"全部"选项
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return this.handleError(error, '获取服务器统计信息');
    }
  }

  /**
   * 创建服务器
   */
  async createServer(data: ServerCreateData): Promise<StandardApiResponse<ServerItem>> {
    try {
      const createData = {
        ...data,
        status: data.status || ServerStatus.SERVER_STATUS_UNKNOWN
      };
      
      return await this.create(createData);
    } catch (error) {
      return this.handleError(error, '创建服务器');
    }
  }

  /**
   * 更新服务器
   */
  async updateServer(id: string | number, data: ServerUpdateData): Promise<StandardApiResponse<ServerItem>> {
    try {
      const updateData = { ...data };
      
      // 转换状态值
      if (typeof updateData.status === 'string' && !updateData.status.startsWith('SERVER_STATUS_')) {
        updateData.status = stringToStatus(updateData.status);
      }

      return await this.update(id, updateData);
    } catch (error) {
      return this.handleError(error, '更新服务器');
    }
  }

  /**
   * 删除服务器
   */
  async deleteServer(id: string | number): Promise<StandardApiResponse<void>> {
    try {
      return await this.delete(id);
    } catch (error) {
      return this.handleError(error, '删除服务器');
    }
  }

  /**
   * 批量删除服务器
   */
  async batchDeleteServers(ids: (string | number)[]): Promise<StandardApiResponse<void>> {
    try {
      return await this.batchDelete(ids);
    } catch (error) {
      return this.handleError(error, '批量删除服务器');
    }
  }

  /**
   * 重启服务器
   */
  async restartServer(id: string | number): Promise<StandardApiResponse<void>> {
    try {
      return await this.httpClient.post<void>(`${this.endpoint}/${id}/restart`);
    } catch (error) {
      return this.handleError(error, '重启服务器');
    }
  }

  /**
   * 获取服务器详情
   */
  async getServerById(id: string | number): Promise<StandardApiResponse<ServerItem>> {
    try {
      return await this.getById(id);
    } catch (error) {
      return this.handleError(error, '获取服务器详情');
    }
  }

  /**
   * 批量更新服务器状态
   */
  async batchUpdateStatus(ids: (string | number)[], status: ServerStatus): Promise<StandardApiResponse<ServerItem[]>> {
    try {
      const statusValue = typeof status === 'string' && !status.startsWith('SERVER_STATUS_') 
        ? stringToStatus(status) 
        : status;
      
      return await this.httpClient.post<ServerItem[]>(`${this.endpoint}/batch/status`, { 
        ids, 
        status: statusValue 
      });
    } catch (error) {
      return this.handleError(error, '批量更新服务器状态');
    }
  }

  /**
   * 搜索服务器
   */
  async searchServers(query: string, params: ServerQueryParams = {}): Promise<StandardApiResponse<ServerItem[]>> {
    try {
      return await this.search(query, params);
    } catch (error) {
      return this.handleError(error, '搜索服务器');
    }
  }

  /**
   * 获取服务器监控数据
   */
  async getServerMonitoring(id: string | number): Promise<StandardApiResponse<{
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
    uptime: number;
  }>> {
    try {
      return await this.httpClient.get(`${this.endpoint}/${id}/monitoring`);
    } catch (error) {
      return this.handleError(error, '获取服务器监控数据');
    }
  }

  /**
   * 获取服务器日志
   */
  async getServerLogs(id: string | number, params: { 
    level?: string; 
    lines?: number; 
    startTime?: string; 
    endTime?: string; 
  } = {}): Promise<StandardApiResponse<string[]>> {
    try {
      const queryParams = this.buildQueryParams(params);
      return await this.httpClient.get(`${this.endpoint}/${id}/logs`, queryParams);
    } catch (error) {
      return this.handleError(error, '获取服务器日志');
    }
  }

  /**
   * 重新生成单个服务器token
   */
  async regenerateServerToken(id: string | number): Promise<StandardApiResponse<ServerItem>> {
    try {
      return await this.httpClient.post<ServerItem>(`${this.endpoint}/${id}/regenerate-token`, {});
    } catch (error) {
      return this.handleError(error, '重新生成服务器token');
    }
  }

  /**
   * 重新生成所有服务器token
   */
  async regenerateAllServerTokens(): Promise<StandardApiResponse<ServerItem[]>> {
    try {
      return await this.httpClient.post<ServerItem[]>(`${this.endpoint}/regenerate-all-tokens`, {});
    } catch (error) {
      return this.handleError(error, '重新生成所有服务器token');
    }
  }
}

// 创建并导出服务实例
export const serverService = new UnifiedServerService();
export default UnifiedServerService;
