import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { createServiceConfig } from '@/shared/services/ServiceConfig';
import type { StandardApiResponse } from '@/shared/types/common';
import type { 
  UserListItem, 
  UserDetail,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersRequest,
} from '@/types/generated/api/users/user_management';

// 用户数据类型定义（使用生成的类型）
export type User = UserListItem;

// 详细用户信息类型
export type UserDetailInfo = UserDetail;

// 重新导出生成的类型，提供更简洁的导入路径
export type CreateUserData = CreateUserRequest;
export type UpdateUserData = UpdateUserRequest;
export type UserListParams = GetUsersRequest;

class UserService extends EnhancedBaseService {
  private readonly endpoint = '/v1/users';

  constructor() {
    super(createServiceConfig('user'));
  }

  /**
   * 获取用户列表
   */
  async getUsers(params: UserListParams = {}): Promise<StandardApiResponse<User[]>> {
    const queryParams: Record<string, string> = {};

    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.status) queryParams.status = params.status;

    return this.get<User[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新用户
   */
  async createUser(userData: CreateUserData): Promise<StandardApiResponse<User>> {
    return this.post<User>(this.endpoint, userData);
  }

  /**
   * 获取用户详情
   */
  async getUserById(id: number): Promise<StandardApiResponse<UserDetailInfo>> {
    return this.get<UserDetailInfo>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: number, userData: Partial<CreateUserData>): Promise<StandardApiResponse<UserDetailInfo>> {
    return this.put<UserDetailInfo>(`${this.endpoint}/${id}`, userData);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<StandardApiResponse<void>> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id: number, newPassword: string): Promise<StandardApiResponse<void>> {
    return this.post<void>(`${this.endpoint}/${id}/reset-password`, { newPassword });
  }

  /**
   * 重置用户流量
   */
  async resetUserTraffic(id: number): Promise<StandardApiResponse<void>> {
    return this.post<void>(`${this.endpoint}/${id}/reset-traffic`);
  }
}

// 创建并导出服务实例
export const userService = new UserService();
export default UserService; 