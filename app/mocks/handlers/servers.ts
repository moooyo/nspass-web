import { http, HttpResponse } from 'msw';
import type {
  ServerItem,
  CreateServerRequest,
  UpdateServerRequest
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
    group: '主要服务器',
    registerTime: '2024-01-01T00:00:00Z',
    uploadTraffic: 1250.8,
    downloadTraffic: 2467.3,
    status: ServerStatus.SERVER_STATUS_ONLINE
  },
  {
    id: '2',
    name: '洛杉矶服务器-01',
    ipv4: '234.56.78.90',
    country: 'United States',
    group: '主要服务器',
    registerTime: '2024-01-02T00:00:00Z',
    uploadTraffic: 856.4,
    downloadTraffic: 1923.7,
    status: ServerStatus.SERVER_STATUS_ONLINE
  },
  {
    id: '3',
    name: '东京服务器-01',
    ipv4: '345.67.89.01',
    country: 'Japan',
    group: '备用服务器',
    registerTime: '2024-01-03T00:00:00Z',
    uploadTraffic: 425.6,
    downloadTraffic: 789.2,
    status: ServerStatus.SERVER_STATUS_OFFLINE
  },
  {
    id: '4',
    name: '法兰克福服务器-01',
    country: 'Germany',
    group: '测试服务器',
    registerTime: '2024-01-04T00:00:00Z',
    uploadTraffic: 0,
    downloadTraffic: 0,
    status: ServerStatus.SERVER_STATUS_PENDING_INSTALL
  },
  {
    id: '5',
    name: '新加坡服务器-01',
    ipv4: '456.78.90.12',
    country: 'Singapore',
    group: '备用服务器',
    registerTime: '2024-01-05T00:00:00Z',
    uploadTraffic: 125.5,
    downloadTraffic: 234.8,
    status: ServerStatus.SERVER_STATUS_UNKNOWN
  }
];

let nextId = 6;

export const serverHandlers = [
  // 获取服务器列表
  http.get('/api/v1/servers', ({ request }) => {
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
        server.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // 按状态筛选
    if (status) {
      const statusValue = parseInt(status);
      filteredServers = filteredServers.filter(server => server.status === statusValue);
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
      base: { success: true, message: '获取服务器列表成功' },
      data: paginatedServers
    });
  }),

  // 创建服务器
  http.post('/api/v1/servers', async ({ request }) => {
    const body = await request.json() as CreateServerRequest;

    // 验证必填字段 - 只有服务器名称是必填的
    if (!body.name) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '服务器名称为必填项',
          errorCode: 'INVALID_INPUT'
        }
      }, { status: 400 });
    }

    const newServer: ServerItem = {
      id: (nextId++).toString(),
      name: body.name,
      country: body.country,
      group: body.group,
      registerTime: body.registerTime || new Date().toISOString(),
      uploadTraffic: body.uploadTraffic || 0,
      downloadTraffic: body.downloadTraffic || 0,
      status: ServerStatus.SERVER_STATUS_PENDING_INSTALL // 新建时状态固定为待安装
    };

    mockServers.push(newServer);

    return HttpResponse.json({
      base: { success: true, message: '服务器创建成功' },
      data: newServer
    });
  }),

  // 获取单个服务器
  http.get('/api/v1/servers/:id', ({ params }) => {
    const id = params.id as string;
    const server = mockServers.find(s => s.id === id);

    if (!server) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '服务器不存在',
          errorCode: 'SERVER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return HttpResponse.json({
      base: { success: true, message: '获取服务器成功' },
      data: server
    });
  }),

  // 更新服务器
  http.put('/api/v1/servers/:id', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json() as UpdateServerRequest;
    const serverIndex = mockServers.findIndex(s => s.id === id);

    if (serverIndex === -1) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '服务器不存在',
          errorCode: 'SERVER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // 更新服务器
    const server = mockServers[serverIndex];
    Object.assign(server, body);

    return HttpResponse.json({
      base: { success: true, message: '服务器更新成功' },
      data: server
    });
  }),

  // 删除服务器
  http.delete('/api/v1/servers/:id', ({ params }) => {
    const id = params.id as string;
    const serverIndex = mockServers.findIndex(s => s.id === id);

    if (serverIndex === -1) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '服务器不存在',
          errorCode: 'SERVER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    mockServers.splice(serverIndex, 1);

    return HttpResponse.json({
      base: { success: true, message: '服务器删除成功' }
    });
  }),

  // 批量删除服务器
  http.post('/api/v1/servers/batch-delete', async ({ request }) => {
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
      base: { success: true, message: `成功删除 ${deletedCount} 个服务器` }
    });
  }),

  // 重启服务器
  http.post('/api/v1/servers/:id/restart', ({ params }) => {
    const id = params.id as string;
    const server = mockServers.find(s => s.id === id);

    if (!server) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '服务器不存在',
          errorCode: 'SERVER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // 模拟重启过程
    server.status = ServerStatus.SERVER_STATUS_ONLINE;

    return HttpResponse.json({
      base: { success: true, message: '服务器重启成功' }
    });
  })
]; 