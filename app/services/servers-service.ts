import { httpClient, ApiResponse } from '@/utils/http-client';

// 服务器状态类型
export type ServerStatus = 'online' | 'offline';

// 服务器数据类型定义
export interface ServerItem {
  id: React.Key;
  name: string;
  ipv4: string;
  ipv6?: string;
  region: string;
  group: string;
  registerTime: string;
  uploadTraffic: number; // MB
  downloadTraffic: number; // MB
  status: ServerStatus;
}

// 创建服务器数据类型
export interface CreateServerData {
  name: string;
  ipv4: string;
  ipv6?: string;
  region: string;
  group: string;
  registerTime: string;
  uploadTraffic?: number;
  downloadTraffic?: number;
  status?: ServerStatus;
}

// 查询参数类型
export interface ServerListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: ServerStatus | 'all';
  region?: string;
}

// 更新服务器数据类型
export interface UpdateServerData extends Partial<CreateServerData> {
  // 继承CreateServerData的所有字段，但都是可选的
}

class ServersService {
  private readonly endpoint = '/servers';

  /**
   * 获取服务器列表
   */
  async getServers(params: ServerListParams = {}): Promise<ApiResponse<ServerItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.name) queryParams.name = params.name;
    if (params.status && params.status !== 'all') queryParams.status = params.status;
    if (params.region && params.region !== 'all') queryParams.region = params.region;

    return httpClient.get<ServerItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新服务器
   */
  async createServer(serverData: CreateServerData): Promise<ApiResponse<ServerItem>> {
    return httpClient.post<ServerItem>(this.endpoint, serverData);
  }

  /**
   * 获取服务器详情
   */
  async getServerById(id: React.Key): Promise<ApiResponse<ServerItem>> {
    return httpClient.get<ServerItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新服务器信息
   */
  async updateServer(id: React.Key, serverData: UpdateServerData): Promise<ApiResponse<ServerItem>> {
    return httpClient.put<ServerItem>(`${this.endpoint}/${id}`, serverData);
  }

  /**
   * 删除服务器
   */
  async deleteServer(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量删除服务器
   */
  async batchDeleteServers(ids: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids });
  }

  /**
   * 重启服务器
   */
  async restartServer(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/restart`);
  }

  /**
   * 获取服务器统计信息
   */
  async getServerStats(id: React.Key): Promise<ApiResponse<{
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
  }>> {
    return httpClient.get(`${this.endpoint}/${id}/stats`);
  }

  /**
   * 获取服务器区域列表
   */
  async getRegions(): Promise<ApiResponse<{ label: string; value: string }[]>> {
    return httpClient.get<{ label: string; value: string }[]>(`${this.endpoint}/regions`);
  }
}

// 创建并导出服务实例
export const serversService = new ServersService();
export default ServersService; 