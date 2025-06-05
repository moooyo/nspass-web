// 主handlers文件 - 合并所有分类的handlers
import {
  userConfigHandlers,
  websiteConfigHandlers,
  userHandlers,
  serverHandlers,
  userGroupHandlers,
  userInfoHandlers,
  authHandlers,
  dashboardHandlers,
  miscHandlers
} from '@mock/handlers/index';

// 合并所有handlers
export const handlers = [
  ...userConfigHandlers,     // 用户配置管理 (/api/config/users)
  ...websiteConfigHandlers,  // 网站配置 (/api/config/website)
  ...userHandlers,           // 用户管理 (https://api.example.com/users)
  ...serverHandlers,         // 服务器管理 (https://api.example.com/servers)
  ...userGroupHandlers,      // 用户组管理 (https://api.example.com/config/user-groups)
  ...userInfoHandlers,       // 用户信息 (https://api.example.com/user/info)
  ...authHandlers,           // 认证 (https://api.example.com/auth)
  ...dashboardHandlers,      // 仪表盘 (https://api.example.com/dashboard)
  ...miscHandlers,           // 其他杂项
]; 