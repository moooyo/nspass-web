import { httpClient, ApiResponse } from '@/utils/http-client';
import type { UserListItem, UserDetail } from '@/types/generated/api/users/user_management';

// 用户数据类型定义（使用生成的类型）
export interface User extends UserListItem {
  // 扩展字段
}

// 详细用户信息类型
export interface UserDetailInfo extends UserDetail {
  // 扩展字段
}

export interface CreateUserData {
  name: string;
  email: string;
  role: number; // 使用数字类型的角色
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  status?: string; // 使用字符串类型的状态
  name?: string;
  role?: number;
}

class UserService {
  private readonly endpoint = '/v1/users';

  /**
   * 获取用户列表
   */
  async getUsers(params: UserListParams = {}): Promise<ApiResponse<User[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.status) queryParams.status = params.status;

    return httpClient.get<User[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新用户
   */
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    return httpClient.post<User>(this.endpoint, userData);
  }

  /**
   * 获取用户详情
   */
  async getUserById(id: number): Promise<ApiResponse<UserDetailInfo>> {
    return httpClient.get<UserDetailInfo>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: number, userData: Partial<CreateUserData>): Promise<ApiResponse<UserDetailInfo>> {
    return httpClient.put<UserDetailInfo>(`${this.endpoint}/${id}`, userData);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id: number, newPassword: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/reset-password`, { newPassword });
  }

  /**
   * 重置用户流量
   */
  async resetUserTraffic(id: number): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${id}/reset-traffic`);
  }
}

// 创建并导出服务实例
export const userService = new UserService();
export default UserService; 