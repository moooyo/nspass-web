import type {
  ServerItem
} from '@/types/generated/api/servers/server_management';
import { ServerStatus } from '@/types/generated/api/servers/server_management';
import { httpClient, ApiResponse } from '@/utils/http-client';

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

// 请求参数接口
export interface ServerListParams {
  current?: number;
  pageSize?: number;
  name?: string;
  status?: string;
  country?: string;
  group?: string;
}

// 创建服务器参数
export interface CreateServerParams {
  name: string;
  country?: string;
  group?: string;
  registerTime?: string;
  uploadTraffic?: number;
  downloadTraffic?: number;
  status?: string;
}

// 更新服务器参数
export interface UpdateServerParams {
  name?: string;
  ipv4?: string;
  ipv6?: string;
  country?: string;
  group?: string;
  registerTime?: string;
  uploadTraffic?: number;
  downloadTraffic?: number;
  status?: string;
}

// 服务器 API 服务
export class ServerService {
  private static readonly endpoint = '/v1/servers';

  /**
   * 获取服务器列表
   */
  static async getServers(params: ServerListParams = {}): Promise<{
    data: ServerItem[];
    success: boolean;
    total: number;
  }> {
    const queryParams: Record<string, string> = {};
    
    if (params.current) queryParams.page = params.current.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.name) queryParams.name = params.name;
    if (params.status && params.status !== 'all') {
      queryParams.status = stringToStatus(params.status);
    }
    if (params.country && params.country !== 'all') {
      queryParams.country = params.country;
    }

    const response = await httpClient.get<ServerItem[]>(this.endpoint, queryParams);

    if (!response.success) {
      throw new Error(response.message || '获取服务器列表失败');
    }

    return {
      data: response.data || [],
      success: true,
      total: response.data?.length || 0
    };
  }

  /**
   * 获取服务器组列表
   */
  static async getServerGroups(): Promise<{
    data: Array<{ label: string; value: string; count: number }>;
    success: boolean;
  }> {
    try {
      // 先获取所有服务器
      const serverResponse = await this.getServers();
      
      if (!serverResponse.success) {
        throw new Error('获取服务器数据失败');
      }

      // 统计各个组的服务器数量
      const groupStats = new Map<string, { count: number; onlineCount: number }>();
      
      serverResponse.data.forEach(server => {
        const groupName = server.group || '未分组';
        const current = groupStats.get(groupName) || { count: 0, onlineCount: 0 };
        
        current.count += 1;
        if (server.status === ServerStatus.SERVER_STATUS_ONLINE) {
          current.onlineCount += 1;
        }
        
        groupStats.set(groupName, current);
      });

      // 转换为API需要的格式
      const groups = Array.from(groupStats.entries()).map(([groupName, stats]) => ({
        label: `${groupName} (${stats.onlineCount}/${stats.count})`,
        value: groupName,
        count: stats.count,
        onlineCount: stats.onlineCount
      }));

      // 添加"全部"选项
      const totalOnline = serverResponse.data.filter(s => s.status === ServerStatus.SERVER_STATUS_ONLINE).length;
      groups.unshift({
        label: `All (${totalOnline}/${serverResponse.data.length})`,
        value: 'all',
        count: serverResponse.data.length,
        onlineCount: totalOnline
      });

      return {
        data: groups,
        success: true
      };
    } catch (error) {
      console.error('获取服务器组失败:', error);
      return {
        data: [],
        success: false
      };
    }
  }

  /**
   * 创建服务器
   */
  static async createServer(data: CreateServerParams): Promise<ServerItem> {
    const createData = { ...data };
    
    // 转换状态值
    if (createData.status) {
      createData.status = stringToStatus(createData.status);
    }

    const response = await httpClient.post<ServerItem>(this.endpoint, createData);

    if (!response.success) {
      throw new Error(response.message || '创建服务器失败');
    }

    return response.data!;
  }

  /**
   * 更新服务器
   */
  static async updateServer(id: string, data: UpdateServerParams): Promise<ServerItem> {
    const updateData = { ...data };
    
    // 转换状态值
    if (updateData.status) {
      updateData.status = stringToStatus(updateData.status);
    }

    const response = await httpClient.put<ServerItem>(`${this.endpoint}/${id}`, updateData);

    if (!response.success) {
      throw new Error(response.message || '更新服务器失败');
    }

    return response.data!;
  }

  /**
   * 删除服务器
   */
  static async deleteServer(id: string): Promise<void> {
    const response = await httpClient.delete<void>(`${this.endpoint}/${id}`);

    if (!response.success) {
      throw new Error(response.message || '删除服务器失败');
    }
  }

  /**
   * 安装服务器（模拟操作）
   */
  static async installServer(id: string): Promise<void> {
    // 这里可以调用实际的安装 API
    // 目前仅模拟操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await navigator.clipboard.writeText('安装成功');
    } catch (error) {
      console.error('复制到剪切板失败:', error);
    }
  }
} 