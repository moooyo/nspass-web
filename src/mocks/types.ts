// Mock相关的通用类型定义

export interface ServerResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// =================== 用户配置相关类型 ===================
export interface UserConfigData {
  userId: string;
  username: string;
  userGroup: string;
  expireTime: string;
  trafficLimit: number;
  trafficResetType: string;
  ruleLimit: number;
  banned: boolean;
}

export interface BanUserData {
  banned: boolean;
}

export interface BatchOperationData {
  ids: number[];
  updateData?: UserConfigData;
}

// =================== 用户管理相关类型 ===================
export interface UserData {
  id?: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createTime?: string;
}

// =================== 网站配置相关类型 ===================
export interface WebsiteConfigUpdateData {
  siteName?: string;
  allowRegister?: boolean;
  inviteStrategy?: string;
  inviteCode?: string;
  allowLookingGlass?: boolean;
  showAnnouncement?: boolean;
  announcementContent?: string;
}

export interface InviteCodeData {
  code: string;
}

// =================== 认证相关类型 ===================
export interface LoginRequestData {
  username: string;
  password: string;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

// =================== 服务器相关类型 ===================
export interface ServerData {
  id?: number;
  name: string;
  ipv4: string;
  ipv6: string;
  region: string;
  group: string;
  status: string;
  registerTime?: string;
  uploadTraffic?: number;
  downloadTraffic?: number;
}

// =================== 用户组相关类型 ===================
export interface UserGroupData {
  id?: number;
  groupId: string;
  groupName: string;
  userCount: number;
}

export interface BatchUpdateUserGroupData {
  ids: number[];
  updateData: Partial<UserGroupData>;
}

// =================== 用户信息相关类型 ===================
export interface UserInfoUpdateData {
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface UserInfoData extends UserInfoUpdateData {
  id: number;
  role: string;
  status: string;
  createTime: string;
}

// =================== DNS配置相关类型 ===================
export interface DnsConfigData {
  id?: number;
  configName: string;
  provider: string;
  domain: string;
  configParams: string; // JSON字符串
  createdAt: string;
} 