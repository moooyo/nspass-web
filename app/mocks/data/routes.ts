import { RouteItem } from '@/services/routes';

// 模拟自定义线路数据
export const mockCustomRoutes: RouteItem[] = [
  {
    id: '1',
    routeId: 'route001',
    routeName: '自定义线路01',
    entryPoint: '203.0.113.1',
    protocol: 'shadowsocks',
    udpSupport: true,
    tcpFastOpen: false,
    password: 'password123456',
    port: '8388',
    method: 'aes-256-gcm',
    otherParams: '{"timeout": 300, "fast_open": false}',
  },
  {
    id: '2',
    routeId: 'route002',
    routeName: '自定义线路02',
    entryPoint: 'example.com',
    protocol: 'snell',
    udpSupport: true,
    tcpFastOpen: true,
    password: 'snellpsk12345678',
    port: '6333',
    snellVersion: '4',
    otherParams: '{"obfs": "tls", "obfs_host": "bing.com"}',
  },
  {
    id: '3',
    routeId: 'route003',
    routeName: '香港线路',
    entryPoint: 'hk.example.com',
    protocol: 'shadowsocks',
    udpSupport: true,
    tcpFastOpen: true,
    password: 'hk_ss_password_2024',
    port: '443',
    method: 'chacha20-ietf-poly1305',
    otherParams: '{"timeout": 600, "plugin": "obfs-local", "plugin-opts": "obfs=tls"}',
  },
  {
    id: '4',
    routeId: 'route004',
    routeName: '美国线路',
    entryPoint: 'us.proxy.example.com',
    protocol: 'snell',
    udpSupport: false,
    tcpFastOpen: true,
    password: 'us_snell_psk_secret',
    port: '8443',
    snellVersion: '5',
    otherParams: '{"obfs": "http", "obfs_host": "cloudflare.com"}',
  },
  {
    id: '5',
    routeId: 'route005',
    routeName: '日本线路',
    entryPoint: 'jp.example.org',
    protocol: 'shadowsocks',
    udpSupport: true,
    tcpFastOpen: false,
    password: 'jp_shadowsocks_secret_key',
    port: '9443',
    method: 'aes-128-gcm',
    otherParams: '{"timeout": 300, "reuse_port": true}',
  },
];

// 模拟系统生成线路数据
export const mockSystemRoutes: RouteItem[] = [
  {
    id: '101',
    routeId: 'sys_route001',
    routeName: '系统线路01',
    entryPoint: '198.51.100.1',
    protocol: 'shadowsocks',
    udpSupport: true,
    tcpFastOpen: false,
    password: 'sys_password_001',
    port: '443',
    method: 'aes-256-gcm',
    otherParams: '{"timeout": 600, "fast_open": false}',
  },
  {
    id: '102',
    routeId: 'sys_route002',
    routeName: '系统线路02',
    entryPoint: '192.0.2.1',
    protocol: 'snell',
    udpSupport: false,
    tcpFastOpen: true,
    password: 'sys_snell_psk_002',
    port: '8443',
    snellVersion: '5',
    otherParams: '{"obfs": "http", "obfs_host": "microsoft.com"}',
  },
  {
    id: '103',
    routeId: 'sys_route003',
    routeName: '系统线路03',
    entryPoint: '203.0.113.50',
    protocol: 'shadowsocks',
    udpSupport: true,
    tcpFastOpen: true,
    password: 'sys_auto_generated_pwd_003',
    port: '8388',
    method: 'chacha20-ietf-poly1305',
    otherParams: '{"timeout": 300, "no_delay": true}',
  },
  {
    id: '104',
    routeId: 'sys_route004',
    routeName: '系统线路04',
    entryPoint: 'auto.system.example.com',
    protocol: 'snell',
    udpSupport: true,
    tcpFastOpen: false,
    password: 'sys_snell_auto_004',
    port: '443',
    snellVersion: '4',
    otherParams: '{"obfs": "tls", "obfs_host": "github.com"}',
  },
];

// 合并所有线路数据
export const mockAllRoutes: RouteItem[] = [...mockCustomRoutes, ...mockSystemRoutes];

// 生成配置的示例数据
export const mockConfigs = {
  shadowsocks: {
    json: (route: RouteItem) => JSON.stringify({
      server: route.entryPoint,
      server_port: parseInt(route.port || '8388'),
      method: route.method || 'aes-256-gcm',
      password: route.password,
      timeout: 300,
      fast_open: route.tcpFastOpen,
      ...(route.otherParams ? JSON.parse(route.otherParams) : {})
    }, null, 2),
    
    uri: (route: RouteItem) => {
      const method = route.method || 'aes-256-gcm';
      const userInfo = Buffer.from(`${method}:${route.password}`).toString('base64');
      return `ss://${userInfo}@${route.entryPoint}:${route.port}#${encodeURIComponent(route.routeName)}`;
    },
    
    yaml: (route: RouteItem) => `
name: "${route.routeName}"
type: ss
server: ${route.entryPoint}
port: ${route.port}
cipher: ${route.method || 'aes-256-gcm'}
password: "${route.password}"
udp: ${route.udpSupport}
`.trim()
  },
  
  snell: {
    json: (route: RouteItem) => JSON.stringify({
      name: route.routeName,
      type: 'snell',
      server: route.entryPoint,
      port: parseInt(route.port || '6333'),
      psk: route.password,
      version: parseInt(route.snellVersion || '4'),
      udp: route.udpSupport,
      ...(route.otherParams ? JSON.parse(route.otherParams) : {})
    }, null, 2),
    
    yaml: (route: RouteItem) => `
name: "${route.routeName}"
type: snell
server: ${route.entryPoint}
port: ${route.port}
psk: "${route.password}"
version: ${route.snellVersion || '4'}
udp: ${route.udpSupport}
`.trim()
  }
}; 