import { httpClient, ApiResponse } from '@/utils/http-client';

// 流量重置方式枚举
export type TrafficResetType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

// 用户组类型
export type UserGroup = 'admin' | 'user' | 'guest';

// 用户项数据类型定义
export interface UserConfigItem {
  id: React.Key;
  userId: string;
  username: string;
  userGroup: UserGroup;
  expireTime: string;
  trafficLimit: number; // MB
  trafficResetType: TrafficResetType;
  ruleLimit: number;
  banned: boolean;
}

// 创建用户数据类型
export interface CreateUserConfigData {
  userId: string;
  username: string;
  userGroup: UserGroup;
  expireTime: string;
  trafficLimit: number;
  trafficResetType: TrafficResetType;
  ruleLimit: number;
  banned?: boolean;
}

// 查询参数类型
export interface UserConfigListParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  username?: string;
  userGroup?: UserGroup;
  banned?: boolean;
}

// 更新用户数据类型
export type UpdateUserConfigData = Partial<CreateUserConfigData>;

class UsersConfigService {
  private readonly endpoint = '/users/settings';

  /**
   * 获取用户配置列表
   */
  async getUserConfigs(params: UserConfigListParams = {}): Promise<ApiResponse<UserConfigItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.userId) queryParams.userId = params.userId;
    if (params.username) queryParams.username = params.username;
    if (params.userGroup) queryParams.userGroup = params.userGroup;
    if (params.banned !== undefined) queryParams.banned = params.banned.toString();

    return httpClient.get<UserConfigItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新用户配置
   */
  async createUserConfig(userData: CreateUserConfigData): Promise<ApiResponse<UserConfigItem>> {
    return httpClient.post<UserConfigItem>(this.endpoint, userData);
  }

  /**
   * 获取用户配置详情
   */
  async getUserConfigById(id: React.Key): Promise<ApiResponse<UserConfigItem>> {
    return httpClient.get<UserConfigItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新用户配置信息
   */
  async updateUserConfig(id: React.Key, userData: UpdateUserConfigData): Promise<ApiResponse<UserConfigItem>> {
    return httpClient.put<UserConfigItem>(`${this.endpoint}/${id}`, userData);
  }

  /**
   * 删除用户配置
   */
  async deleteUserConfig(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 封禁/解除封禁用户
   */
  async toggleBanUser(id: React.Key, banned: boolean): Promise<ApiResponse<UserConfigItem>> {
    return httpClient.put<UserConfigItem>(`${this.endpoint}/${id}/ban`, { banned });
  }

  /**
   * 重置用户流量
   */
  async resetUserTraffic(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/resetTraffic`);
  }

  /**
   * 发送邀请注册链接
   */
  async inviteUser(id: React.Key): Promise<ApiResponse<{ inviteLink: string }>> {
    return httpClient.post<{ inviteLink: string }>(`${this.endpoint}/${id}/invite`);
  }

  /**
   * 批量删除用户配置
   */
  async batchDeleteUserConfigs(ids: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batchDelete`, { ids });
  }

  /**
   * 批量更新用户配置
   */
  async batchUpdateUserConfigs(
    ids: React.Key[], 
    updateData: UpdateUserConfigData
  ): Promise<ApiResponse<UserConfigItem[]>> {
    return httpClient.put<UserConfigItem[]>(`${this.endpoint}/batchUpdate`, { 
      ids, 
      updateData 
    });
  }
}

// 创建并导出服务实例
export const usersConfigService = new UsersConfigService();
export default UsersConfigService; 