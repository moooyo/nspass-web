import { RouteItem } from '@/services/routes';
import { Protocol, ShadowsocksMethod, SnellVersion, RouteType, RouteStatus } from '@/types/generated/model/route';

// 模拟系统生成线路数据
export const mockSystemRoutes: RouteItem[] = [
  {
    id: 101,
    routeName: '系统线路01',
    entryPoint: '198.51.100.1',
    port: 443,
    protocol: Protocol.PROTOCOL_SHADOWSOCKS,
    protocolParams: {
      shadowsocks: {
        method: ShadowsocksMethod.SHADOWSOCKS_METHOD_AES_256_GCM,
        password: 'sys_password_001',
        udpSupport: true,
        tcpFastOpen: false,
        otherParams: '{"timeout": 600, "fast_open": false}',
      }
    },
    type: RouteType.ROUTE_TYPE_SYSTEM,
    status: RouteStatus.ROUTE_STATUS_ACTIVE,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
    updatedAt: Math.floor(Date.now() / 1000) - 3600,
    createdBy: 'system',
    description: '系统自动生成线路',
  },
  {
    id: 102,
    routeName: '系统线路02',
    entryPoint: '192.0.2.1',
    port: 8443,
    protocol: Protocol.PROTOCOL_SNELL,
    protocolParams: {
      snell: {
        version: SnellVersion.SNELL_VERSION_V5,
        psk: 'sys_snell_psk_002',
        udpSupport: false,
        tcpFastOpen: true,
        otherParams: '{"obfs": "http", "obfs_host": "microsoft.com"}',
      }
    },
    type: RouteType.ROUTE_TYPE_SYSTEM,
    status: RouteStatus.ROUTE_STATUS_ACTIVE,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 8,
    updatedAt: Math.floor(Date.now() / 1000) - 1800,
    createdBy: 'system',
    description: '系统Snell线路',
  },
  {
    id: 103,
    routeName: '系统线路03',
    entryPoint: '203.0.113.100',
    port: 9443,
    protocol: Protocol.PROTOCOL_SHADOWSOCKS,
    protocolParams: {
      shadowsocks: {
        method: ShadowsocksMethod.SHADOWSOCKS_METHOD_CHACHA20_IETF_POLY1305,
        password: 'sys_chacha_password_003',
        udpSupport: true,
        tcpFastOpen: true,
        otherParams: '{"timeout": 300, "reuse_port": true}',
      }
    },
    type: RouteType.ROUTE_TYPE_SYSTEM,
    status: RouteStatus.ROUTE_STATUS_ACTIVE,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
    updatedAt: Math.floor(Date.now() / 1000) - 900,
    createdBy: 'system',
    description: 'ChaCha20-IETF-Poly1305加密线路',
  },
];

// 导出所有系统线路（之前的 mockRoutes 现在只包含系统线路）
export const mockRoutes: RouteItem[] = [...mockSystemRoutes];

// 生成配置的示例数据
export const mockConfigs = {
  [Protocol.PROTOCOL_SHADOWSOCKS]: {
    json: (route: RouteItem) => {
      const shadowsocksParams = route.protocolParams?.shadowsocks;
      if (!shadowsocksParams) return '{}';
      
      return JSON.stringify({
        server: route.entryPoint,
        server_port: route.port || 8388,
        method: shadowsocksParams.method?.toLowerCase().replace('shadowsocks_method_', '').replace(/_/g, '-') || 'aes-256-gcm',
        password: shadowsocksParams.password,
        timeout: 300,
        fast_open: shadowsocksParams.tcpFastOpen,
        udp: shadowsocksParams.udpSupport,
        ...(shadowsocksParams.otherParams ? JSON.parse(shadowsocksParams.otherParams) : {})
      }, null, 2);
    },
    
    uri: (route: RouteItem) => {
      const shadowsocksParams = route.protocolParams?.shadowsocks;
      if (!shadowsocksParams) return '';
      
      const method = shadowsocksParams.method?.toLowerCase().replace('shadowsocks_method_', '').replace(/_/g, '-') || 'aes-256-gcm';
      const userInfo = Buffer.from(`${method}:${shadowsocksParams.password}`).toString('base64');
      return `ss://${userInfo}@${route.entryPoint}:${route.port}#${encodeURIComponent(route.routeName || '')}`;
    },
    
    yaml: (route: RouteItem) => {
      const shadowsocksParams = route.protocolParams?.shadowsocks;
      if (!shadowsocksParams) return '';
      
      const method = shadowsocksParams.method?.toLowerCase().replace('shadowsocks_method_', '').replace(/_/g, '-') || 'aes-256-gcm';
      return `
name: "${route.routeName}"
type: ss
server: ${route.entryPoint}
port: ${route.port}
cipher: ${method}
password: "${shadowsocksParams.password}"
udp: ${shadowsocksParams.udpSupport}
`.trim();
    }
  },
  
  [Protocol.PROTOCOL_SNELL]: {
    json: (route: RouteItem) => {
      const snellParams = route.protocolParams?.snell;
      if (!snellParams) return '{}';
      
      const version = snellParams.version === SnellVersion.SNELL_VERSION_V5 ? 5 : 4;
      return JSON.stringify({
        name: route.routeName,
        type: 'snell',
        server: route.entryPoint,
        port: route.port || 6333,
        psk: snellParams.psk,
        version: version,
        udp: snellParams.udpSupport,
        ...(snellParams.otherParams ? JSON.parse(snellParams.otherParams) : {})
      }, null, 2);
    },
    
    yaml: (route: RouteItem) => {
      const snellParams = route.protocolParams?.snell;
      if (!snellParams) return '';
      
      const version = snellParams.version === SnellVersion.SNELL_VERSION_V5 ? 5 : 4;
      return `
name: "${route.routeName}"
type: snell
server: ${route.entryPoint}
port: ${route.port}
psk: "${snellParams.psk}"
version: ${version}
udp: ${snellParams.udpSupport}
`.trim();
    }
  }
}; 