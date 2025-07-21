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

# 创建基本的类型文件
cat > ./types/generated/api/servers/server_management.ts << 'EOF'
// Fallback type definitions for server management
export interface ServerItem {
  id?: string;
  name?: string;
  status?: string;
}

export interface ServerGroupInfo {
  id?: string;
  name?: string;
}

export interface ServerStats {
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
}
EOF

cat > ./types/generated/api/users/user_auth.ts << 'EOF'
// Fallback type definitions for user auth
export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginResponse {
  token?: string;
}
EOF

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

cat > ./types/generated/model/route.ts << 'EOF'
// Fallback type definitions for route
export interface Route {
  id?: string;
  name?: string;
  path?: string;
}
EOF

echo "Fallback type definitions created successfully!"
