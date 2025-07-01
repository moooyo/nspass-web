import { http, HttpResponse } from 'msw';
import type {
  SystemOverview,
  TrafficTrendItem,
  UserTrafficItem,
  ServerStatusItem,
  RuleStatusStats,
  SystemPerformance,
  RealTimeTraffic,
  SystemAlert,
  TopRule,
  LogSummary,
  TrafficByRegion,
  SystemHealth
} from '@/types/generated/api/dashboard/dashboard_service';
import {
  ComponentStatus,
  HealthStatus,
  AlertType
} from '@/types/generated/api/dashboard/dashboard_service';

// Local mock types to avoid conflicts with generated types
interface MockSystemOverview {
  totalUsers: number;
  activeUsers: number;
  totalServers: number;
  onlineServers: number;
  totalTraffic: string;
  monthlyTraffic: string;
}

interface MockSystemHealth {
  status: 'healthy' | 'warning' | 'error';
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: string;
  }>;
  cpu: number;
  memory: number;
  disk: number;
}

interface MockTrafficTrendItem {
  date: string;
  upload: number;
  download: number;
}

interface MockTrafficByRegion {
  region: string;
  traffic: number;
  percentage: number;
}

interface MockRealTimeTraffic {
  timestamp: string;
  upload: number;
  download: number;
}

interface MockSystemPerformance {
  cpu: {
    usage: number;
    cores: number;
    loadAvg: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

interface MockSystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface MockLogSummary {
  total: number;
  info: number;
  warning: number;
  error: number;
  recentLogs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

interface MockTopRule {
  ruleId: string;
  ruleName: string;
  traffic: number;
  connections: number;
}

interface MockRuleStatusStats {
  active: number;
  paused: number;
  error: number;
  total: number;
}

interface MockServerStatusItem {
  region: string;
  online: number;
  offline: number;
  total: number;
}

interface MockUserTrafficItem {
  user: string;
  value: number;
  traffic: number;
}

// 模拟数据
const mockSystemOverview: MockSystemOverview = {
  totalUsers: 1250,
  activeUsers: 892,
  totalServers: 12,
  onlineServers: 10,
  totalTraffic: '2.3TB',
  monthlyTraffic: '450GB'
};

const mockSystemHealth: MockSystemHealth = {
  status: 'healthy',
  services: [
    { name: '主服务', status: 'running', uptime: '99.9%' },
    { name: '数据库', status: 'running', uptime: '99.8%' },
    { name: '缓存服务', status: 'running', uptime: '99.7%' },
    { name: '消息队列', status: 'stopped', uptime: '98.5%' }
  ],
  cpu: 45.2,
  memory: 68.7,
  disk: 34.1
};

const mockTrafficTrend: MockTrafficTrendItem[] = [
  { date: '2024-01-01', upload: 120, download: 340 },
  { date: '2024-01-02', upload: 132, download: 398 },
  { date: '2024-01-03', upload: 101, download: 280 },
  { date: '2024-01-04', upload: 134, download: 390 },
  { date: '2024-01-05', upload: 90, download: 320 },
  { date: '2024-01-06', upload: 230, download: 480 },
  { date: '2024-01-07', upload: 210, download: 520 }
];

const mockTrafficByRegion: MockTrafficByRegion[] = [
  { region: 'Asia', traffic: 1250, percentage: 45.2 },
  { region: 'North America', traffic: 890, percentage: 32.1 },
  { region: 'Europe', traffic: 456, percentage: 16.4 },
  { region: 'Others', traffic: 178, percentage: 6.3 }
];

const mockRealTimeTraffic: MockRealTimeTraffic[] = [
  { timestamp: '2024-01-07T10:00:00Z', upload: 45, download: 123 },
  { timestamp: '2024-01-07T10:01:00Z', upload: 52, download: 134 },
  { timestamp: '2024-01-07T10:02:00Z', upload: 38, download: 98 },
  { timestamp: '2024-01-07T10:03:00Z', upload: 61, download: 156 },
  { timestamp: '2024-01-07T10:04:00Z', upload: 47, download: 127 }
];

const mockSystemPerformance: MockSystemPerformance = {
  cpu: {
    usage: 45.2,
    cores: 8,
    loadAvg: [1.2, 1.5, 1.8]
  },
  memory: {
    used: 6871,
    total: 16384,
    percentage: 41.9
  },
  disk: {
    used: 341,
    total: 1000,
    percentage: 34.1
  },
  network: {
    bytesIn: 1250000,
    bytesOut: 890000,
    packetsIn: 12500,
    packetsOut: 8900
  }
};

const mockSystemAlerts: MockSystemAlert[] = [
  {
    id: '1',
    level: 'warning',
    message: '内存使用率超过80%',
    timestamp: '2024-01-07T10:15:00Z',
    acknowledged: false
  },
  {
    id: '2',
    level: 'info',
    message: '系统备份已完成',
    timestamp: '2024-01-07T09:00Z',
    acknowledged: true
  },
  {
    id: '3',
    level: 'error',
    message: '数据库连接异常',
    timestamp: '2024-01-07T08:45:00Z',
    acknowledged: false
  }
];

const mockTopRules: TopRule[] = [
  { ruleId: 'rule_001', ruleName: 'HTTP代理规则', traffic: 234.5, connections: 89 },
  { ruleId: 'rule_002', ruleName: 'SOCKS5代理', traffic: 198.7, connections: 67 },
  { ruleId: 'rule_003', ruleName: 'Shadowsocks', traffic: 176.3, connections: 54 }
];

const mockRuleStatusStats: RuleStatusStats = {
  active: 142,
  paused: 8,
  error: 6,
  total: 156
};

const mockServerStatusStats: ServerStatusItem[] = [
  { region: '北京', online: 4, offline: 0, total: 4 },
  { region: '上海', online: 3, offline: 1, total: 4 },
  { region: '广州', online: 2, offline: 0, total: 2 },
  { region: '深圳', online: 2, offline: 0, total: 2 }
];

const mockUserTrafficStats: UserTrafficItem[] = [
  { user: 'user001', value: 25.4, traffic: 125.8 },
  { user: 'user002', value: 18.7, traffic: 92.6 },
  { user: 'user003', value: 15.2, traffic: 75.3 },
  { user: 'user004', value: 12.8, traffic: 63.4 },
  { user: 'user005', value: 9.9, traffic: 49.1 }
];

const mockLogSummary: MockLogSummary = {
  total: 2847,
  info: 2456,
  warning: 298,
  error: 93,
  recentLogs: [
    { timestamp: '2024-01-07T10:15:00Z', level: 'ERROR', message: '数据库连接超时' },
    { timestamp: '2024-01-07T10:12:00Z', level: 'WARNING', message: '内存使用率较高' },
    { timestamp: '2024-01-07T10:10:00Z', level: 'INFO', message: '用户登录成功' }
  ]
};

export const dashboardHandlers = [
  // 获取系统概览
  http.get('/v1/dashboard/overview', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取系统概览成功',
      data: mockSystemOverview
    });
  }),

