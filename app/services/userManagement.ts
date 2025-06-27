import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  UserProfile,
  GetCurrentUserInfoResponse,
  UpdateUserInfoRequest,
  UpdateCurrentUserInfoResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  UploadAvatarData,
  UploadAvatarResponse,
  TrafficStats,
  GetTrafficStatsResponse,
  ResetTrafficResponse,
  LoginHistoryItem,
  GetLoginHistoryRequest,
  GetLoginHistoryResponse,
  ActivityLogItem,
  GetActivityLogsRequest,
  GetActivityLogsResponse,
  ToggleTwoFactorAuthRequest,
  ToggleTwoFactorAuthResponse,
  UserConfig,
  GetUserConfigRequest,
  GetUserConfigResponse,
  UpdateUserConfigRequest,
  UpdateUserConfigResponse,
  DeleteUserConfigRequest,
  DeleteUserConfigResponse,
  GetUserConfigHistoryRequest,
  GetUserConfigHistoryResponse
} from '@/types/generated/api/users/user_management';
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

class UserManagementService {
  private readonly authEndpoint = '/api/v1/auth';
  private readonly userEndpoint = '/api/v1/user';
  private readonly usersEndpoint = '/api/v1/users';

  // === 认证相关 ===

  /**
   * 用户注册
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await httpClient.post<{
      userId: string;
      username: string;
      email: string;
    }>(`${this.authEndpoint}/register`, request);
    return toProtoResponse(response);
  }

  /**
   * 用户登录
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
      user: UserProfile;
    }>(`${this.authEndpoint}/login`, request);
    return toProtoResponse(response);
  }

  // === 用户资料相关 ===

  /**
   * 获取当前用户信息
   */
  async getCurrentUserInfo(): Promise<GetCurrentUserInfoResponse> {
    const response = await httpClient.get<UserProfile>(`${this.userEndpoint}/profile`);
    return toProtoResponse(response);
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(request: UpdateUserInfoRequest): Promise<UpdateCurrentUserInfoResponse> {
    const response = await httpClient.put<UserProfile>(`${this.userEndpoint}/profile`, request);
    return toProtoResponse(response);
  }

  // === 密码管理 ===

  /**
   * 修改密码
   */
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await httpClient.post<void>(`${this.userEndpoint}/password`, request);
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      }
    };
  }

  /**
   * 删除账户
   */
  async deleteAccount(request: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    const response = await httpClient.post<void>(`${this.userEndpoint}/account/delete`, request);
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      }
    };
  }

  // === 头像管理 ===

  /**
   * 上传头像
   */
  async uploadAvatar(request: UploadAvatarData): Promise<UploadAvatarResponse> {
    const response = await httpClient.post<{
      avatarUrl: string;
    }>(`${this.userEndpoint}/avatar`, request);
    return toProtoResponse(response);
  }

  // === 流量统计 ===

  /**
   * 获取流量统计
   */
  async getTrafficStats(): Promise<GetTrafficStatsResponse> {
    const response = await httpClient.get<TrafficStats>(`${this.userEndpoint}/traffic`);
    return toProtoResponse(response);
  }

  /**
   * 重置流量统计
   */
  async resetTraffic(): Promise<ResetTrafficResponse> {
    const response = await httpClient.post<void>(`${this.userEndpoint}/traffic/reset`);
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      }
    };
  }

  // === 登录历史 ===

  /**
   * 获取登录历史
   */
  async getLoginHistory(request: GetLoginHistoryRequest = {}): Promise<GetLoginHistoryResponse> {
    const queryParams: Record<string, string> = {};
    if (request.page) queryParams.page = request.page.toString();
    if (request.pageSize) queryParams.pageSize = request.pageSize.toString();

    const response = await httpClient.get<{
      data: LoginHistoryItem[];
      total: number;
    }>(`${this.userEndpoint}/login-history`, queryParams);
    
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      },
      data: response.data?.data || [],
      total: response.data?.total
    };
  }

  // === 活动日志 ===

  /**
   * 获取活动日志
   */
  async getActivityLogs(request: GetActivityLogsRequest = {}): Promise<GetActivityLogsResponse> {
    const queryParams: Record<string, string> = {};
    if (request.page) queryParams.page = request.page.toString();
    if (request.pageSize) queryParams.pageSize = request.pageSize.toString();

    const response = await httpClient.get<{
      data: ActivityLogItem[];
      total: number;
    }>(`${this.userEndpoint}/activity`, queryParams);
    
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      },
      data: response.data?.data || [],
      total: response.data?.total
    };
  }

  // === 二步验证 ===

  /**
   * 切换二步验证
   */
  async toggleTwoFactorAuth(request: ToggleTwoFactorAuthRequest): Promise<ToggleTwoFactorAuthResponse> {
    const response = await httpClient.post<{
      enabled: boolean;
      qrCode?: string;
    }>(`${this.userEndpoint}/2fa/toggle`, request);
    return toProtoResponse(response);
  }

  // === 用户配置 ===

  /**
   * 获取用户配置
   */
  async getUserConfig(request: GetUserConfigRequest): Promise<GetUserConfigResponse> {
    const response = await httpClient.get<UserConfig[]>(`${this.usersEndpoint}/${request.userId}/configs`);
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
   * 更新用户配置
   */
  async updateUserConfig(request: UpdateUserConfigRequest): Promise<UpdateUserConfigResponse> {
    const response = await httpClient.put<UserConfig>(`${this.usersEndpoint}/${request.userId}/configs/${request.configKey}`, {
      value: request.value
    });
    return toProtoResponse(response);
  }

  /**
   * 删除用户配置
   */
  async deleteUserConfig(request: DeleteUserConfigRequest): Promise<DeleteUserConfigResponse> {
    const response = await httpClient.post<void>(`${this.usersEndpoint}/${request.userId}/configs/${request.configKey}/delete`);
    return {
      base: {
        success: response.success,
        message: response.message,
        errorCode: response.success ? undefined : 'API_ERROR'
      }
    };
  }

  /**
   * 获取用户配置历史
   */
  async getUserConfigHistory(request: GetUserConfigHistoryRequest): Promise<GetUserConfigHistoryResponse> {
    const response = await httpClient.get<UserConfig>(`${this.usersEndpoint}/${request.userId}/configs/${request.configKey}/history/${request.version}`);
    return toProtoResponse(response);
  }
}

// 创建并导出服务实例
export const userManagementService = new UserManagementService();
export default UserManagementService;

// 导出类型
export type {
  RegisterRequest,
  LoginRequest,
  UserProfile,
  UpdateUserInfoRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  UploadAvatarData,
  TrafficStats,
  LoginHistoryItem,
  ActivityLogItem,
  ToggleTwoFactorAuthRequest,
  UserConfig
} from '@/types/generated/api/users/user_management'; 