import { http, HttpResponse } from 'msw';

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    role: "admin",
    status: "active",
    createTime: "2023-01-15T08:30:00Z"
  },
  {
    id: 2,
    name: "李四", 
    email: "lisi@example.com",
    role: "user",
    status: "active",
    createTime: "2023-02-20T10:15:00Z"
  },
  {
    id: 3,
    name: "王五",
    email: "wangwu@example.com", 
    role: "user",
    status: "inactive",
    createTime: "2023-03-10T14:45:00Z"
  },
  {
    id: 4,
    name: "赵六",
    email: "zhaoliu@example.com",
    role: "user", 
    status: "active",
    createTime: "2023-04-05T16:20:00Z"
  },
  {
    id: 5,
    name: "钱七",
    email: "qianqi@example.com",
    role: "admin",
    status: "inactive", 
    createTime: "2023-05-12T09:45:00Z"
  }
];

export const handlers = [
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
    const userData = await request.json() as any;
    
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      status: "active",
      createTime: new Date().toISOString()
    };
    
    // 模拟添加到数据中
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
    const userData = await request.json() as any;
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

  // 模拟其他API
  http.get('https://api.example.com/products', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, name: "产品A", price: 299, category: "电子产品" },
        { id: 2, name: "产品B", price: 199, category: "服装" },
        { id: 3, name: "产品C", price: 399, category: "家居用品" }
      ]
    });
  }),

  // 模拟登录接口
  http.post('https://api.example.com/auth/login', async ({ request }) => {
    const credentials = await request.json() as any;
    
    // 模拟登录验证
    if (credentials.username === 'admin' && credentials.password === '123456') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin'
          }
        }
      });
    }
    
    return HttpResponse.json(
      { success: false, message: "用户名或密码错误" },
      { status: 401 }
    );
  })
]; 