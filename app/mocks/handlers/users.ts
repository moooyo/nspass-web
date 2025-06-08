import { http, HttpResponse } from 'msw';
import { mockUsers } from '@mock/data/users';

// 用户类型定义
interface UserData {
  name: string;
  email: string;
  role: string;
  status: string;
}

// 服务器响应类型
interface ServerResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
}

// 用户管理相关的 API handlers
export const usersHandlers = [
  // 获取用户列表
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const name = url.searchParams.get('name');
    const email = url.searchParams.get('email');
    const status = url.searchParams.get('status');

    let filteredUsers = [...mockUsers];

    // 应用过滤条件
    if (name) {
      filteredUsers = filteredUsers.filter(user => user.name.includes(name));
    }
    if (email) {
      filteredUsers = filteredUsers.filter(user => user.email.includes(email));
    }
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // 计算分页
    const total = filteredUsers.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = filteredUsers.slice(start, end);

    const response: ServerResponse<typeof paginatedUsers> = {
      success: true,
      data: paginatedUsers,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: total
      }
    };

    return HttpResponse.json(response);
  }),

  // 创建用户
  http.post('/api/users', async ({ request }) => {
    const data = await request.json() as UserData;
    const newUser = {
      id: mockUsers.length + 1,
      ...data,
      createTime: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return HttpResponse.json({
      success: true,
      message: '用户创建成功',
      data: newUser
    });
  }),

  // 获取单个用户
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find(u => u.id === Number(id));
    
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
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as Partial<UserData>;
    const index = mockUsers.findIndex(user => user.id === Number(id));
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }
    
    const updatedUser = {
      ...mockUsers[index],
      ...updateData
    };
    
    mockUsers[index] = updatedUser;
    
    return HttpResponse.json({
      success: true,
      message: '用户信息更新成功',
      data: updatedUser
    });
  }),

  // 删除用户
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    const index = mockUsers.findIndex(user => user.id === Number(id));
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }
    
    mockUsers.splice(index, 1);
    
    return HttpResponse.json({
      success: true,
      message: '用户删除成功'
    });
  }),
]; 