import { http, HttpResponse } from 'msw';
import { 
  SubscriptionData, 
  SubscriptionStats, 
  SubscriptionType,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest 
} from '@/services/subscription';

// Mock订阅数据
const mockSubscriptions: SubscriptionData[] = [
  {
    subscriptionId: 'sub_7a8f6b5c4d3e2f1a9b8c7d6e5f4a3b2c',
    type: SubscriptionType.SUBSCRIPTION_TYPE_SURGE,
    name: 'Surge 主配置',
    description: '包含所有线路的 Surge 配置文件',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    expiresAt: '2024-07-15T10:30:00Z',
    isActive: true,
    url: '/s/sub_7a8f6b5c4d3e2f1a9b8c7d6e5f4a3b2c',
    totalRequests: 1250,
    lastAccessedAt: '2024-01-20T08:30:00Z',
    userAgent: 'Surge iOS/5.0.0'
  },
  {
    subscriptionId: 'sub_9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e',
    type: SubscriptionType.SUBSCRIPTION_TYPE_CLASH,
    name: 'Clash Meta 配置',
    description: 'Clash Meta 格式的代理配置',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
    expiresAt: '2024-07-10T09:15:00Z',
    isActive: true,
    url: '/s/sub_9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e',
    totalRequests: 890,
    lastAccessedAt: '2024-01-19T12:15:00Z',
    userAgent: 'ClashX Pro/1.9.0'
  },
  {
    subscriptionId: 'sub_3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f',
    type: SubscriptionType.SUBSCRIPTION_TYPE_QUANTUMULT_X,
    name: 'QuantumultX 完整版',
    description: 'QuantumultX 完整配置，包含分流规则',
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-18T13:10:00Z',
    expiresAt: '2024-07-08T11:00:00Z',
    isActive: true,
    url: '/s/sub_3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f',
    totalRequests: 456,
    lastAccessedAt: '2024-01-18T09:45:00Z',
    userAgent: 'Quantumult%20X/1.4.1'
  },
  {
    subscriptionId: 'sub_5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    type: SubscriptionType.SUBSCRIPTION_TYPE_SHADOWSOCKS,
    name: 'Shadowsocks 原生',
    description: '原生 Shadowsocks 格式配置',
    createdAt: '2024-01-05T15:45:00Z',
    updatedAt: '2024-01-17T10:30:00Z',
    expiresAt: '2024-07-05T15:45:00Z',
    isActive: false,
    url: '/s/sub_5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    totalRequests: 234,
    lastAccessedAt: '2024-01-15T14:20:00Z',
    userAgent: 'Shadowsocks/3.5.1'
  },
  {
    subscriptionId: 'sub_7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c',
    type: SubscriptionType.SUBSCRIPTION_TYPE_LOON,
    name: 'Loon 移动端配置',
    description: 'Loon iOS 客户端专用配置',
    createdAt: '2024-01-12T08:20:00Z',
    updatedAt: '2024-01-16T17:40:00Z',
    expiresAt: '2024-07-12T08:20:00Z',
    isActive: true,
    url: '/s/sub_7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c',
    totalRequests: 678,
    lastAccessedAt: '2024-01-16T15:30:00Z',
    userAgent: 'Loon/3.2.1'
  },
  {
    subscriptionId: 'sub_1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d',
    type: SubscriptionType.SUBSCRIPTION_TYPE_V2RAY,
    name: 'V2Ray 通用配置',
    description: 'V2Ray/Xray 通用JSON配置',
    createdAt: '2024-01-03T12:10:00Z',
    updatedAt: '2024-01-14T11:25:00Z',
    expiresAt: '2024-07-03T12:10:00Z',
    isActive: true,
    url: '/s/sub_1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d',
    totalRequests: 345,
    lastAccessedAt: '2024-01-14T16:45:00Z',
    userAgent: 'v2rayN/6.23'
  }
];

// Mock统计数据
const mockStats: SubscriptionStats = {
  totalSubscriptions: 6,
  activeSubscriptions: 5,
  totalRequests: 3853,
  requestsToday: 127,
  requestsThisWeek: 892,
  requestsThisMonth: 3853,
  popularType: SubscriptionType.SUBSCRIPTION_TYPE_SURGE,
  avgRequestsPerDay: 124.3
};

// 创建可变的mock数据副本
let subscriptions = [...mockSubscriptions];
let nextId = 1000;

