// 主handlers文件 - 合并所有分类的handlers
// 在生产环境中禁用所有handlers

// 检查是否在生产环境或MSW被禁用
const isMSWDisabled = import.meta.env.PROD || import.meta.env.VITE_ENABLE_MSW !== 'true';

// 条件导入和导出handlers
export const handlers: any[] = isMSWDisabled ? [] : (() => {
  // 仅在开发环境下导入和合并handlers
  const {
    userConfigHandlers,
    websiteConfigHandlers,
    usersHandlers,
    serverHandlers,
    userGroupHandlers,
    userInfoHandlers,
    authHandlers,
    dashboardHandlers,
    userManagementHandlers,
    routeHandlers,
    miscHandlers,
    dnsConfigHandlers,
    passkeyHandlers,
    egressHandlers,
    iptablesHandlers
  } = require('@mock/handlers/index');
  
  const { forwardPathRulesHandlers } = require('@mock/handlers/forwardPathRules');

  // 合并所有handlers
  return [
    ...authHandlers,           // 认证 (/api/v1/auth)
    ...passkeyHandlers,        // Passkey认证 (/api/v1/auth/passkey, /api/v1/user/passkeys)
    ...dashboardHandlers,      // 仪表盘 (/api/v1/dashboard)
    ...forwardPathRulesHandlers, // 转发路径规则管理 (/v1/forward-path-rules)
    ...routeHandlers,          // 线路管理 (/api/routes)
    ...egressHandlers,         // 出口配置管理 (/api/v1/egress)
    ...iptablesHandlers,       // iptables配置管理 (/api/v1/servers/:serverId/iptables/configs, /v1/forward-path-rules/:ruleId/iptables)
    ...userManagementHandlers, // 用户管理 (/api/v1/user)
    ...userConfigHandlers,     // 用户配置管理 (/api/config/users)
    ...websiteConfigHandlers,  // 网站配置 (/api/config/website)
    ...usersHandlers,          // 用户管理 (https://api.example.com/users)
    ...serverHandlers,         // 服务器管理 (https://api.example.com/servers)
    ...userGroupHandlers,      // 用户组管理 (/v1/user-groups)
    ...userInfoHandlers,       // 用户信息 (/v1/profile)
    ...dnsConfigHandlers,      // DNS配置管理 (/api/v1/dns/configs)
    ...miscHandlers,           // 其他杂项
  ]; 
})(); 