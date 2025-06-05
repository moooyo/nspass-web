import { http, HttpResponse } from 'msw';
import type { UserData } from '../types';
import { mockUsers } from '../data/users';

// 用户管理相关的 API handlers

export const userHandlers = [
  // 获取用户列表
  http.get('https://api.example.com/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status');
    
    // 筛选数据
    let filteredUsers = mockUsers;
    if (status) {
      filteredUsers = mockUsers.filter(user => user.status === status);
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
        pageSize: pageSize,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / pageSize)
      }
    });
  }),

  // 创建用户
  http.post('https://api.example.com/users', async ({ request }) => {
    const userData = await request.json() as UserData;
    
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      status: "active",
      createTime: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return HttpResponse.json({
      success: true,
      message: "用户创建成功",
      data: newUser
    });
  }),

  // 获取单个用户
  http.get('https://api.example.com/users/:id', ({ params }) => {
    const userId = parseInt(params.id as string);
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return HttpResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: user
    });
  }),

  // 更新用户
  http.put('https://api.example.com/users/:id', async ({ params, request }) => {
    const userId = parseInt(params.id as string);
    const userData = await request.json() as UserData;
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
    
    return HttpResponse.json({
      success: true,
      message: "用户更新成功",
      data: mockUsers[userIndex]
    });
  }),

  // 删除用户
  http.delete('https://api.example.com/users/:id', ({ params }) => {
    const userId = parseInt(params.id as string);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }
    
    mockUsers.splice(userIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: "用户删除成功"
    });
  }),
]; 