#!/bin/bash

echo "Creating fallback type definitions..."

# 创建类型目录
mkdir -p ./types/generated/api/servers
mkdir -p ./types/generated/api/users
mkdir -p ./types/generated/api/dashboard
mkdir -p ./types/generated/api/dns
mkdir -p ./types/generated/api/egress
mkdir -p ./types/generated/api/forwardPath
mkdir -p ./types/generated/api/routes
mkdir -p ./types/generated/api/rules
mkdir -p ./types/generated/api/iptables
mkdir -p ./types/generated/api/settings
mkdir -p ./types/generated/model

# 创建服务器管理相关类型
cat > ./types/generated/api/servers/server_management.ts << 'EOF'
// Fallback type definitions for server management
export interface ServerItem {
  id?: string;
  name?: string;
  status?: string;
  address?: string;
  port?: number;
  online?: boolean;
}

export interface ServerGroupInfo {
  id?: string;
  name?: string;
  servers?: ServerItem[];
}

export interface ServerStats {
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkIn?: number;
  networkOut?: number;
  uptime?: number;
}

export interface CreateServerRequest {
  name?: string;
  address?: string;
  port?: number;
}

export interface UpdateServerRequest {
  id?: string;
  name?: string;
  address?: string;
  port?: number;
}
EOF

# 创建用户认证相关类型
cat > ./types/generated/api/users/user_auth.ts << 'EOF'
// Fallback type definitions for user auth
export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginResponse {
  token?: string;
  user?: {
    id?: string;
    username?: string;
  };
}
EOF

cat > ./types/generated/api/users/user_management.ts << 'EOF'
// Fallback type definitions for user management
export interface User {
  id?: string;
  username?: string;
  email?: string;
}
EOF

cat > ./types/generated/api/users/user_profile.ts << 'EOF'
// Fallback type definitions for user profile
export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
}
EOF

cat > ./types/generated/api/users/user_password.ts << 'EOF'
// Fallback type definitions for user password
export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}
EOF

cat > ./types/generated/api/users/user_traffic.ts << 'EOF'
// Fallback type definitions for user traffic
export interface UserTraffic {
  upload?: number;
  download?: number;
}
EOF

cat > ./types/generated/api/users/user_login_history.ts << 'EOF'
// Fallback type definitions for user login history
export interface LoginHistory {
  id?: string;
  timestamp?: string;
  ip?: string;
}
EOF

cat > ./types/generated/api/users/user_activity.ts << 'EOF'
// Fallback type definitions for user activity
export interface UserActivity {
  id?: string;
  action?: string;
  timestamp?: string;
}
EOF

cat > ./types/generated/api/users/user_two_factor.ts << 'EOF'
// Fallback type definitions for user two factor
export interface TwoFactorConfig {
  enabled?: boolean;
  secret?: string;
}
EOF

cat > ./types/generated/api/users/user_avatar.ts << 'EOF'
// Fallback type definitions for user avatar
export interface UserAvatar {
  url?: string;
}
EOF

cat > ./types/generated/api/users/user_account.ts << 'EOF'
// Fallback type definitions for user account
export interface UserAccount {
  id?: string;
  username?: string;
}
EOF

cat > ./types/generated/api/users/user_passkey.ts << 'EOF'
// Fallback type definitions for user passkey
export interface Passkey {
  id?: string;
  name?: string;
}
EOF

# 创建仪表板相关类型
cat > ./types/generated/api/dashboard/dashboard_service.ts << 'EOF'
// Fallback type definitions for dashboard service
export interface DashboardStats {
  userCount?: number;
  serverCount?: number;
  routeCount?: number;
}

export interface SystemInfo {
  version?: string;
  uptime?: number;
}
EOF

# 创建模型类型
cat > ./types/generated/model/egressItem.ts << 'EOF'
// Fallback type definitions for egress item
export interface LocalEgressItem {
  id?: string;
  egressName?: string;
  serverId?: string;
  egressMode?: string;
  targetAddress?: string;
  forwardType?: string;
  destAddress?: string;
  destPort?: number;
  password?: string;
  supportUdp?: boolean;
  port?: number;
  egressId?: string;
}
EOF

cat > ./types/generated/model/egress.ts << 'EOF'
// Fallback type definitions for egress
export interface Egress {
  id?: string;
  name?: string;
  items?: any[];
}
EOF

cat > ./types/generated/model/route.ts << 'EOF'
// Fallback type definitions for route
export interface Route {
  id?: string;
  name?: string;
  path?: string;
}
EOF

cat > ./types/generated/model/forwardPath.ts << 'EOF'
// Fallback type definitions for forward path
export interface ForwardPath {
  id?: string;
  path?: string;
  rules?: any[];
}
EOF

cat > ./types/generated/model/iptables.ts << 'EOF'
// Fallback type definitions for iptables
export interface IptablesRule {
  id?: string;
  rule?: string;
}
EOF

cat > ./types/generated/model/dnsConfig.ts << 'EOF'
// Fallback type definitions for DNS config
export interface DnsConfig {
  servers?: string[];
  domains?: string[];
}
EOF

# 创建其他 API 类型
cat > ./types/generated/api/dns/dns_config.ts << 'EOF'
// Fallback type definitions for DNS config API
export interface DnsConfigRequest {
  servers?: string[];
}
EOF

cat > ./types/generated/api/egress/egress_management.ts << 'EOF'
// Fallback type definitions for egress management API
export interface EgressRequest {
  name?: string;
}
EOF

cat > ./types/generated/api/forwardPath/forward_path_rule.ts << 'EOF'
// Fallback type definitions for forward path rule API
export interface ForwardPathRuleRequest {
  path?: string;
}
EOF

cat > ./types/generated/api/routes/route_management.ts << 'EOF'
// Fallback type definitions for route management API
export interface ListRoutesRequest {
  page?: number;
  pageSize?: number;
}
EOF

cat > ./types/generated/api/rules/rule_management.ts << 'EOF'
// Fallback type definitions for rule management API
export interface RuleRequest {
  name?: string;
}
EOF

cat > ./types/generated/api/iptables/iptables_config.ts << 'EOF'
// Fallback type definitions for iptables config API
export interface IptablesConfigRequest {
  rules?: string[];
}
EOF

cat > ./types/generated/api/settings/settings_management.ts << 'EOF'
// Fallback type definitions for settings management API
export interface SettingsRequest {
  key?: string;
  value?: string;
}
EOF

echo "Fallback type definitions created successfully!"