  // 获取系统健康状态
  http.get('/v1/dashboard/health', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取系统健康状态成功',
      data: mockSystemHealth
    });
  }),

  // 获取流量趋势
  http.get('/v1/dashboard/traffic-trend', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取流量趋势成功',
      data: mockTrafficTrend
    });
  }),

  // 获取地理流量分布
  http.get('/v1/dashboard/traffic-by-region', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取地理流量分布成功',
      data: mockTrafficByRegion
    });
  }),

  // 获取实时流量
  http.get('/v1/dashboard/real-time-traffic', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取实时流量成功',
      data: mockRealTimeTraffic
    });
  }),

  // 获取系统性能
  http.get('/v1/dashboard/performance', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取系统性能成功',
      data: mockSystemPerformance
    });
  }),

  // 获取系统告警
  http.get('/v1/dashboard/alerts', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取系统告警成功',
      data: mockSystemAlerts
    });
  }),

  // 获取热门规则
  http.get('/v1/dashboard/top-rules', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const limitedRules = mockTopRules.slice(0, limit);
    
    return HttpResponse.json({
      success: true,
      message: '获取热门规则成功',
      data: limitedRules
    });
  }),

  // 获取规则状态统计
  http.get('/v1/dashboard/rule-status', () => {
    return HttpResponse.json({
      success: true,
      message: '获取规则状态统计成功',
      data: mockRuleStatusStats
    });
  }),

  // 获取服务器状态统计
  http.get('/v1/dashboard/server-status', () => {
    return HttpResponse.json({
      success: true,
      message: '获取服务器状态统计成功',
      data: mockServerStatusStats
    });
  }),

  // 获取用户流量统计
  http.get('/v1/dashboard/user-traffic-stats', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const limitedStats = mockUserTrafficStats.slice(0, limit);
    
    return HttpResponse.json({
      success: true,
      message: '获取用户流量统计成功',
      data: limitedStats
    });
  }),

  // 获取日志摘要
  http.get('/v1/dashboard/logs', () => {
    return HttpResponse.json({
      success: true, 
      message: '获取日志摘要成功',
      data: mockLogSummary
    });
  }),

  // 刷新仪表板数据
  http.post('/v1/dashboard/refresh', () => {
    return HttpResponse.json({
      success: true, 
      message: '仪表板数据已刷新'
    });
  })
]; 