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

// 模拟用户配置数据
const mockUserConfigs = [
  {
    id: 1,
    userId: 'user001',
    username: '张三',
    userGroup: 'admin',
    expireTime: '2024-12-31',
    trafficLimit: 10240, // 10GB
    trafficResetType: 'MONTHLY',
    ruleLimit: 50,
    banned: false,
  },
  {
    id: 2,
    userId: 'user002',
    username: '李四',
    userGroup: 'user',
    expireTime: '2024-10-15',
    trafficLimit: 5120, // 5GB
    trafficResetType: 'WEEKLY',
    ruleLimit: 20,
    banned: false,
  },
  {
    id: 3,
    userId: 'user003',
    username: '王五',
    userGroup: 'guest',
    expireTime: '2024-06-30',
    trafficLimit: 1024, // 1GB
    trafficResetType: 'NONE',
    ruleLimit: 10,
    banned: true,
  },
  {
    id: 4,
    userId: 'user004',
    username: '赵六',
    userGroup: 'user',
    expireTime: '2024-08-20',
    trafficLimit: 3072, // 3GB
    trafficResetType: 'DAILY',
    ruleLimit: 15,
    banned: false,
  },
  {
    id: 5,
    userId: 'user005',
    username: '钱七',
    userGroup: 'admin',
    expireTime: '2025-01-31',
    trafficLimit: 20480, // 20GB
    trafficResetType: 'MONTHLY',
    ruleLimit: 100,
    banned: false,
  },
];

// 模拟网站配置数据
const mockWebsiteConfig = {
  id: 1,
  siteName: 'NSPass',
  allowRegister: true,
  inviteStrategy: 'code',
  inviteCode: 'nspass2024',
  allowLookingGlass: true,
  showAnnouncement: true,
  announcementContent: '欢迎使用NSPass系统，这是一个示例公告。',
  updatedAt: '2024-01-15T10:30:00Z'
};

// 模拟服务器数据
const mockServers = [
  {
    id: 1,
    name: '服务器01',
    ipv4: '192.168.1.1',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    region: '亚洲',
    group: '主要服务器',
    registerTime: '2023-01-01',
    uploadTraffic: 1024,
    downloadTraffic: 2048,
    status: 'online',
  },
  {
    id: 2,
    name: '服务器02',
    ipv4: '192.168.1.2',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7335',
    region: '欧洲',
    group: '备用服务器',
    registerTime: '2023-02-01',
    uploadTraffic: 512,
    downloadTraffic: 1024,
    status: 'offline',
  },
  {
    id: 3,
    name: '服务器03',
    ipv4: '192.168.1.3',
    ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7336',
    region: '美洲',
    group: '主要服务器',
    registerTime: '2023-03-01',
    uploadTraffic: 2048,
    downloadTraffic: 4096,
    status: 'online',
  },
];

// 模拟用户组数据
const mockUserGroups = [
  {
    id: 1,
    groupId: 'admin',
    groupName: '管理员组',
    userCount: 3,
  },
  {
    id: 2,
    groupId: 'user',
    groupName: '普通用户组',
    userCount: 42,
  },
  {
    id: 3,
    groupId: 'guest',
    groupName: '访客组',
    userCount: 15,
  },
  {
    id: 4,
    groupId: 'vip',
    groupName: 'VIP用户组',
    userCount: 8,
  },
];

// 模拟出口数据
const mockEgressList = [
  {
    id: 1,
    egressId: 'egress001',
    serverId: 'server01',
    egressMode: 'direct',
    egressConfig: '目的地址: 203.0.113.1',
    targetAddress: '203.0.113.1',
  },
  {
    id: 2,
    egressId: 'egress002',
    serverId: 'server01',
    egressMode: 'iptables',
    egressConfig: 'TCP转发至 192.168.1.1:8080',
    forwardType: 'tcp',
    destAddress: '192.168.1.1',
    destPort: '8080',
  },
  {
    id: 3,
    egressId: 'egress003',
    serverId: 'server02',
    egressMode: 'iptables',
    egressConfig: '全部转发至 10.0.0.1:443',
    forwardType: 'all',
    destAddress: '10.0.0.1',
    destPort: '443',
  },
  {
    id: 4,
    egressId: 'egress004',
    serverId: 'server03',
    egressMode: 'ss2022',
    egressConfig: 'Shadowsocks-2022，支持UDP',
    password: 'password123',
    supportUdp: true,
  },
];

