import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  UserInfo,
  UpdateUserInfoRequest,
} from '@/types/generated/api/users/user_profile';
import type {
  ChangePasswordRequest,
} from '@/types/generated/api/users/user_password';
import type {
  TrafficStats,
} from '@/types/generated/api/users/user_traffic';
import type {
  LoginHistoryItem,
  GetLoginHistoryRequest,
} from '@/types/generated/api/users/user_login_history';
import type {
  ActivityLogItem,
  GetActivityLogsRequest,
} from '@/types/generated/api/users/user_activity';
import type {
  ToggleTwoFactorAuthRequest,
} from '@/types/generated/api/users/user_two_factor';
import type {
  UploadAvatarResponse
} from '@/types/generated/api/users/user_avatar';
import type {
  DeleteAccountRequest,
} from '@/types/generated/api/users/user_account';

// 认证相关类型 - 这些可能需要从auth相关的generated类型导入
interface RegisterRequest { username: string; email: string; password: string; }
interface LoginRequest { username: string; password: string; }
interface UploadAvatarData { avatar: File; }

// 用户配置相关类型 - 如果有generated类型可以替换
interface UserConfig { userId: string; configKey: string; value: unknown; }
interface GetUserConfigRequest { userId: string; }
interface UpdateUserConfigRequest { userId: string; configKey: string; value: unknown; }
interface DeleteUserConfigRequest { userId: string; configKey: string; }
interface GetUserConfigHistoryRequest { userId: string; configKey: string; page?: number; pageSize?: number; }

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

class UserManagementService {
  private readonly authEndpoint = '/v1/auth';
  private readonly userEndpoint = '/v1/user';
  private readonly usersEndpoint = '/v1/users';

  // === 认证相关 ===

  /**
   * 用户注册
   */
  async register(request: RegisterRequest): Promise<ApiResponse<{
    userId: string;
    username: string;
    email: string;
  }>> {
    const response = await httpClient.post<{
      userId: string;
      username: string;
      email: string;
    }>(`${this.authEndpoint}/register`, request);
    return response;
  }

  /**
   * 用户登录
   */
  async login(request: LoginRequest): Promise<ApiResponse<{
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: UserInfo;
  }>> {
    const response = await httpClient.post<{
      token: string;
      refreshToken: string;
      expiresIn: number;
      user: UserInfo;
    }>(`${this.authEndpoint}/login`, request);
    return response;
  }

  // === 用户资料相关 ===

  /**
   * 获取当前用户信息
   */
  async getCurrentUserInfo(): Promise<ApiResponse<UserInfo>> {
    return httpClient.get<UserInfo>(`/v1/profile`);
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(request: UpdateUserInfoRequest): Promise<ApiResponse<UserInfo>> {
    const response = await httpClient.put<UserInfo>(`${this.usersEndpoint}/me`, request);
    return response;
  }

  // === 密码管理 ===

  /**
   * 修改密码
   */
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.userEndpoint}/password`, request);
  }

  /**
   * 删除账户
   */
  async deleteAccount(request: DeleteAccountRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.userEndpoint}/delete-account`, request);
  }

  // === 头像管理 ===

  /**
   * 上传头像
   */
  async uploadAvatar(avatarData: UploadAvatarData): Promise<ApiResponse<UploadAvatarResponse>> {
    const formData = new FormData();
    formData.append('avatar', avatarData.avatar);

    return httpClient.post<UploadAvatarResponse>(`${this.userEndpoint}/avatar`, formData);
  }

  // === 流量统计 ===

  /**
   * 获取流量统计
   */
  async getTrafficStats(): Promise<ApiResponse<TrafficStats>> {
    return httpClient.get<TrafficStats>(`${this.userEndpoint}/traffic`);
  }

  /**
   * 重置流量统计
   */
  async resetTraffic(): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.userEndpoint}/traffic/reset`);
  }

  // === 登录历史 ===

  /**
   * 获取登录历史
   */
  async getLoginHistory(request: GetLoginHistoryRequest = {}): Promise<ApiResponse<LoginHistoryItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (request.page) queryParams.page = request.page.toString();
    if (request.pageSize) queryParams.pageSize = request.pageSize.toString();

    return httpClient.get<LoginHistoryItem[]>(`${this.userEndpoint}/login-history`, queryParams);
  }

  // === 活动日志 ===

  /**
   * 获取活动日志
   */
  async getActivityLogs(request: GetActivityLogsRequest = {}): Promise<ApiResponse<ActivityLogItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (request.page) queryParams.page = request.page.toString();
    if (request.pageSize) queryParams.pageSize = request.pageSize.toString();

    return httpClient.get<ActivityLogItem[]>(`${this.userEndpoint}/activity-logs`, queryParams);
  }

  // === 二步验证 ===

  /**
   * 切换二步验证
   */
  async toggleTwoFactorAuth(request: ToggleTwoFactorAuthRequest): Promise<ApiResponse<{enabled: boolean; qrCode?: string}>> {
    return httpClient.post<{
      enabled: boolean;
      qrCode?: string;
    }>(`${this.userEndpoint}/2fa/toggle`, request);
  }

  // === 用户配置 ===

  /**
   * 获取用户配置
   */
  async getUserConfig(request: GetUserConfigRequest): Promise<ApiResponse<UserConfig[]>> {
    return httpClient.get<UserConfig[]>(`${this.usersEndpoint}/${request.userId}/configs`);
  }

  /**
   * 更新用户配置
   */
  async updateUserConfig(request: UpdateUserConfigRequest): Promise<ApiResponse<UserConfig>> {
    return httpClient.put<UserConfig>(`${this.usersEndpoint}/${request.userId}/configs/${request.configKey}`, {
      value: request.value
    });
  }

  /**
   * 删除用户配置
   */
  async deleteUserConfig(request: DeleteUserConfigRequest): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.usersEndpoint}/${request.userId}/configs/${request.configKey}`);
  }

  /**
   * 获取用户配置历史
   */
  async getUserConfigHistory(request: GetUserConfigHistoryRequest): Promise<ApiResponse<UserConfig[]>> {
    const queryParams: Record<string, string> = {};
    
    if (request.page) queryParams.page = request.page.toString();
    if (request.pageSize) queryParams.pageSize = request.pageSize.toString();

    return httpClient.get<UserConfig[]>(`${this.usersEndpoint}/${request.userId}/configs/${request.configKey}/history`, queryParams);
  }
}

// 创建并导出服务实例
export const userManagementService = new UserManagementService();
export default UserManagementService; 