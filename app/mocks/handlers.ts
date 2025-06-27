// 主handlers文件 - 合并所有分类的handlers
import {
  userConfigHandlers,
  websiteConfigHandlers,
  usersHandlers,
  serverHandlers,
  userGroupHandlers,
  userInfoHandlers,
  authHandlers,
  dashboardHandlers,
  rulesHandlers,
  userManagementHandlers,
  routeHandlers,
  miscHandlers
} from '@mock/handlers/index';

// 合并所有handlers
export const handlers = [
  ...authHandlers,           // 认证 (/api/v1/auth)
  ...dashboardHandlers,      // 仪表盘 (/api/v1/dashboard)
  ...rulesHandlers,          // 规则管理 (/api/v1/rules)
  ...routeHandlers,          // 线路管理 (/api/routes)
  ...userManagementHandlers, // 用户管理 (/api/v1/user)
  ...userConfigHandlers,     // 用户配置管理 (/api/config/users)
  ...websiteConfigHandlers,  // 网站配置 (/api/config/website)
  ...usersHandlers,          // 用户管理 (https://api.example.com/users)
  ...serverHandlers,         // 服务器管理 (https://api.example.com/servers)
  ...userGroupHandlers,      // 用户组管理 (https://api.example.com/config/user-groups)
  ...userInfoHandlers,       // 用户信息 (https://api.example.com/user/info)
  ...miscHandlers,           // 其他杂项
]; 