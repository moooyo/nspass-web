import { http, HttpResponse } from 'msw';
import type { ServerData } from '@mock/types';
import { mockServers } from '@mock/data/servers';

// 服务器管理相关的 API handlers

export const serverHandlers = [
  // 获取服务器列表
  http.get('/api/servers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const name = url.searchParams.get('name');
    const status = url.searchParams.get('status');
    const region = url.searchParams.get('region');
    
    // 筛选数据
    let filteredServers = mockServers;
    
    if (name) {
      filteredServers = filteredServers.filter(server => 
        server.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (status && status !== 'all') {
      filteredServers = filteredServers.filter(server => server.status === status);
    }
    
    if (region && region !== 'all') {
      filteredServers = filteredServers.filter(server => server.region === region);
    }
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedServers = filteredServers.slice(startIndex, endIndex);
    
    return HttpResponse.json({
      success: true,
      data: paginatedServers,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: filteredServers.length,
        totalPages: Math.ceil(filteredServers.length / pageSize)
      }
    });
  }),

  // 创建服务器
  http.post('/api/servers', async ({ request }) => {
    const serverData = await request.json() as ServerData;
    
    const newServer = {
      id: mockServers.length + 1,
      ...serverData,
      registerTime: new Date().toISOString(),
      uploadTraffic: 0,
      downloadTraffic: 0
    };
    
    mockServers.push(newServer);
    
    return HttpResponse.json({
      success: true,
      message: "服务器创建成功",
      data: newServer
    });
  }),

  // 获取单个服务器
  http.get('/api/servers/:id', ({ params }) => {
    const serverId = parseInt(params.id as string);
    const server = mockServers.find(s => s.id == serverId);
    
    if (!server) {
      return HttpResponse.json(
        { success: false, message: "服务器不存在" },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: server
    });
  }),

  // 更新服务器
  http.put('/api/servers/:id', async ({ params, request }) => {
    const serverId = parseInt(params.id as string);
    const serverData = await request.json() as ServerData;
    const serverIndex = mockServers.findIndex(s => s.id === serverId);
    
    if (serverIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "服务器不存在" },
        { status: 404 }
      );
    }
    
    mockServers[serverIndex] = { ...mockServers[serverIndex], ...serverData };
    
    return HttpResponse.json({
      success: true,
      message: "服务器更新成功",
      data: mockServers[serverIndex]
    });
  }),

  // 删除服务器
  http.delete('/api/servers/:id', ({ params }) => {
    const serverId = parseInt(params.id as string);
    const serverIndex = mockServers.findIndex(s => s.id == serverId);
    
    if (serverIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "服务器不存在" },
        { status: 404 }
      );
    }
    
    mockServers.splice(serverIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: "服务器删除成功"
    });
  }),

  // 重启服务器
  http.post('/api/servers/:id/restart', ({ params }) => {
    const serverId = parseInt(params.id as string);
    const server = mockServers.find(s => s.id == serverId);
    
    if (!server) {
      return HttpResponse.json(
        { success: false, message: "服务器不存在" },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      message: `服务器 ${server.name} 重启成功`
    });
  }),

  // 获取服务器区域列表
  http.get('/api/servers/regions', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { label: '亚洲', value: 'asia' },
        { label: '欧洲', value: 'europe' },
        { label: '美洲', value: 'america' },
        { label: '大洋洲', value: 'oceania' },
      ]
    });
  }),
]; 