// 生成随机订阅ID
function generateSubscriptionId(): string {
  const chars = '0123456789abcdef';
  let result = 'sub_';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// 查找订阅
function findSubscription(subscriptionId: string): SubscriptionData | undefined {
  return subscriptions.find(s => s.subscriptionId === subscriptionId);
}

export const subscriptionHandlers = [
  // 获取订阅列表 - 匹配swagger接口 GET /v1/subscriptions
  http.get('/v1/subscriptions', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('pagination.page') || '1');
    const pageSize = parseInt(url.searchParams.get('pagination.pageSize') || '10');

    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = subscriptions.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      message: '订阅列表获取成功',
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        total: subscriptions.length,
        totalPages: Math.ceil(subscriptions.length / pageSize)
      }
    });
  }),

  // 创建订阅 - 匹配swagger接口 POST /v1/subscriptions
  http.post('/v1/subscriptions', async ({ request }) => {
    const data = await request.json() as CreateSubscriptionRequest;
    
    const subscriptionId = generateSubscriptionId();
    const newSubscription: SubscriptionData = {
      subscriptionId,
      type: data.type,
      name: data.name,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: data.expiresAt || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6个月后
      isActive: true,
      url: `/s/${subscriptionId}`,
      totalRequests: 0,
      lastAccessedAt: undefined,
      userAgent: undefined
    };

    subscriptions.push(newSubscription);

    return HttpResponse.json({
      success: true,
      message: '订阅创建成功',
      data: newSubscription
    });
  }),

  // 更新订阅 - 匹配swagger接口 PUT /v1/subscriptions/{subscriptionId}
  http.put('/v1/subscriptions/:subscriptionId', async ({ params, request }) => {
    const { subscriptionId } = params;
    const data = await request.json() as UpdateSubscriptionRequest;
    
    const subscription = findSubscription(subscriptionId as string);
    if (!subscription) {
      return HttpResponse.json({
        success: false,
        message: '订阅不存在',
        errorCode: 'SUBSCRIPTION_NOT_FOUND'
      }, { status: 404 });
    }

    // 更新订阅信息
    Object.assign(subscription, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    return HttpResponse.json({
      success: true,
      message: '订阅更新成功',
      data: subscription
    });
  }),

  // 删除订阅 - 匹配swagger接口 DELETE /v1/subscriptions/{subscriptionId}
  http.delete('/v1/subscriptions/:subscriptionId', ({ params }) => {
    const { subscriptionId } = params;
    const index = subscriptions.findIndex(s => s.subscriptionId === subscriptionId);
    
    if (index === -1) {
      return HttpResponse.json({
        success: false,
        message: '订阅不存在',
        errorCode: 'SUBSCRIPTION_NOT_FOUND'
      }, { status: 404 });
    }

    subscriptions.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: '订阅删除成功'
    });
  }),

  // 获取订阅统计 - 匹配swagger接口 GET /v1/subscriptions/stats
  http.get('/v1/subscriptions/stats', ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const type = url.searchParams.get('type');

    // 根据筛选条件调整统计数据（这里简化处理）
    let stats = { ...mockStats };
    
    if (type && type !== 'SUBSCRIPTION_TYPE_UNSPECIFIED') {
      const filteredSubs = subscriptions.filter(s => s.type === type);
      stats.totalSubscriptions = filteredSubs.length;
      stats.activeSubscriptions = filteredSubs.filter(s => s.isActive).length;
      stats.totalRequests = filteredSubs.reduce((sum, s) => sum + s.totalRequests, 0);
    }

    return HttpResponse.json({
      success: true,
      message: '订阅统计获取成功',
      data: stats
    });
  }),

  // 获取订阅内容 - 匹配swagger接口 GET /s/{subscriptionId}
  http.get('/s/:subscriptionId', ({ params, request }) => {
    const { subscriptionId } = params;
    const url = new URL(request.url);
    const userAgent = url.searchParams.get('userAgent') || request.headers.get('user-agent') || '';
    
    const subscription = findSubscription(subscriptionId as string);
    if (!subscription) {
      return HttpResponse.text('订阅不存在', { status: 404 });
    }

    if (!subscription.isActive) {
      return HttpResponse.text('订阅已禁用', { status: 403 });
    }

    // 更新访问记录
    subscription.totalRequests += 1;
    subscription.lastAccessedAt = new Date().toISOString();
    subscription.userAgent = userAgent;

    // 根据订阅类型返回不同格式的配置内容
    let configContent = '';
    
    switch (subscription.type) {
      case SubscriptionType.SUBSCRIPTION_TYPE_SURGE:
        configContent = `#!MANAGED-CONFIG ${subscription.url}
[General]
loglevel = notify
internet-test-url = http://www.baidu.com/
proxy-test-url = http://www.gstatic.com/generate_204
test-timeout = 5

[Proxy]
🇺🇸 美国节点 = ss, example.com, 443, encrypt-method=aes-256-gcm, password=password123
🇯🇵 日本节点 = ss, jp.example.com, 443, encrypt-method=aes-256-gcm, password=password123

[Proxy Group]
🚀 节点选择 = select, 🇺🇸 美国节点, 🇯🇵 日本节点

[Rule]
DOMAIN-SUFFIX,apple.com,DIRECT
DOMAIN-SUFFIX,google.com,🚀 节点选择
FINAL,🚀 节点选择`;
        break;
        
      case SubscriptionType.SUBSCRIPTION_TYPE_CLASH:
        configContent = `port: 7890
socks-port: 7891
allow-lan: false
mode: Rule
log-level: info

proxies:
  - name: "🇺🇸 美国节点"
    type: ss
    server: example.com
    port: 443
    cipher: aes-256-gcm
    password: password123
    
  - name: "🇯🇵 日本节点"
    type: ss
    server: jp.example.com
    port: 443
    cipher: aes-256-gcm
    password: password123

proxy-groups:
  - name: "🚀 节点选择"
    type: select
    proxies:
      - "🇺🇸 美国节点"
      - "🇯🇵 日本节点"

rules:
  - DOMAIN-SUFFIX,apple.com,DIRECT
  - DOMAIN-SUFFIX,google.com,🚀 节点选择
  - MATCH,🚀 节点选择`;
        break;
        
      case SubscriptionType.SUBSCRIPTION_TYPE_SHADOWSOCKS:
        configContent = `ss://YWVzLTI1Ni1nY206cGFzc3dvcmQxMjM@example.com:443#🇺🇸 美国节点
ss://YWVzLTI1Ni1nY206cGFzc3dvcmQxMjM@jp.example.com:443#🇯🇵 日本节点`;
        break;
        
      default:
        configContent = `# ${subscription.name} 配置
# 类型: ${subscription.type}
# 生成时间: ${new Date().toISOString()}

# 示例配置内容
proxy = example.com:443`;
    }

    return HttpResponse.text(configContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${subscription.name}.conf"`
      }
    });
  })
]; 