// 模拟转发规则数据
const mockForwardRules = [
  {
    id: 1,
    ruleId: 'rule001',
    entryType: 'HTTP',
    entryConfig: '127.0.0.1:8080',
    trafficUsed: 1024,
    exitType: 'PROXY',
    exitConfig: 'proxy.example.com:443',
    status: 'ACTIVE',
    viaNodes: ['香港节点', '日本节点'],
  },
  {
    id: 2,
    ruleId: 'rule002',
    entryType: 'SOCKS5',
    entryConfig: '0.0.0.0:1080',
    trafficUsed: 512,
    exitType: 'DIRECT',
    exitConfig: '-',
    status: 'PAUSED',
    viaNodes: ['新加坡节点'],
  },
  {
    id: 3,
    ruleId: 'rule003',
    entryType: 'SHADOWSOCKS',
    entryConfig: '0.0.0.0:8388',
    trafficUsed: 2048,
    exitType: 'REJECT',
    exitConfig: '-',
    status: 'ERROR',
    viaNodes: [],
  },
];

// 模拟可用服务器数据
const mockAvailableServers = [
  { 
    id: 'server001', 
    name: '香港服务器', 
    type: 'NORMAL',
    ip: '203.0.113.1',
    location: {
      country: '中国香港',
      latitude: 22.3193,
      longitude: 114.1694,
      x: 650,
      y: 250
    }
  },
  { 
    id: 'server002', 
    name: '东京服务器', 
    type: 'NORMAL',
    ip: '203.0.113.2',
    location: {
      country: '日本',
      latitude: 35.6762,
      longitude: 139.6503,
      x: 700,
      y: 220
    }
  },
  { 
    id: 'exit001', 
    name: '美国出口', 
    type: 'EXIT',
    ip: '198.51.100.1',
    location: {
      country: '美国',
      latitude: 38.8951,
      longitude: -77.0364,
      x: 250,
      y: 220
    }
  },
];

// 模拟用户信息数据
const mockUserInfo = {
  id: 1,
  name: 'admin',
  role: 'admin',
  userGroup: 'admin',
  traffic: '1000GB',
  trafficResetDate: '2025-01-01',
  forwardRuleConfigLimit: '1000',
  email: 'admin@example.com',
  phone: '+86 138-0013-8000',
  avatar: 'https://via.placeholder.com/100',
  createTime: '2023-01-01T00:00:00Z',
  lastLoginTime: '2024-01-15T08:30:00Z'
};

