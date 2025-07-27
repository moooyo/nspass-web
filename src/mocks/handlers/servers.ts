import { http, HttpResponse } from 'msw';
import type {
  ServerItem,
  CreateServerRequest,
  UpdateServerRequest,
  IngressIpv4Entry
} from '@/types/generated/api/servers/server_management';
import {
  ServerStatus
} from '@/types/generated/api/servers/server_management';

// 模拟服务器数据
const mockServers: ServerItem[] = [
  {
    id: '1',
    name: '北京服务器-01',
    ipv4: '123.45.67.89',
    ipv6: '2001:db8::1',
    country: 'China',
    group: 'IX',
    registerTime: '2024-01-01T00:00:00Z',
    uploadTraffic: 1250.8,
    downloadTraffic: 2467.3,
    status: ServerStatus.SERVER_STATUS_ONLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiIxIiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wMSIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.abc123',
    availablePorts: '10000-20000;30001;30002',
    ingressIpv4: [
      { ip: '192.168.1.100', comment: '内网入口' },
      { ip: '10.0.0.100', comment: '办公网络' }
    ],
  },
  {
    id: '2',
    name: '洛杉矶服务器-01',
    ipv4: '234.56.78.90',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7335',
    country: 'United States',
    group: 'Azure',
    registerTime: '2024-01-02T00:00:00Z',
    uploadTraffic: 856.4,
    downloadTraffic: 1923.7,
    status: ServerStatus.SERVER_STATUS_ONLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiIyIiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wMiIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.def456',
    availablePorts: '8000-9000;40001',
    ingressIpv4: [
      { ip: '172.16.0.1', comment: '电信线路' }
    ],
  },
  {
    id: '3',
    name: '东京服务器-01',
    ipv4: '345.67.89.01',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7336',
    country: 'Japan',
    group: 'IX',
    registerTime: '2024-01-03T00:00:00Z',
    uploadTraffic: 425.6,
    downloadTraffic: 789.2,
    status: ServerStatus.SERVER_STATUS_OFFLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiIzIiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wMyIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.ghi789',
    availablePorts: '15000-25000;35001;35002;35003',
    ingressIpv4: [
      { ip: '192.168.100.1', comment: '联通线路' },
      { ip: '10.1.1.1', comment: '移动线路' },
      { ip: '172.20.0.1', comment: '' }
    ],
  },
  {
    id: '4',
    name: '法兰克福服务器-01',
    ipv4: '445.67.89.02',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7337',
    country: 'Germany',
    group: 'Azure',
    registerTime: '2024-01-04T00:00:00Z',
    uploadTraffic: 320.4,
    downloadTraffic: 580.1,
    status: ServerStatus.SERVER_STATUS_ONLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiI0IiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wNCIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.jkl012',
    availablePorts: '12000-22000'
  },
  {
    id: '5',
    name: '新加坡服务器-01',
    ipv4: '456.78.90.12',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7338',
    country: 'Singapore',
    group: 'IX',
    registerTime: '2024-01-05T00:00:00Z',
    uploadTraffic: 125.5,
    downloadTraffic: 234.8,
    status: ServerStatus.SERVER_STATUS_UNKNOWN,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiI1IiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wNSIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.mno345',
    // 没有设置 availablePorts，表示全部可用
  },
  {
    id: '6',
    name: '香港服务器-01',
    ipv4: '567.89.01.23',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7339',
    country: 'Hong Kong',
    group: 'Premium',
    registerTime: '2024-01-06T00:00:00Z',
    uploadTraffic: 892.3,
    downloadTraffic: 1456.7,
    status: ServerStatus.SERVER_STATUS_ONLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiI2IiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wNiIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.pqr678',
    availablePorts: '5000-7000;25001;25002'
  },
  {
    id: '7',
    name: '伦敦服务器-01',
    ipv4: '678.90.12.34',
    country: 'United Kingdom',
    group: 'Azure',
    registerTime: '2024-01-07T00:00:00Z',
    uploadTraffic: 678.9,
    downloadTraffic: 1123.4,
    status: ServerStatus.SERVER_STATUS_ONLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiI3IiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wNyIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.stu901',
    // 没有设置 availablePorts，表示全部可用
  },
  {
    id: '8',
    name: '多伦多服务器-01',
    ipv4: '789.01.23.45',
    country: 'Canada',
    group: 'Premium',
    registerTime: '2024-01-08T00:00:00Z',
    uploadTraffic: 543.2,
    downloadTraffic: 876.5,
    status: ServerStatus.SERVER_STATUS_OFFLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiI4IiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wOCIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.vwx234',
    availablePorts: '16000-26000;36001'
  },
  {
    id: '9',
    name: '悉尼服务器-01',
    ipv4: '890.12.34.56',
    country: 'Australia',
    group: 'IX',
    registerTime: '2024-01-09T00:00:00Z',
    uploadTraffic: 234.5,
    downloadTraffic: 445.8,
    status: ServerStatus.SERVER_STATUS_PENDING_INSTALL,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiI5IiwibmFtZSI6IuS4nOS6rOacjeWKoeWZqC0wOSIsImlhdCI6MTcwNDUxMjAwMCwiZXhwIjoxNzM2MDQ4MDAwfQ.yza567',
    availablePorts: '14000-24000'
  },
  {
    id: '10',
    name: '首尔服务器-01',
    ipv4: '901.23.45.67',
    country: 'South Korea',
    group: 'Premium',
    registerTime: '2024-01-10T00:00:00Z',
    uploadTraffic: 567.8,
    downloadTraffic: 890.1,
    status: ServerStatus.SERVER_STATUS_ONLINE,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2ZXJfaWQiOiIxMCIsIm5hbWUiOiLkuJzkuqzmnI3liqHlmags65CsIiwiaWF0IjoxNzA0NTEyMDAwLCJleHAiOjE3MzYwNDgwMDB9.bcd890',
    availablePorts: '11000-21000;31001;31002'
  }
];

