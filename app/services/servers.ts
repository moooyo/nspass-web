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
      queryParams.status = stringToStatus(params.status).toString();
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
   * 创建服务器
   */
  static async createServer(data: CreateServerParams): Promise<ServerItem> {
    const response = await httpClient.post<ServerItem>(this.endpoint, data);

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
      updateData.status = stringToStatus(updateData.status).toString();
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