export const handlers = [
  // =================== 用户配置管理 API ===================
  
  // 获取用户配置列表
  http.get('https://api.example.com/config/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const userId = url.searchParams.get('userId');
    const username = url.searchParams.get('username');
    const userGroup = url.searchParams.get('userGroup');
    const banned = url.searchParams.get('banned');
    
    // 筛选数据
    let filteredUsers = mockUserConfigs;
    
    if (userId) {
      filteredUsers = filteredUsers.filter(user => 
        user.userId.toLowerCase().includes(userId.toLowerCase())
      );
    }
    
    if (username) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(username.toLowerCase())
      );
    }
    
    if (userGroup) {
      filteredUsers = filteredUsers.filter(user => user.userGroup === userGroup);
    }
    
    if (banned !== null && banned !== undefined && banned !== '') {
      filteredUsers = filteredUsers.filter(user => user.banned.toString() === banned);
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

  // 创建用户配置
  http.post('https://api.example.com/config/users', async ({ request }) => {
    const userData = await request.json() as any;
    
    const newUser = {
      id: mockUserConfigs.length + 1,
      ...userData,
      banned: userData.banned || false,
    };
    
    // 模拟添加到数据中
    mockUserConfigs.push(newUser);
    
    return HttpResponse.json({
      success: true,
      message: "用户配置创建成功",
      data: newUser
    });
  }),

  // 获取单个用户配置
  http.get('https://api.example.com/config/users/:id', ({ params }) => {
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
  http.put('https://api.example.com/config/users/:id', async ({ params, request }) => {
    const userId = parseInt(params.id as string);
    const userData = await request.json() as any;
    const userIndex = mockUserConfigs.findIndex(u => u.id == userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户配置不存在" },
        { status: 404 }
      );
    }
    
    mockUserConfigs[userIndex] = { ...mockUserConfigs[userIndex], ...userData };
    
    return HttpResponse.json({
      success: true,
      message: "用户配置更新成功",
      data: mockUserConfigs[userIndex]
    });
  }),

  // 删除用户配置
  http.delete('https://api.example.com/config/users/:id', ({ params }) => {
    const userId = parseInt(params.id as string);
    const userIndex = mockUserConfigs.findIndex(u => u.id == userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户配置不存在" },
        { status: 404 }
      );
    }
    
    mockUserConfigs.splice(userIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: "用户配置删除成功"
    });
  }),

  // 封禁/解除封禁用户
  http.put('https://api.example.com/config/users/:id/ban', async ({ params, request }) => {
    const userId = parseInt(params.id as string);
    const { banned } = await request.json() as any;
    const userIndex = mockUserConfigs.findIndex(u => u.id == userId);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户配置不存在" },
        { status: 404 }
      );
    }
    
    mockUserConfigs[userIndex].banned = banned;
    
    return HttpResponse.json({
      success: true,
      message: banned ? "用户已被封禁" : "用户封禁已解除",
      data: mockUserConfigs[userIndex]
    });
  }),

  // 重置用户流量
  http.post('https://api.example.com/config/users/:id/reset-traffic', ({ params }) => {
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
      message: `用户 ${user.username} 的流量已重置`
    });
  }),

  // 邀请用户注册
  http.post('https://api.example.com/config/users/:id/invite', ({ params }) => {
    const userId = parseInt(params.id as string);
    const user = mockUserConfigs.find(u => u.id == userId);
    
    if (!user) {
      return HttpResponse.json(
        { success: false, message: "用户配置不存在" },
        { status: 404 }
      );
    }
    
    const inviteLink = `https://app.example.com/register?invite=${userId}&token=${Date.now()}`;
    
    return HttpResponse.json({
      success: true,
      message: `已向用户 ${user.username} 发送邀请注册链接`,
      data: { inviteLink }
    });
  }),

  // 批量删除用户配置
  http.post('https://api.example.com/config/users/batch-delete', async ({ request }) => {
    const { ids } = await request.json() as any;
    
    // 从数据中移除指定的用户
    ids.forEach((id: any) => {
      const userIndex = mockUserConfigs.findIndex(u => u.id == id);
      if (userIndex !== -1) {
        mockUserConfigs.splice(userIndex, 1);
      }
    });
    
    return HttpResponse.json({
      success: true,
      message: `已删除 ${ids.length} 个用户配置`
    });
  }),

  // 批量更新用户配置
  http.put('https://api.example.com/config/users/batch-update', async ({ request }) => {
    const { ids, updateData } = await request.json() as any;
    const updatedUsers: any[] = [];
    
    ids.forEach((id: any) => {
      const userIndex = mockUserConfigs.findIndex(u => u.id == id);
      if (userIndex !== -1) {
        mockUserConfigs[userIndex] = { ...mockUserConfigs[userIndex], ...updateData };
        updatedUsers.push(mockUserConfigs[userIndex]);
      }
    });
    
    return HttpResponse.json({
      success: true,
      message: `已更新 ${updatedUsers.length} 个用户配置`,
      data: updatedUsers
    });
  }),

  // =================== 原有用户管理 API ===================
  
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
  }),

  // =================== 网站配置 API ===================
  
  // 获取网站配置
  http.get('https://api.example.com/config/website', () => {
    return HttpResponse.json({
      success: true,
      data: mockWebsiteConfig
    });
  }),

  // 更新网站配置
  http.put('https://api.example.com/config/website', async ({ request }) => {
    const updateData = await request.json() as any;
    
    Object.assign(mockWebsiteConfig, updateData);
    mockWebsiteConfig.updatedAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      message: "网站配置更新成功",
      data: mockWebsiteConfig
    });
  }),

  // 重置网站配置
  http.post('https://api.example.com/config/website/reset', () => {
    Object.assign(mockWebsiteConfig, {
      siteName: 'NSPass',
      allowRegister: true,
      inviteStrategy: 'code',
      inviteCode: 'nspass2024',
      allowLookingGlass: true,
      showAnnouncement: true,
      announcementContent: '欢迎使用NSPass系统，这是一个示例公告。',
      updatedAt: new Date().toISOString()
    });
    
    return HttpResponse.json({
      success: true,
      message: "网站配置已重置为默认值",
      data: mockWebsiteConfig
    });
  }),

  // 验证邀请码
  http.post('https://api.example.com/config/website/validate-invite', async ({ request }) => {
    const { code } = await request.json() as any;
    const valid = code === mockWebsiteConfig.inviteCode;
    
    return HttpResponse.json({
      success: true,
      data: { valid }
    });
  }),

  // 生成新邀请码
  http.post('https://api.example.com/config/website/generate-invite', () => {
    const newInviteCode = `nspass${Date.now().toString().substr(-6)}`;
    mockWebsiteConfig.inviteCode = newInviteCode;
    mockWebsiteConfig.updatedAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      message: "新邀请码生成成功",
      data: { inviteCode: newInviteCode }
    });
  }),

  // =================== 服务器管理 API ===================
  
  // 获取服务器列表
  http.get('https://api.example.com/servers', ({ request }) => {
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
  http.post('https://api.example.com/servers', async ({ request }) => {
    const serverData = await request.json() as any;
    
    const newServer = {
      id: mockServers.length + 1,
      ...serverData,
      uploadTraffic: serverData.uploadTraffic || 0,
      downloadTraffic: serverData.downloadTraffic || 0,
      status: serverData.status || 'offline',
    };
    
    mockServers.push(newServer);
    
    return HttpResponse.json({
      success: true,
      message: "服务器创建成功",
      data: newServer
    });
  }),

  // 获取单个服务器
  http.get('https://api.example.com/servers/:id', ({ params }) => {
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
  http.put('https://api.example.com/servers/:id', async ({ params, request }) => {
    const serverId = parseInt(params.id as string);
    const serverData = await request.json() as any;
    const serverIndex = mockServers.findIndex(s => s.id == serverId);
    
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
  http.delete('https://api.example.com/servers/:id', ({ params }) => {
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
  http.post('https://api.example.com/servers/:id/restart', ({ params }) => {
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
  http.get('https://api.example.com/servers/regions', () => {
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

  // =================== 用户组管理 API ===================
  
  // 获取用户组列表
  http.get('https://api.example.com/config/user-groups', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const groupId = url.searchParams.get('groupId');
    const groupName = url.searchParams.get('groupName');
    
    // 筛选数据
    let filteredGroups = mockUserGroups;
    
    if (groupId) {
      filteredGroups = filteredGroups.filter(group => 
        group.groupId.toLowerCase().includes(groupId.toLowerCase())
      );
    }
    
    if (groupName) {
      filteredGroups = filteredGroups.filter(group => 
        group.groupName.toLowerCase().includes(groupName.toLowerCase())
      );
    }
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedGroups = filteredGroups.slice(startIndex, endIndex);
    
    return HttpResponse.json({
      success: true,
      data: paginatedGroups,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: filteredGroups.length,
        totalPages: Math.ceil(filteredGroups.length / pageSize)
      }
    });
  }),

  // 创建用户组
  http.post('https://api.example.com/config/user-groups', async ({ request }) => {
    const groupData = await request.json() as any;
    
    const newGroup = {
      id: mockUserGroups.length + 1,
      ...groupData,
      userCount: groupData.userCount || 0,
    };
    
    mockUserGroups.push(newGroup);
    
    return HttpResponse.json({
      success: true,
      message: "用户组创建成功",
      data: newGroup
    });
  }),

  // 更新用户组
  http.put('https://api.example.com/config/user-groups/:id', async ({ params, request }) => {
    const groupId = parseInt(params.id as string);
    const groupData = await request.json() as any;
    const groupIndex = mockUserGroups.findIndex(g => g.id == groupId);
    
    if (groupIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户组不存在" },
        { status: 404 }
      );
    }
    
    mockUserGroups[groupIndex] = { ...mockUserGroups[groupIndex], ...groupData };
    
    return HttpResponse.json({
      success: true,
      message: "用户组更新成功",
      data: mockUserGroups[groupIndex]
    });
  }),

  // 删除用户组
  http.delete('https://api.example.com/config/user-groups/:id', ({ params }) => {
    const groupId = parseInt(params.id as string);
    const groupIndex = mockUserGroups.findIndex(g => g.id == groupId);
    
    if (groupIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户组不存在" },
        { status: 404 }
      );
    }
    
    mockUserGroups.splice(groupIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: "用户组删除成功"
    });
  }),

  // =================== 用户信息 API ===================
  
  // 获取当前用户信息
  http.get('https://api.example.com/user/info', () => {
    return HttpResponse.json({
      success: true,
      data: mockUserInfo
    });
  }),

  // 更新当前用户信息
  http.put('https://api.example.com/user/info', async ({ request }) => {
    const updateData = await request.json() as any;
    
    Object.assign(mockUserInfo, updateData);
    
    return HttpResponse.json({
      success: true,
      message: "用户信息更新成功",
      data: mockUserInfo
    });
  }),

  // 修改密码
  http.put('https://api.example.com/user/info/password', async ({ request }) => {
    const { oldPassword, newPassword } = await request.json() as any;
    
    // 模拟密码验证
    if (oldPassword !== 'oldpass123') {
      return HttpResponse.json(
        { success: false, message: "原密码错误" },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      message: "密码修改成功"
    });
  }),

  // 获取流量统计
  http.get('https://api.example.com/user/info/traffic-stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalUsed: 750,
        totalLimit: 1000,
        dailyUsage: Array.from({ length: 30 }, (_, i) => ({
          date: `2024-01-${i + 1}`,
          upload: Math.floor(Math.random() * 10) + 5,
          download: Math.floor(Math.random() * 20) + 10,
        })),
        monthlyUsage: Array.from({ length: 12 }, (_, i) => ({
          month: `2024-${i + 1}`,
          upload: Math.floor(Math.random() * 100) + 50,
          download: Math.floor(Math.random() * 200) + 100,
        })),
      }
    });
  }),

  // =================== 简化的仪表盘 API ===================
  
  // 获取系统概览
  http.get('https://api.example.com/dashboard/overview', () => {
    return HttpResponse.json({
      success: true,
      data: {
        userCount: 2547,
        serverCount: 128,
        ruleCount: 356,
        monthlyTraffic: 1024,
      }
    });
  }),

  // 获取流量趋势
  http.get('https://api.example.com/dashboard/traffic-trend', () => {
    return HttpResponse.json({
      success: true,
      data: Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        traffic: Math.floor(Math.random() * 50) + 10,
      }))
    });
  }),

  // 获取用户流量占比
  http.get('https://api.example.com/dashboard/user-traffic', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { user: '张三', value: 38, traffic: 380 },
        { user: '李四', value: 25, traffic: 250 },
        { user: '王五', value: 15, traffic: 150 },
        { user: '赵六', value: 12, traffic: 120 },
        { user: '其他用户', value: 10, traffic: 100 },
      ]
    });
  })
]; 