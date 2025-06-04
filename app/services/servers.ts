// 使用 proto 生成类型的 Servers Service
import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  ServerItem,
  CreateServerRequest,
  UpdateServerRequest,
  GetServersRequest,
  GetServerByIdRequest,
  UpdateServerByIdRequest,
  DeleteServerRequest,
  BatchDeleteServersRequest,
  RestartServerRequest,
  GetServerStatsRequest,
  ServerStats,
  RegionOption,
  GetServersResponse,
  CreateServerResponse,
  GetServerByIdResponse,
  UpdateServerResponse,
  DeleteServerResponse,
  BatchDeleteServersResponse,
  RestartServerResponse,
  GetServerStatsResponse,
  GetRegionsResponse
} from '@/types/generated/api/servers/servers';
import { ServerStatus } from '@/types/generated/api/servers/servers';
import type { ApiResponse as CommonApiResponse } from '@/types/generated/common';

// 将httpClient的ApiResponse转换为proto响应格式的辅助函数
function toProtoResponse<T>(response: ApiResponse<T>): { base?: CommonApiResponse; data?: T } {
  return {
    base: {
      success: response.success,
      message: response.message,
      errorCode: response.success ? undefined : 'API_ERROR'
    },
    data: response.data
  };
}

class ServersService {
  private readonly endpoint = '/servers';

  /**
   * 获取服务器列表
   */
  async getServers(params: GetServersRequest = {}): Promise<GetServersResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.name) queryParams.name = params.name;
    if (params.status && params.status !== ServerStatus.SERVER_STATUS_UNSPECIFIED) {
      queryParams.status = params.status;
    }
    if (params.region) queryParams.region = params.region;

    const response = await httpClient.get<ServerItem[]>(this.endpoint, queryParams);
    return toProtoResponse(response);
  }

  /**
   * 创建新服务器
   */
  async createServer(serverData: CreateServerRequest): Promise<CreateServerResponse> {
    const response = await httpClient.post<ServerItem>(this.endpoint, serverData);
    return toProtoResponse(response);
  }

  /**
   * 获取服务器详情
   */
  async getServerById(params: GetServerByIdRequest): Promise<GetServerByIdResponse> {
    const response = await httpClient.get<ServerItem>(`${this.endpoint}/${params.id}`);
    return toProtoResponse(response);
  }

  /**
   * 更新服务器信息
   */
  async updateServer(params: UpdateServerByIdRequest): Promise<UpdateServerResponse> {
    const response = await httpClient.put<ServerItem>(`${this.endpoint}/${params.id}`, params.data);
    return toProtoResponse(response);
  }

  /**
   * 删除服务器
   */
  async deleteServer(params: DeleteServerRequest): Promise<DeleteServerResponse> {
    const response = await httpClient.delete<void>(`${this.endpoint}/${params.id}`);
    return toProtoResponse(response);
  }

  /**
   * 批量删除服务器
   */
  async batchDeleteServers(params: BatchDeleteServersRequest): Promise<BatchDeleteServersResponse> {
    const response = await httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids: params.ids });
    return toProtoResponse(response);
  }

  /**
   * 重启服务器
   */
  async restartServer(params: RestartServerRequest): Promise<RestartServerResponse> {
    const response = await httpClient.post<void>(`${this.endpoint}/${params.id}/restart`);
    return toProtoResponse(response);
  }

  /**
   * 获取服务器统计信息
   */
  async getServerStats(params: GetServerStatsRequest): Promise<GetServerStatsResponse> {
    const response = await httpClient.get<ServerStats>(`${this.endpoint}/${params.id}/stats`);
    return toProtoResponse(response);
  }

  /**
   * 获取服务器区域列表
   */
  async getRegions(): Promise<GetRegionsResponse> {
    const response = await httpClient.get<RegionOption[]>(`${this.endpoint}/regions`);
    return toProtoResponse(response);
  }
}

// 创建并导出服务实例
export const serversService = new ServersService();
export default ServersService;

// 导出常用类型和枚举
export type {
  ServerItem,
  CreateServerRequest,
  UpdateServerRequest,
  GetServersRequest,
  ServerStats,
  RegionOption
} from '@/types/generated/api/servers/servers';

// 单独导出枚举作为值
export { ServerStatus } from '@/types/generated/api/servers/servers'; 