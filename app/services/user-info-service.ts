import { httpClient, ApiResponse } from '@/utils/http-client';

// 用户信息数据类型定义
export interface UserInfo {
  id: number;
  name: string;
  role: string;
  userGroup: string;
  traffic: string;
  trafficResetDate: string;
  forwardRuleConfigLimit: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createTime: string;
  lastLoginTime: string;
}

// 更新用户信息数据类型
export interface UpdateUserInfoData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// 修改密码数据类型
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class UserInfoService {
  private readonly endpoint = '/user/info';

  /**
   * 获取当前用户信息
   */
  async getCurrentUserInfo(): Promise<ApiResponse<UserInfo>> {
    return httpClient.get<UserInfo>(this.endpoint);
  }

  /**
   * 更新当前用户信息
   */
  async updateCurrentUserInfo(userData: UpdateUserInfoData): Promise<ApiResponse<UserInfo>> {
    return httpClient.put<UserInfo>(this.endpoint, userData);
  }

  /**
   * 修改用户密码
   */
  async changePassword(passwordData: ChangePasswordData): Promise<ApiResponse<void>> {
    return httpClient.put<void>(`${this.endpoint}/password`, passwordData);
  }

  /**
   * 上传用户头像
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // 使用原生 fetch 处理文件上传
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}${this.endpoint}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
      },
    });
    
    return response.json();
  }

  /**
   * 获取用户流量使用统计
   */
  async getTrafficStats(): Promise<ApiResponse<{
    totalUsed: number;
    totalLimit: number;
    dailyUsage: { date: string; upload: number; download: number }[];
    monthlyUsage: { month: string; upload: number; download: number }[];
  }>> {
    return httpClient.get(`${this.endpoint}/traffic-stats`);
  }

  /**
   * 获取用户登录历史
   */
  async getLoginHistory(params: { page?: number; pageSize?: number } = {}): Promise<ApiResponse<{
    loginTime: string;
    ip: string;
    userAgent: string;
    location: string;
    success: boolean;
  }[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    return httpClient.get(`${this.endpoint}/login-history`, queryParams);
  }

  /**
   * 获取用户活动日志
   */
  async getActivityLogs(params: { page?: number; pageSize?: number } = {}): Promise<ApiResponse<{
    timestamp: string;
    action: string;
    description: string;
    ip: string;
    userAgent: string;
  }[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    return httpClient.get(`${this.endpoint}/activity-logs`, queryParams);
  }

  /**
   * 重置用户流量
   */
  async resetTraffic(): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/reset-traffic`);
  }

  /**
   * 启用/禁用二步验证
   */
  async toggleTwoFactorAuth(enabled: boolean): Promise<ApiResponse<{
    qrCode?: string;
    backupCodes?: string[];
  }>> {
    return httpClient.put(`${this.endpoint}/2fa`, { enabled });
  }

  /**
   * 验证二步验证码
   */
  async verifyTwoFactorAuth(code: string): Promise<ApiResponse<{ verified: boolean }>> {
    return httpClient.post<{ verified: boolean }>(`${this.endpoint}/2fa/verify`, { code });
  }

  /**
   * 注销账户
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/delete-account`, { password });
  }
}

// 创建并导出服务实例
export const userInfoService = new UserInfoService();
export default UserInfoService; 