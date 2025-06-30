import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  ServerItem,
  ServerStatus,
  CreateServerRequest,
  UpdateServerRequest,
  GetServersRequest,
  GetServerByIdRequest,
  UpdateServerByIdRequest,
  DeleteServerRequest,
  BatchDeleteServersRequest,
  RestartServerRequest,
  GetServersResponse,
  CreateServerResponse,
  GetServerByIdResponse,
  UpdateServerResponse,
  DeleteServerResponse,
  BatchDeleteServersResponse,
  RestartServerResponse
} from '@/types/generated/api/servers/server_management';
import type { ApiResponse as CommonApiResponse } from '@/types/generated/common';

// 注释掉不再使用的toProtoResponse函数
// function toProtoResponse<T>(response: ApiResponse<T>): { base: CommonApiResponse; data?: T } {
//   return {
//     base: {
//       success: response.success,
//       message: response.message,
//       errorCode: response.success ? undefined : 'API_ERROR'
//     },
//     data: response.data
//   };
// }

class ServerManagementService {
  private readonly endpoint = '/v1/servers';

  /**
   * 获取服务器列表
   */
  async getServers(request: GetServersRequest = {}): Promise<ApiResponse<ServerItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (request.page) queryParams.page = request.page.toString();
    if (request.pageSize) queryParams.pageSize = request.pageSize.toString();
    if (request.name) queryParams.name = request.name;
    if (request.status) queryParams.status = request.status.toString();
    // if (request.region) queryParams.region = request.region; // region属性在类型定义中不存在

    return httpClient.get<ServerItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建服务器
   */
  async createServer(request: CreateServerRequest): Promise<ApiResponse<ServerItem>> {
    return httpClient.post<ServerItem>(this.endpoint, request);
  }

  /**
   * 获取服务器详情
   */
  async getServerById(request: GetServerByIdRequest): Promise<ApiResponse<ServerItem>> {
    return httpClient.get<ServerItem>(`${this.endpoint}/${request.id}`);
  }

  /**
   * 更新服务器
   */
  async updateServerById(request: UpdateServerByIdRequest): Promise<ApiResponse<ServerItem>> {
    const { id, ...updateData } = request;
    return httpClient.put<ServerItem>(`${this.endpoint}/${id}`, updateData);
  }

  /**
   * 删除服务器
   */
  async deleteServer(request: DeleteServerRequest): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${request.id}`);
  }

  /**
   * 批量删除服务器
   */
  async batchDeleteServers(request: BatchDeleteServersRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids: request.ids });
  }

  /**
   * 重启服务器
   */
  async restartServer(request: RestartServerRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${request.id}/restart`);
  }
}

// 创建并导出服务实例
export const serverManagementService = new ServerManagementService();
export default ServerManagementService;

// 导出类型和枚举
export type {
  ServerItem,
  CreateServerRequest,
  UpdateServerRequest,
  GetServersRequest
} from '@/types/generated/api/servers/server_management';

export {
  ServerStatus
} from '@/types/generated/api/servers/server_management'; 