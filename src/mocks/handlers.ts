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

  // Subscription Management
  http.get('*/v1/subscriptions', ({ request }) => {
    incrementRequests()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const mockSubscriptions = [
      {
        id: '1',
        name: 'iOS订阅',
        type: 'surge',
        status: 'active',
        requests: 1234,
        lastAccess: '2024-01-15T10:30:00Z',
        userAgent: 'Surge iOS/4.11.1',
        expiresAt: '2024-12-31T23:59:59Z',
        description: 'iOS设备专用订阅配置'
      },
      {
        id: '2',
        name: 'Android订阅',
        type: 'clash',
        status: 'active',
        requests: 856,
        lastAccess: '2024-01-15T09:15:00Z',
        userAgent: 'Clash for Android/2.5.12',
        description: 'Android设备订阅配置'
      }
    ]
    
    return HttpResponse.json({
      success: true,
      data: {
        subscriptions: mockSubscriptions,
        total: mockSubscriptions.length,
        page,
        limit
      }
    })
  }),

  http.post('*/v1/subscriptions', async ({ request }) => {
    incrementRequests()
    const body = await request.json() as any
    
    return HttpResponse.json({
      success: true,
      message: '订阅创建成功',
      data: {
        id: Date.now().toString(),
        ...body,
        requests: 0,
        createdAt: new Date().toISOString()
      }
    })
  }),

  http.delete('*/v1/subscriptions/:id', ({ params }) => {
    incrementRequests()
    return HttpResponse.json({
      success: true,
      message: '订阅删除成功'
    })
  }),

  // Egress Management
  http.get('*/v1/egress', () => {
    incrementRequests()
    const mockEgress = [
      {
        id: '1',
        name: 'US-West-SS',
        type: 'shadowsocks',
        server: 'us-west.example.com',
        port: 8388,
        status: 'running',
        protocol: 'shadowsocks',
        encryption: 'aes-256-gcm',
        traffic: 15.6 * 1024 * 1024 * 1024,
        connections: 23,
        lastActive: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'EU-Central-Trojan',
        type: 'trojan',
        server: 'eu-central.example.com',
        port: 443,
        status: 'running',
        protocol: 'trojan',
        traffic: 8.2 * 1024 * 1024 * 1024,
        connections: 15,
        lastActive: '2024-01-15T09:45:00Z'
      }
    ]
    
    return HttpResponse.json({
      success: true,
      data: mockEgress
    })
  }),

  http.post('*/v1/egress', async ({ request }) => {
    incrementRequests()
    const body = await request.json() as any
    
    return HttpResponse.json({
      success: true,
      message: '出口配置创建成功',
      data: {
        id: Date.now().toString(),
        ...body,
        status: 'stopped',
        traffic: 0,
        connections: 0,
        createdAt: new Date().toISOString()
      }
    })
  }),

  // Routes Management
  http.get('*/v1/routes', () => {
    incrementRequests()
    const mockRoutes = [
      {
        id: '1',
        name: '美国线路A',
        path: ['SH-01', 'HK-02', 'US-West'],
        egress: 'US-West-SS',
        status: 'active',
        priority: 1,
        traffic: 12.5 * 1024 * 1024 * 1024,
        latency: 156,
        connections: 45,
        createdAt: '2024-01-10T08:00:00Z',
        lastActive: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: '欧洲直连',
        path: ['BJ-01', 'EU-Central'],
        egress: 'EU-Central-Trojan',
        status: 'active',
        priority: 2,
        traffic: 8.3 * 1024 * 1024 * 1024,
        latency: 203,
        connections: 28,
        createdAt: '2024-01-08T14:30:00Z',
        lastActive: '2024-01-15T09:45:00Z'
      }
    ]
    
    return HttpResponse.json({
      success: true,
      data: mockRoutes
    })
  }),

  // Forward Rules Management
  http.get('*/v1/forward-rules', () => {
    incrementRequests()
    const mockForwardRules = [
      {
        id: '1',
        name: 'HTTP代理转发',
        sourceServer: 'SH-01',
        sourcePort: 8080,
        targetServer: 'HK-02',
        targetPort: 3128,
        protocol: 'tcp',
        status: 'active',
        priority: 1,
        connections: 67,
        traffic: 8.5 * 1024 * 1024 * 1024,
        latency: 45,
        createdAt: '2024-01-10T08:00:00Z',
        lastActive: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'HTTPS流量转发',
        sourceServer: 'BJ-01',
        sourcePort: 443,
        targetServer: 'US-West',
        targetPort: 443,
        protocol: 'tcp',
        status: 'active',
        priority: 2,
        connections: 123,
        traffic: 15.2 * 1024 * 1024 * 1024,
        latency: 156,
        createdAt: '2024-01-08T14:30:00Z',
        lastActive: '2024-01-15T10:25:00Z'
      }
    ]
    
    return HttpResponse.json({
      success: true,
      data: mockForwardRules
    })
  }),

  // IPTables Management  
  http.get('*/v1/iptables', () => {
    incrementRequests()
    const mockIptablesRules = [
      {
        id: '1',
        name: 'SSH访问限制',
        chain: 'INPUT',
        table: 'filter',
        protocol: 'tcp',
        source: '192.168.1.0/24',
        destination: 'any',
        port: '22',
        action: 'ACCEPT',
        status: 'active',
        priority: 1,
        matches: 1547,
        bytes: 234567,
        createdAt: '2024-01-10T08:00:00Z',
        lastMatch: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'HTTP流量转发',
        chain: 'PREROUTING',
        table: 'nat',
        protocol: 'tcp',
        source: 'any',
        destination: '10.0.0.1',
        port: '80',
        action: 'REDIRECT',
        status: 'active',
        priority: 2,
        matches: 45623,
        bytes: 123456789,
        createdAt: '2024-01-08T14:30:00Z',
        lastMatch: '2024-01-15T10:25:00Z'
      }
    ]
    
    return HttpResponse.json({
      success: true,
      data: mockIptablesRules
    })
  }),

  // DNS Configuration
  http.get('*/v1/dns/configs', () => {
    incrementRequests()
    const mockDnsConfigs = [
      {
        id: '1',
        name: 'Cloudflare DNS',
        provider: 'cloudflare',
        apiKey: '****key****',
        email: 'admin@example.com',
        status: 'active',
        domains: ['example.com', 'sub.example.com'],
        lastUpdate: '2024-01-15T10:30:00Z'
      }
    ]
    
    return HttpResponse.json({
      success: true,
      data: mockDnsConfigs
    })
  }),
]
