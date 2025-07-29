import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { createServiceConfig } from '@/shared/services/ServiceConfig';
import type { StandardApiResponse } from '@/shared/types/common';

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

// 后端用户详情类型（基于proto定义）
interface BackendUserDetail {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: number;
  userGroup: number[];
  traffic: string;
  trafficResetDate: string;
  forwardRuleConfigLimit: string;
  avatar?: string;
  createTime: string;
  lastLoginTime: string;
  status: string;
}

// 预定义的用户组映射（可以从配置文件或设置API获取）
const USER_GROUP_MAPPING: Record<number, string> = {
  1: '管理员组',
  2: '普通用户组', 
  3: '访客组',
  4: 'VIP用户组',
  5: '测试组'
};

class UserGroupsService extends EnhancedBaseService {
  constructor() {
    super(createServiceConfig('UserGroupsService'));
  }
  private readonly userEndpoint = '/v1/users';

  /**
   * 获取用户组列表 - 基于用户数据聚合生成
   */
  async getUserGroups(params: UserGroupListParams = {}): Promise<StandardApiResponse<UserGroupItem[]>> {
    try {
      // 获取所有用户数据
      const usersResponse = await this.get<BackendUserDetail[]>(this.userEndpoint, {
        page: 1,
        pageSize: 1000 // 获取所有用户来分析用户组
      });

      if (!usersResponse.success || !usersResponse.data) {
        return {
          success: false,
          message: usersResponse.message || '获取用户数据失败'
        };
      }

      // 统计每个用户组的用户数量
      const groupStats = new Map<number, number>();
      
      usersResponse.data.forEach(user => {
        if (user.userGroup && Array.isArray(user.userGroup)) {
          user.userGroup.forEach(groupId => {
            groupStats.set(groupId, (groupStats.get(groupId) || 0) + 1);
          });
        }
      });

      // 生成用户组列表
      const userGroups: UserGroupItem[] = [];
      
      // 从预定义映射生成用户组
      Object.entries(USER_GROUP_MAPPING).forEach(([groupIdStr, groupName]) => {
        const groupId = parseInt(groupIdStr);
        const userCount = groupStats.get(groupId) || 0;
        
        userGroups.push({
          id: groupId,
          groupId: groupIdStr,
          groupName,
          userCount
        });
      });

      // 添加任何在用户数据中发现但不在预定义映射中的用户组
      groupStats.forEach((userCount, groupId) => {
        if (!USER_GROUP_MAPPING[groupId]) {
          userGroups.push({
            id: groupId,
            groupId: groupId.toString(),
            groupName: `用户组 ${groupId}`,
            userCount
          });
        }
      });

      // 应用过滤
      let filteredGroups = userGroups;
      
      if (params.groupId) {
        filteredGroups = filteredGroups.filter(group => 
          group.groupId.toLowerCase().includes(params.groupId!.toLowerCase())
        );
      }
      
      if (params.groupName) {
        filteredGroups = filteredGroups.filter(group => 
          group.groupName.toLowerCase().includes(params.groupName!.toLowerCase())
        );
      }

      // 应用分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedGroups = filteredGroups.slice(start, end);

      return {
        success: true,
        data: paginatedGroups,
        pagination: {
          current: page,
          pageSize,
          total: filteredGroups.length,
          totalPages: Math.ceil(filteredGroups.length / pageSize)
        }
      };

    } catch (error) {
      console.error('获取用户组列表失败:', error);
      return {
        success: false,
        message: '获取用户组列表失败'
      };
    }
  }

  /**
   * 创建新用户组 - 目前只是模拟操作，实际需要通过用户管理来实现
   */
  async createUserGroup(_groupData: CreateUserGroupData): Promise<StandardApiResponse<UserGroupItem>> {
    // 注意：后端当前不支持独立的用户组管理
    // 这里返回一个说明性的错误
    return {
      success: false,
      message: '当前版本不支持独立创建用户组。用户组需要通过用户管理来设置。'
    };
  }

  /**
   * 获取用户组详情
   */
  async getUserGroupById(id: React.Key): Promise<StandardApiResponse<UserGroupItem>> {
    const groupsResponse = await this.getUserGroups();
    
    if (!groupsResponse.success || !groupsResponse.data) {
      return {
        success: false,
        message: '获取用户组失败'
      };
    }

    const group = groupsResponse.data.find(g => g.id.toString() === id.toString());
    
    if (!group) {
      return {
        success: false,
        message: '用户组不存在'
      };
    }

    return {
      success: true,
      data: group
    };
  }

  /**
   * 更新用户组信息 - 目前只是模拟操作
   */
  async updateUserGroup(_id: React.Key, _groupData: UpdateUserGroupData): Promise<StandardApiResponse<UserGroupItem>> {
    return {
      success: false,
      message: '当前版本不支持直接更新用户组。请通过用户管理来修改用户的用户组属性。'
    };
  }

  /**
   * 删除用户组 - 目前只是模拟操作
   */
  async deleteUserGroup(_id: React.Key): Promise<StandardApiResponse<void>> {
    return {
      success: false,
      message: '当前版本不支持删除用户组。用户组会根据用户设置自动管理。'
    };
  }

  /**
   * 批量删除用户组 - 目前只是模拟操作
   */
  async batchDeleteUserGroups(_ids: React.Key[]): Promise<StandardApiResponse<void>> {
    return {
      success: false,
      message: '当前版本不支持批量删除用户组。'
    };
  }

  /**
   * 获取用户组中的用户列表
   */
  async getUsersByGroupId(groupId: string, params: { page?: number; pageSize?: number } = {}): Promise<StandardApiResponse<User[]>> {
    try {
      const usersResponse = await this.get<BackendUserDetail[]>(this.userEndpoint, {
        page: 1,
        pageSize: 1000
      });

      if (!usersResponse.success || !usersResponse.data) {
        return {
          success: false,
          message: '获取用户数据失败'
        };
      }

      // 过滤出属于指定用户组的用户
      const targetGroupId = parseInt(groupId);
      const groupUsers = usersResponse.data
        .filter(user => user.userGroup && user.userGroup.includes(targetGroupId))
        .map(user => ({
          id: user.id,
          username: user.name,
          email: user.email,
          status: user.status,
          createdAt: user.createTime,
          updatedAt: user.lastLoginTime
        }));

      // 应用分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedUsers = groupUsers.slice(start, end);

      return {
        success: true,
        data: paginatedUsers,
        pagination: {
          current: page,
          pageSize,
          total: groupUsers.length,
          totalPages: Math.ceil(groupUsers.length / pageSize)
        }
      };

    } catch (error) {
      console.error('获取用户组用户列表失败:', error);
      return {
        success: false,
        message: '获取用户组用户列表失败'
      };
    }
  }

  /**
   * 将用户添加到用户组 - 需要通过用户更新API实现
   */
  async addUserToGroup(_groupId: string, _userIds: React.Key[]): Promise<StandardApiResponse<void>> {
    return {
      success: false,
      message: '请通过用户管理页面来修改用户的用户组设置。'
    };
  }

  /**
   * 从用户组中移除用户 - 需要通过用户更新API实现
   */
  async removeUserFromGroup(_groupId: string, _userIds: React.Key[]): Promise<StandardApiResponse<void>> {
    return {
      success: false,
      message: '请通过用户管理页面来修改用户的用户组设置。'
    };
  }
}

// 创建并导出服务实例
export const userGroupsService = new UserGroupsService();
export default UserGroupsService; 