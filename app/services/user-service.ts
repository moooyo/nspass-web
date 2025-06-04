import { httpClient, ApiResponse } from '@/utils/http-client';

// 用户数据类型定义
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createTime: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  status?: 'active' | 'inactive';
}

class UserService {
  private readonly endpoint = '/users';

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
  async getUserById(id: number): Promise<ApiResponse<User>> {
    return httpClient.get<User>(`${this.endpoint}/${id}`);
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: number, userData: Partial<CreateUserData>): Promise<ApiResponse<User>> {
    return httpClient.put<User>(`${this.endpoint}/${id}`, userData);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${this.endpoint}/${id}`);
  }
}

// 创建并导出服务实例
export const userService = new UserService();
export default UserService; 