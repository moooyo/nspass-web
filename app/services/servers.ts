import type {
  ServerItem,
  ServerStatus
} from '@/types/generated/api/servers/server_management';

// 状态映射函数
export const statusToString = (status: ServerStatus): string => {
  switch (status) {
    case 1: // SERVER_STATUS_ONLINE
      return 'online';
    case 2: // SERVER_STATUS_OFFLINE
      return 'offline';
    case 3: // SERVER_STATUS_PENDING_INSTALL
      return 'pending_install';
    case 4: // SERVER_STATUS_UNKNOWN
      return 'unknown';
    default:
      return 'unknown';
  }
};

export const stringToStatus = (status: string): ServerStatus => {
  switch (status) {
    case 'online':
      return 1; // SERVER_STATUS_ONLINE
    case 'offline':
      return 2; // SERVER_STATUS_OFFLINE
    case 'pending_install':
      return 3; // SERVER_STATUS_PENDING_INSTALL
    case 'unknown':
      return 4; // SERVER_STATUS_UNKNOWN
    default:
      return 4; // SERVER_STATUS_UNKNOWN
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
  private static readonly BASE_URL = '/api/v1/servers';

  /**
   * 获取服务器列表
   */
  static async getServers(params: ServerListParams = {}): Promise<{
    data: ServerItem[];
    success: boolean;
    total: number;
  }> {
    const url = new URL(this.BASE_URL, window.location.origin);
    
    if (params.current) url.searchParams.set('page', params.current.toString());
    if (params.pageSize) url.searchParams.set('pageSize', params.pageSize.toString());
    if (params.name) url.searchParams.set('name', params.name);
    if (params.status && params.status !== 'all') {
      url.searchParams.set('status', stringToStatus(params.status).toString());
    }
    if (params.country && params.country !== 'all') {
      url.searchParams.set('country', params.country);
    }

    const response = await fetch(url.toString());
    const result = await response.json();

    if (!result.base?.success) {
      throw new Error(result.base?.message || '获取服务器列表失败');
    }

    return {
      data: result.data || [],
      success: true,
      total: result.data?.length || 0
    };
  }

  /**
   * 创建服务器
   */
  static async createServer(data: CreateServerParams): Promise<ServerItem> {
    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.base?.success) {
      throw new Error(result.base?.message || '创建服务器失败');
    }

    return result.data;
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

    const response = await fetch(`${this.BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!result.base?.success) {
      throw new Error(result.base?.message || '更新服务器失败');
    }

    return result.data;
  }

  /**
   * 删除服务器
   */
  static async deleteServer(id: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!result.base?.success) {
      throw new Error(result.base?.message || '删除服务器失败');
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