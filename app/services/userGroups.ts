import { httpClient, ApiResponse } from '@/utils/http-client';

// 用户数据类型定义
export interface User {
  id: React.Key;
  username: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 用户组数据类型定义
export interface UserGroupItem {
  id: React.Key;
  groupId: string;
  groupName: string;
  userCount: number;
}

// 创建用户组数据类型
export interface CreateUserGroupData {
  groupId: string;
  groupName: string;
  userCount?: number;
}

// 查询参数类型
export interface UserGroupListParams {
  page?: number;
  pageSize?: number;
  groupId?: string;
  groupName?: string;
}

// 更新用户组数据类型
export type UpdateUserGroupData = Partial<CreateUserGroupData>;

class UserGroupsService {
  private readonly endpoint = '/config/user-groups';

  /**
   * 获取用户组列表
   */
  async getUserGroups(params: UserGroupListParams = {}): Promise<ApiResponse<UserGroupItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.groupId) queryParams.groupId = params.groupId;
    if (params.groupName) queryParams.groupName = params.groupName;

    return httpClient.get<UserGroupItem[]>(this.endpoint, queryParams);
  }

  /**
   * 创建新用户组
   */
  async createUserGroup(groupData: CreateUserGroupData): Promise<ApiResponse<UserGroupItem>> {
    return httpClient.post<UserGroupItem>(this.endpoint, groupData);
  }

  /**
   * 获取用户组详情
   */
  async getUserGroupById(id: React.Key): Promise<ApiResponse<UserGroupItem>> {
    return httpClient.get<UserGroupItem>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新用户组信息
   */
  async updateUserGroup(id: React.Key, groupData: UpdateUserGroupData): Promise<ApiResponse<UserGroupItem>> {
    return httpClient.put<UserGroupItem>(`${this.endpoint}/${id}`, groupData);
  }

  /**
   * 删除用户组
   */
  async deleteUserGroup(id: React.Key): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * 批量删除用户组
   */
  async batchDeleteUserGroups(ids: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/batch-delete`, { ids });
  }

  /**
   * 获取用户组中的用户列表
   */
  async getUsersByGroupId(groupId: string, params: { page?: number; pageSize?: number } = {}): Promise<ApiResponse<User[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.page) queryParams.page = params.page.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    return httpClient.get<User[]>(`${this.endpoint}/${groupId}/users`, queryParams);
  }

  /**
   * 将用户添加到用户组
   */
  async addUserToGroup(groupId: string, userIds: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${groupId}/users`, { userIds });
  }

  /**
   * 从用户组中移除用户
   */
  async removeUserFromGroup(groupId: string, userIds: React.Key[]): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/${groupId}/users/remove`, { userIds });
  }
}

// 创建并导出服务实例
export const userGroupsService = new UserGroupsService();
export default UserGroupsService; 