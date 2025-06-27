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

// 将httpClient的ApiResponse转换为proto响应格式的辅助函数
function toProtoResponse<T>(response: ApiResponse<T>): { base: CommonApiResponse; data?: T } {
  return {
    base: {
      success: response.success,
      message: response.message,
      errorCode: response.success ? undefined : 'API_ERROR'
    },
    data: response.data
  };
}

class ServerManagementService {
  private readonly endpoint = '/api/v1/servers';

  /**
   * 获取服务器列表
   */
  async getServers(request: GetServersRequest = {}): Promise<GetServersResponse> {
    const queryParams: Record<string, string> = {};
    
    if (request.page) queryParams.page = request.page.toString();
    if (request.pageSize) queryParams.pageSize = request.pageSize.toString();
    if (request.name) queryParams.name = request.name;
    if (request.status) queryParams.status = request.status.toString();
    if (request.region) queryParams.region = request.region;

    const response = await httpClient.get<ServerItem[]>(this.endpoint, queryParams);
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      },
      data: response.data || []
    };
  }

  /**
   * 创建服务器
   */
  async createServer(request: CreateServerRequest): Promise<CreateServerResponse> {
    const response = await httpClient.post<ServerItem>(this.endpoint, request);
    return toProtoResponse(response);
  }

  /**
   * 获取服务器详情
   */
  async getServerById(request: GetServerByIdRequest): Promise<GetServerByIdResponse> {
    const response = await httpClient.get<ServerItem>(`${this.endpoint}/${request.id}`);
    return toProtoResponse(response);
  }

  /**
   * 更新服务器
   */
  async updateServer(request: UpdateServerByIdRequest): Promise<UpdateServerResponse> {
    const response = await httpClient.put<ServerItem>(`${this.endpoint}/${request.id}`, request.data);
    return toProtoResponse(response);
  }

  /**
   * 删除服务器
   */
  async deleteServer(request: DeleteServerRequest): Promise<DeleteServerResponse> {
    const response = await httpClient.delete<void>(`${this.endpoint}/${request.id}`);
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      }
    };
  }

  /**
   * 批量删除服务器
   */
  async batchDeleteServers(request: BatchDeleteServersRequest): Promise<BatchDeleteServersResponse> {
    const response = await httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids: request.ids });
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      }
    };
  }

  /**
   * 重启服务器
   */
  async restartServer(request: RestartServerRequest): Promise<RestartServerResponse> {
    const response = await httpClient.post<void>(`${this.endpoint}/${request.id}/restart`);
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      }
    };
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