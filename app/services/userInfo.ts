// 使用 proto 生成类型的 User Info Service
import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  UserInfo,
  UpdateUserInfoRequest,
  GetCurrentUserInfoResponse,
  UpdateCurrentUserInfoResponse
} from '@/types/generated/api/users/user_profile';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse
} from '@/types/generated/api/users/user_password';
import type {
  TrafficStats,
  GetTrafficStatsResponse,
  ResetTrafficResponse
} from '@/types/generated/api/users/user_traffic';
import type {
  LoginHistoryItem,
  GetLoginHistoryRequest,
  GetLoginHistoryResponse
} from '@/types/generated/api/users/user_login_history';
import type {
  ActivityLogItem,
  GetActivityLogsRequest,
  GetActivityLogsResponse
} from '@/types/generated/api/users/user_activity';
import type {
  TwoFactorAuthData,
  VerifyTwoFactorAuthData,
  ToggleTwoFactorAuthRequest,
  VerifyTwoFactorAuthRequest,
  ToggleTwoFactorAuthResponse,
  VerifyTwoFactorAuthResponse
} from '@/types/generated/api/users/user_two_factor';
import type {
  UploadAvatarResponse
} from '@/types/generated/api/users/user_avatar';
import type {
  DeleteAccountRequest,
  DeleteAccountResponse
} from '@/types/generated/api/users/user_account';
import type { ApiResponse as CommonApiResponse } from '@/types/generated/common';

// 注释掉不再使用的toProtoResponse函数
// function toProtoResponse<T>(response: ApiResponse<T>): { base?: CommonApiResponse; data?: T } {
//   return {
//     base: {
//       success: response.success,
//       message: response.message,
//       errorCode: response.success ? undefined : 'API_ERROR'
//     },
//     data: response.data
//   };
// }

class UserInfoService {
  private readonly endpoint = '/v1/user';

  /**
   * 获取当前用户信息
   */
  async getCurrentUserInfo(): Promise<ApiResponse<UserInfo>> {
    return httpClient.get<UserInfo>(`${this.endpoint}/profile`);
  }

  /**
   * 更新当前用户信息
   */
  async updateCurrentUserInfo(request: UpdateUserInfoRequest): Promise<ApiResponse<UserInfo>> {
    return httpClient.put<UserInfo>(`${this.endpoint}/profile`, request);
  }

  /**
   * 修改密码
   */
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/password`, request);
  }

  /**
   * 删除账户
   */
  async deleteAccount(request: DeleteAccountRequest): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/account/delete`, request);
  }

  /**
   * 上传用户头像
   */
  async uploadAvatar(file: File): Promise<ApiResponse<UploadAvatarResponse['data']>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // 使用httpClient处理文件上传
    return httpClient.post<UploadAvatarResponse['data']>(`${this.endpoint}/avatar`, formData);
  }

  /**
   * 获取流量统计
   */
  async getTrafficStats(): Promise<ApiResponse<TrafficStats>> {
    return httpClient.get<TrafficStats>(`${this.endpoint}/traffic`);
  }

  /**
   * 重置流量
   */
  async resetTraffic(): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/traffic/reset`);
  }

  /**
   * 获取用户登录历史
   */
  async getLoginHistory(params: GetLoginHistoryRequest = {}): Promise<ApiResponse<LoginHistoryItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    return httpClient.get<LoginHistoryItem[]>(`${this.endpoint}/login-history`, queryParams);
  }

  /**
   * 获取活动日志
   */
  async getActivityLogs(params: GetActivityLogsRequest = {}): Promise<ApiResponse<ActivityLogItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    return httpClient.get<ActivityLogItem[]>(`${this.endpoint}/activity`, queryParams);
  }

  /**
   * 启用/禁用二步验证
   */
  async toggleTwoFactorAuth(params: ToggleTwoFactorAuthRequest): Promise<ApiResponse<TwoFactorAuthData>> {
    return httpClient.put<TwoFactorAuthData>(`${this.endpoint}/2fa`, params);
  }

  /**
   * 验证二步验证码
   */
  async verifyTwoFactorAuth(params: VerifyTwoFactorAuthRequest): Promise<ApiResponse<VerifyTwoFactorAuthData>> {
    return httpClient.post<VerifyTwoFactorAuthData>(`${this.endpoint}/2fa/verify`, params);
  }
}

// 创建并导出服务实例
export const userInfoService = new UserInfoService();
export default UserInfoService;

// 导出常用类型
export type {
  UserInfo,
  UpdateUserInfoRequest
} from '@/types/generated/api/users/user_profile';
export type {
  ChangePasswordRequest
} from '@/types/generated/api/users/user_password';
export type {
  TrafficStats
} from '@/types/generated/api/users/user_traffic';
export type {
  LoginHistoryItem
} from '@/types/generated/api/users/user_login_history';
export type {
  ActivityLogItem
} from '@/types/generated/api/users/user_activity';
export type {
  TwoFactorAuthData,
  VerifyTwoFactorAuthData
} from '@/types/generated/api/users/user_two_factor'; 