// 使用 proto 生成类型的 User Info Service
import { httpClient, ApiResponse } from '@/utils/http-client';
import type {
  UserInfo,
  UpdateUserInfoRequest,
  ChangePasswordRequest,
  TrafficStats,
  LoginHistoryItem,
  ActivityLogItem,
  TwoFactorAuthData,
  VerifyTwoFactorAuthData,
  GetLoginHistoryRequest,
  GetActivityLogsRequest,
  ToggleTwoFactorAuthRequest,
  VerifyTwoFactorAuthRequest,
  DeleteAccountRequest,
  GetCurrentUserInfoResponse,
  UpdateCurrentUserInfoResponse,
  ChangePasswordResponse,
  UploadAvatarResponse,
  GetTrafficStatsResponse,
  GetLoginHistoryResponse,
  GetActivityLogsResponse,
  ResetTrafficResponse,
  ToggleTwoFactorAuthResponse,
  VerifyTwoFactorAuthResponse,
  DeleteAccountResponse
} from '@/types/generated/api/users/user_info';
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

class UserInfoService {
  private readonly endpoint = '/user/info';

  /**
   * 获取当前用户信息
   */
  async getCurrentUserInfo(): Promise<GetCurrentUserInfoResponse> {
    const response = await httpClient.get<UserInfo>(this.endpoint);
    return toProtoResponse(response);
  }

  /**
   * 更新当前用户信息
   */
  async updateCurrentUserInfo(userData: UpdateUserInfoRequest): Promise<UpdateCurrentUserInfoResponse> {
    const response = await httpClient.put<UserInfo>(this.endpoint, userData);
    return toProtoResponse(response);
  }

  /**
   * 修改用户密码
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await httpClient.put<void>(`${this.endpoint}/password`, passwordData);
    return toProtoResponse(response);
  }

  /**
   * 上传用户头像
   */
  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // 使用原生 fetch 处理文件上传
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}${this.endpoint}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
      },
    });
    
    const jsonResponse = await uploadResponse.json();
    return toProtoResponse(jsonResponse);
  }

  /**
   * 获取用户流量使用统计
   */
  async getTrafficStats(): Promise<GetTrafficStatsResponse> {
    const response = await httpClient.get<TrafficStats>(`${this.endpoint}/traffic-stats`);
    return toProtoResponse(response);
  }

  /**
   * 获取用户登录历史
   */
  async getLoginHistory(params: GetLoginHistoryRequest = {}): Promise<GetLoginHistoryResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    const response = await httpClient.get<LoginHistoryItem[]>(`${this.endpoint}/login-history`, queryParams);
    return toProtoResponse(response);
  }

  /**
   * 获取用户活动日志
   */
  async getActivityLogs(params: GetActivityLogsRequest = {}): Promise<GetActivityLogsResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    const response = await httpClient.get<ActivityLogItem[]>(`${this.endpoint}/activity-logs`, queryParams);
    return toProtoResponse(response);
  }

  /**
   * 重置用户流量
   */
  async resetTraffic(): Promise<ResetTrafficResponse> {
    const response = await httpClient.post<void>(`${this.endpoint}/reset-traffic`);
    return toProtoResponse(response);
  }

  /**
   * 启用/禁用二步验证
   */
  async toggleTwoFactorAuth(params: ToggleTwoFactorAuthRequest): Promise<ToggleTwoFactorAuthResponse> {
    const response = await httpClient.put<TwoFactorAuthData>(`${this.endpoint}/2fa`, params);
    return toProtoResponse(response);
  }

  /**
   * 验证二步验证码
   */
  async verifyTwoFactorAuth(params: VerifyTwoFactorAuthRequest): Promise<VerifyTwoFactorAuthResponse> {
    const response = await httpClient.post<VerifyTwoFactorAuthData>(`${this.endpoint}/2fa/verify`, params);
    return toProtoResponse(response);
  }

  /**
   * 注销账户
   */
  async deleteAccount(params: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    const response = await httpClient.post<void>(`${this.endpoint}/delete-account`, params);
    return toProtoResponse(response);
  }
}

// 创建并导出服务实例
export const userInfoService = new UserInfoService();
export default UserInfoService;

// 导出常用类型
export type {
  UserInfo,
  UpdateUserInfoRequest,
  ChangePasswordRequest,
  TrafficStats,
  LoginHistoryItem,
  ActivityLogItem,
  TwoFactorAuthData,
  VerifyTwoFactorAuthData
} from '@/types/generated/api/users/user_info'; 