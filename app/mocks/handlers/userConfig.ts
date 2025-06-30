import { http, HttpResponse } from 'msw';
import type { 
  UserConfigData, 
  BanUserData, 
  BatchOperationData, 
  ServerResponse 
} from '@mock/types';
import { mockUserConfigs } from '@mock/data/userConfigs';

// 用户配置管理相关的 API handlers

export const userConfigHandlers = [
  // 获取用户配置列表
  http.get('/api/v1/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const userId = url.searchParams.get('userId');
    const username = url.searchParams.get('username');
    const userGroup = url.searchParams.get('userGroup');
    const banned = url.searchParams.get('banned');

    let filteredUsers = [...mockUserConfigs];

    // 应用筛选条件
    if (userId) {
      filteredUsers = filteredUsers.filter(user => user.userId.includes(userId));
    }
    if (username) {
      filteredUsers = filteredUsers.filter(user => user.username.includes(username));
    }
    if (userGroup) {
      filteredUsers = filteredUsers.filter(user => user.userGroup === userGroup);
    }
    if (banned !== null) {
      const isBanned = banned === 'true';
      filteredUsers = filteredUsers.filter(user => user.banned === isBanned);
    }

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        current: page,
        pageSize,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / pageSize)
      }
    });
  }),

  // 创建用户配置
  http.post('/api/v1/users', async ({ request }) => {
    const data = await request.json() as UserConfigData;
    const newConfig = {
      id: mockUserConfigs.length + 1,
      ...data
    };
    mockUserConfigs.push(newConfig);
    return HttpResponse.json({ success: true, data: newConfig });
  }),

  // 获取单个用户配置
  http.get('/api/users/settings/:id', ({ params }) => {
    const userId = parseInt(params.id as string);
    const user = mockUserConfigs.find(u => u.id == userId);
    
    if (!user) {
      return HttpResponse.json(
        { success: false, message: "用户配置不存在" },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: user
    });
  }),

  // 更新用户配置
  http.put('/api/v1/users/:id', async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as UserConfigData;
    const index = mockUserConfigs.findIndex(config => config.id === Number(id));
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockUserConfigs[index] = { ...mockUserConfigs[index], ...data };
    return HttpResponse.json({ success: true, data: mockUserConfigs[index] });
  }),

  // 删除用户配置
  http.delete('/api/v1/users/:id', ({ params }) => {
    const { id } = params;
    const index = mockUserConfigs.findIndex(config => config.id === Number(id));
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockUserConfigs.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // 封禁/解除封禁用户
  http.put('/api/v1/users/:id/ban', async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as BanUserData;
    const index = mockUserConfigs.findIndex(config => config.id === Number(id));
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockUserConfigs[index].banned = data.banned;
    return HttpResponse.json({ success: true, data: mockUserConfigs[index] });
  }),

  // 重置用户流量
  http.post('/api/v1/users/:id/resetTraffic', ({ params }) => {
    const { id } = params;
    const index = mockUserConfigs.findIndex(config => config.id === Number(id));
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // 在实际应用中，这里应该重置用户的流量统计
    return HttpResponse.json({ success: true });
  }),

  // 发送邀请注册链接
  http.post('/api/v1/users/:id/invite', ({ params }) => {
    const { id } = params;
    const index = mockUserConfigs.findIndex(config => config.id === Number(id));
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // 在实际应用中，这里应该生成并发送邀请链接
    const inviteLink = `https://example.com/register?invite=mock-invite-code-${id}`;
    return HttpResponse.json({ success: true, data: { inviteLink } });
  }),

  // 批量删除用户配置
  http.post('/api/v1/users/batchDelete', async ({ request }) => {
    const data = await request.json() as BatchOperationData;
    data.ids.forEach(id => {
      const index = mockUserConfigs.findIndex(config => config.id === id);
      if (index !== -1) {
        mockUserConfigs.splice(index, 1);
      }
    });
    return HttpResponse.json({ success: true });
  }),

  // 批量更新用户配置
  http.put('/api/v1/users/batchUpdate', async ({ request }) => {
    const data = await request.json() as BatchOperationData;
    const updatedConfigs = mockUserConfigs.map(config => {
      if (data.ids.includes(config.id as number) && data.updateData) {
        return { ...config, ...data.updateData };
      }
      return config;
    });
    mockUserConfigs.splice(0, mockUserConfigs.length, ...updatedConfigs);
    return HttpResponse.json({ success: true, data: updatedConfigs });
  }),
]; 