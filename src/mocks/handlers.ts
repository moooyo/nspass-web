import { http, HttpResponse } from 'msw'

// Mock data
const mockUsers = [
  {
    id: '1',
    name: '管理员',
    email: 'admin@example.com',
    status: 'active',
    role: 'admin',
    createdAt: '2024-01-01',
    traffic: { used: 1024000, limit: 10240000 },
    permissions: ['admin', 'users:read', 'users:write', 'servers:read', 'servers:write']
  },
  {
    id: '2',
    name: '测试用户',
    email: 'test@example.com',
    status: 'active',
    role: 'user',
    createdAt: '2024-01-02',
    traffic: { used: 512000, limit: 5120000 },
    permissions: ['users:read']
  },
  {
    id: '3',
    name: '禁用用户',
    email: 'disabled@example.com',
    status: 'disabled',
    role: 'user',
    createdAt: '2024-01-03',
    traffic: { used: 0, limit: 1024000 },
    permissions: []
  },
]

const mockServers = [
  {
    id: '1',
    name: 'US-01',
    location: '美国东部',
    status: 'online',
    load: 65,
    users: 123,
    traffic: '2.4TB',
  },
  {
    id: '2',
    name: 'EU-01',
    location: '欧洲西部',
    status: 'online',
    load: 45,
    users: 89,
    traffic: '1.8TB',
  },
  {
    id: '3',
    name: 'AS-01',
    location: '亚洲东部',
    status: 'offline',
    load: 0,
    users: 0,
    traffic: '0GB',
  },
]

// Helper function to track requests
const incrementRequests = () => {
  if (typeof window !== 'undefined') {
    try {
      // Access the mock store directly using dynamic import
      import('@/stores/mock').then(({ useMockStore }) => {
        useMockStore.getState().incrementRequests()
      }).catch(() => {
        // Ignore errors if store is not available
      })
    } catch (error) {
      // Ignore errors if store is not available
    }
  }
}

export const handlers = [
  // Auth endpoints
  http.post('*/v1/auth/login', async ({ request }) => {
    incrementRequests()
    const body = await request.json() as any
    const { identifier, password } = body
    
    if (password === 'admin' || password === 'password') {
      const user = mockUsers.find(u => 
        u.email === identifier || u.name === identifier
      ) || mockUsers[0]
      
      return HttpResponse.json({
        success: true,
        message: '登录成功',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: `mock-token-${user.id}`,
          expires: 24,
          permissions: user.permissions
        }
      })
    }
    
    return HttpResponse.json({
      success: false,
      message: '用户名或密码错误'
    }, { status: 401 })
  }),

  // Register
  http.post('*/v1/auth/register', async ({ request }) => {
    incrementRequests()
    const body = await request.json() as any
    
    return HttpResponse.json({
      success: true,
      message: '注册成功',
      data: {
        id: Date.now().toString(),
        name: body.name,
        email: body.email,
        role: 'user',
        token: `mock-token-${Date.now()}`,
        expires: 24,
        permissions: ['users:read']
      }
    })
  }),

  // Logout
  http.post('*/v1/auth/logout', () => {
    incrementRequests()
    return HttpResponse.json({
      success: true,
      message: '退出登录成功'
    })
  }),

  // Get users list
  http.get('*/v1/users', ({ request }) => {
    incrementRequests()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    let filteredUsers = mockUsers
    if (search) {
      filteredUsers = mockUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedUsers = filteredUsers.slice(start, end)
    
    return HttpResponse.json({
      success: true,
      data: {
        users: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit,
        pages: Math.ceil(filteredUsers.length / limit)
      }
    })
  }),

  // Get user by ID
  http.get('*/v1/users/:id', ({ params }) => {
    incrementRequests()
    const user = mockUsers.find(u => u.id === params.id)
    if (!user) {
      return HttpResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 })
    }
    
    return HttpResponse.json({
      success: true,
      data: user
    })
  }),

  // Create user
  http.post('*/v1/users', async ({ request }) => {
    incrementRequests()
    const body = await request.json() as any
    
    const newUser = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email,
      status: 'active',
      role: body.role || 'user',
      createdAt: new Date().toISOString(),
      traffic: { used: 0, limit: body.trafficLimit || 1024000 },
      permissions: body.permissions || ['users:read']
    }
    
    mockUsers.push(newUser)
    
    return HttpResponse.json({
      success: true,
      message: '用户创建成功',
      data: newUser
    })
  }),

  // Get servers list
  http.get('*/v1/servers', () => {
    incrementRequests()
    return HttpResponse.json({
      success: true,
      data: mockServers
    })
  }),

  // Get server by ID
  http.get('*/v1/servers/:id', ({ params }) => {
    incrementRequests()
    const server = mockServers.find(s => s.id === params.id)
    if (!server) {
      return HttpResponse.json({
        success: false,
        message: '服务器不存在'
      }, { status: 404 })
    }
    
    return HttpResponse.json({
      success: true,
      data: server
    })
  }),

  // Get dashboard stats
  http.get('*/v1/dashboard/stats', () => {
    incrementRequests()
    return HttpResponse.json({
      success: true,
      data: {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.status === 'active').length,
        onlineServers: mockServers.filter(s => s.status === 'online').length,
        totalServers: mockServers.length,
        totalTraffic: '2.4TB',
        dailyTraffic: '156GB',
        activeRules: 156,
        todayRegistrations: 12
      }
    })
  }),

  // Get recent activities
  http.get('*/v1/dashboard/activities', () => {
    incrementRequests()
    return HttpResponse.json({
      success: true,
      data: [
        { time: '2 分钟前', action: '用户 admin 登录系统', type: 'info' },
        { time: '5 分钟前', action: '服务器 US-01 状态异常', type: 'warning' },
        { time: '10 分钟前', action: '创建新的转发规则', type: 'success' },
        { time: '15 分钟前', action: '用户 test@example.com 注册', type: 'info' },
        { time: '20 分钟前', action: '服务器 EU-01 负载过高', type: 'warning' },
      ]
    })
  }),
]