let nextId = 6;

export const serverHandlers = [
  // 获取服务器列表
  http.get('/v1/servers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const name = url.searchParams.get('name');
    const status = url.searchParams.get('status');
    const country = url.searchParams.get('country');

    let filteredServers = mockServers;

    // 按名称筛选
    if (name) {
      filteredServers = filteredServers.filter(server => 
        server.name?.toLowerCase().includes(name.toLowerCase())
      );
    }

    // 按状态筛选
    if (status) {
      // status 参数是字符串枚举值，直接比较
      filteredServers = filteredServers.filter(server => server.status === status);
    }

    // 按国家筛选
    if (country) {
      filteredServers = filteredServers.filter(server => server.country === country);
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedServers = filteredServers.slice(start, end);

    return HttpResponse.json({
      success: true, 
      message: '获取服务器列表成功',
      data: paginatedServers,
      pagination: {
        current: page,
        pageSize,
        total: filteredServers.length,
        totalPages: Math.ceil(filteredServers.length / pageSize)
      }
    });
  }),

  // 创建服务器
  http.post('/v1/servers', async ({ request }) => {
    const body = await request.json() as CreateServerRequest;

    // 验证必填字段 - 只有服务器名称是必填的
    if (!body.name) {
      return HttpResponse.json({
        success: false, 
        message: '服务器名称为必填项'
      }, { status: 400 });
    }

    // 生成简单的 token（实际应用中应该使用更安全的方式）
    const generateToken = (serverId: string) => {
      const header = btoa(JSON.stringify({ "alg": "HS256", "typ": "JWT" }));
      const payload = btoa(JSON.stringify({ 
        "server_id": serverId, 
        "name": body.name, 
        "iat": Math.floor(Date.now() / 1000), 
        "exp": Math.floor(Date.now() / 1000) + 31536000 // 1年后过期
      }));
      const signature = btoa(Math.random().toString(36).substring(2, 15));
      return `${header}.${payload}.${signature}`;
    };

    const newServer: ServerItem = {
      id: (nextId++).toString(),
      name: body.name,
      country: body.country,
      group: body.group,
      registerTime: body.registerTime || new Date().toISOString(),
      uploadTraffic: body.uploadTraffic || 0,
      downloadTraffic: body.downloadTraffic || 0,
      status: body.status || ServerStatus.SERVER_STATUS_PENDING_INSTALL, // 使用传入的状态，默认为等待安装
      token: generateToken((nextId - 1).toString()),
      availablePorts: body.availablePorts || undefined, // 空值保持为undefined，表示全部可用
      ingressIpv4: body.ingressIpv4 || undefined, // 入口IPv4地址数组
    };

    mockServers.push(newServer);

    return HttpResponse.json({
      success: true, 
      message: '服务器创建成功',
      data: newServer
    });
  }),

  // 获取单个服务器
  http.get('/v1/servers/:id', ({ params }) => {
    const id = params.id as string;
    const server = mockServers.find(s => s.id === id);

    if (!server) {
      return HttpResponse.json({
        success: false, 
        message: '服务器不存在'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true, 
      message: '获取服务器成功',
      data: server
    });
  }),

  // 更新服务器
  http.put('/v1/servers/:id', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json() as UpdateServerRequest;
    const serverIndex = mockServers.findIndex(s => s.id === id);

    if (serverIndex === -1) {
      return HttpResponse.json({
        success: false, 
        message: '服务器不存在'
      }, { status: 404 });
    }

    // 更新服务器
    const server = mockServers[serverIndex];
    Object.assign(server, body);

    return HttpResponse.json({
      success: true, 
      message: '服务器更新成功',
      data: server
    });
  }),

  // 删除服务器
  http.delete('/v1/servers/:id', ({ params }) => {
    const id = params.id as string;
    const serverIndex = mockServers.findIndex(s => s.id === id);

    if (serverIndex === -1) {
      return HttpResponse.json({
        success: false, 
        message: '服务器不存在'
      }, { status: 404 });
    }

    mockServers.splice(serverIndex, 1);

    return HttpResponse.json({
      success: true, 
      message: '服务器删除成功'
    });
  }),

  // 批量删除服务器
  http.post('/v1/servers/batch-delete', async ({ request }) => {
    const body = await request.json() as { ids: string[] };
    let deletedCount = 0;

    body.ids.forEach(id => {
      const index = mockServers.findIndex(s => s.id === id);
      if (index !== -1) {
        mockServers.splice(index, 1);
        deletedCount++;
      }
    });

    return HttpResponse.json({
      success: true, 
      message: `成功删除 ${deletedCount} 个服务器`
    });
  }),

  // 重启服务器
  http.post('/v1/servers/:id/restart', ({ params }) => {
    const id = params.id as string;
    const server = mockServers.find(s => s.id === id);

    if (!server) {
      return HttpResponse.json({
        success: false, 
        message: '服务器不存在'
      }, { status: 404 });
    }

    // 模拟重启过程
    server.status = ServerStatus.SERVER_STATUS_ONLINE;

    return HttpResponse.json({
      success: true, 
      message: '服务器重启成功'
    });
  }),

  // 重新生成单个服务器token
  http.post('/v1/servers/:id/regenerate-token', ({ params }) => {
    const id = params.id as string;
    const server = mockServers.find(s => s.id === id);

    if (!server) {
      return HttpResponse.json({
        success: false,
        message: '服务器不存在'
      }, { status: 404 });
    }

    // 生成新的token
    const generateToken = (serverId: string) => {
      const header = btoa(JSON.stringify({ "alg": "HS256", "typ": "JWT" }));
      const payload = btoa(JSON.stringify({
        "server_id": serverId,
        "name": server.name,
        "iat": Math.floor(Date.now() / 1000),
        "exp": Math.floor(Date.now() / 1000) + 31536000 // 1年后过期
      }));
      const signature = btoa(Math.random().toString(36).substring(2, 15));
      return `${header}.${payload}.${signature}`;
    };

    // 更新服务器token
    server.token = generateToken(id);

    return HttpResponse.json({
      success: true,
      message: '服务器token重新生成成功',
      data: server
    });
  }),

  // 重新生成所有服务器token
  http.post('/v1/servers/regenerate-all-tokens', () => {
    // 生成新的token
    const generateToken = (serverId: string, serverName: string) => {
      const header = btoa(JSON.stringify({ "alg": "HS256", "typ": "JWT" }));
      const payload = btoa(JSON.stringify({
        "server_id": serverId,
        "name": serverName,
        "iat": Math.floor(Date.now() / 1000),
        "exp": Math.floor(Date.now() / 1000) + 31536000 // 1年后过期
      }));
      const signature = btoa(Math.random().toString(36).substring(2, 15));
      return `${header}.${payload}.${signature}`;
    };

    // 为所有服务器重新生成token
    mockServers.forEach(server => {
      server.token = generateToken(server.id!, server.name!);
    });

    return HttpResponse.json({
      success: true,
      message: '所有服务器token重新生成成功',
      data: mockServers
    });
  })
]; 