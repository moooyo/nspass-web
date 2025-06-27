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
    region: '北京',
    group: '华北',
    registerTime: '2024-01-01T00:00:00Z',
    uploadTraffic: 1250.8,
    downloadTraffic: 2467.3,
    status: ServerStatus.SERVER_STATUS_ONLINE
  },
  {
    id: '2',
    name: '上海服务器-01',
    ipv4: '234.56.78.90',
    region: '上海',
    group: '华东',
    registerTime: '2024-01-02T00:00:00Z',
    uploadTraffic: 856.4,
    downloadTraffic: 1923.7,
    status: ServerStatus.SERVER_STATUS_ONLINE
  },
  {
    id: '3',
    name: '广州服务器-01',
    ipv4: '345.67.89.01',
    region: '广州',
    group: '华南',
    registerTime: '2024-01-03T00:00:00Z',
    uploadTraffic: 425.6,
    downloadTraffic: 789.2,
    status: ServerStatus.SERVER_STATUS_OFFLINE
  }
];

let nextId = 4;

export const serverHandlers = [
  // 获取服务器列表
  http.get('/api/v1/servers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const name = url.searchParams.get('name');
    const status = url.searchParams.get('status');
    const region = url.searchParams.get('region');

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

    // 按地区筛选
    if (region) {
      filteredServers = filteredServers.filter(server => server.region === region);
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

    // 验证必填字段
    if (!body.name || !body.ipv4 || !body.region || !body.group || !body.registerTime) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '缺少必填字段',
          errorCode: 'INVALID_INPUT'
        }
      }, { status: 400 });
    }

    // 检查IP地址冲突
    const existingServer = mockServers.find(server => server.ipv4 === body.ipv4);
    if (existingServer) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: 'IP地址已被使用',
          errorCode: 'IP_CONFLICT'
        }
      }, { status: 409 });
    }

    const newServer: ServerItem = {
      id: (nextId++).toString(),
      name: body.name,
      ipv4: body.ipv4,
      ipv6: body.ipv6,
      region: body.region,
      group: body.group,
      registerTime: body.registerTime,
      uploadTraffic: body.uploadTraffic || 0,
      downloadTraffic: body.downloadTraffic || 0,
      status: body.status || ServerStatus.SERVER_STATUS_ONLINE
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