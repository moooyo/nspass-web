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
} from '@/types/generated/api/dashboard/dashboard';
import {
  ComponentStatus,
  HealthStatus,
  AlertType
} from '@/types/generated/api/dashboard/dashboard';

// 模拟响应数据
const mockSystemOverview: SystemOverview = {
  userCount: 1248,
  serverCount: 12,
  ruleCount: 156,
  monthlyTraffic: 2458.6
};

const mockSystemHealth: SystemHealth = {
  overall: HealthStatus.HEALTH_STATUS_HEALTHY,
  components: [
    { name: '数据库', status: ComponentStatus.COMPONENT_STATUS_UP },
    { name: '缓存', status: ComponentStatus.COMPONENT_STATUS_UP },
    { name: '网络', status: ComponentStatus.COMPONENT_STATUS_UP },
    { name: '存储', status: ComponentStatus.COMPONENT_STATUS_DEGRADED, message: '磁盘使用率较高' }
  ]
};

const mockTrafficTrend: TrafficTrendItem[] = [
  { date: '2024-01-01', traffic: 120.5 },
  { date: '2024-01-02', traffic: 135.8 },
  { date: '2024-01-03', traffic: 142.3 },
  { date: '2024-01-04', traffic: 128.9 },
  { date: '2024-01-05', traffic: 156.7 },
  { date: '2024-01-06', traffic: 168.2 },
  { date: '2024-01-07', traffic: 175.4 }
];

const mockTrafficByRegion: TrafficByRegion[] = [
  { region: '北京', country: '中国', traffic: 458.3, users: 342 },
  { region: '上海', country: '中国', traffic: 386.7, users: 289 },
  { region: '广州', country: '中国', traffic: 298.5, users: 198 },
  { region: '深圳', country: '中国', traffic: 267.9, users: 156 }
];

const mockRealTimeTraffic: RealTimeTraffic[] = [
  { timestamp: '2024-01-07T10:00:00Z', upload: 12.5, download: 24.8, connections: 156 },
  { timestamp: '2024-01-07T10:05:00Z', upload: 13.2, download: 26.1, connections: 162 },
  { timestamp: '2024-01-07T10:10:00Z', upload: 11.8, download: 23.4, connections: 148 }
];

const mockSystemPerformance: SystemPerformance = {
  cpuUsage: 65.4,
  memoryUsage: 72.8,
  diskUsage: 84.2,
  networkIn: 45.6,
  networkOut: 38.9
};

const mockSystemAlerts: SystemAlert[] = [
  {
    id: 1,
    type: AlertType.ALERT_TYPE_WARNING,
    message: '磁盘使用率超过80%',
    timestamp: '2024-01-07T09:30:00Z',
    resolved: false
  },
  {
    id: 2,
    type: AlertType.ALERT_TYPE_INFO,
    message: '新用户注册',
    timestamp: '2024-01-07T09:25:00Z',
    resolved: true
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

const mockLogSummary: LogSummary = {
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
  http.get('/api/v1/dashboard/overview', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取系统概览成功' },
      data: mockSystemOverview
    });
  }),

  // 获取系统健康状态
  http.get('/api/v1/dashboard/health', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取系统健康状态成功' },
      data: mockSystemHealth
    });
  }),

  // 获取流量趋势
  http.get('/api/v1/dashboard/traffic-trend', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取流量趋势成功' },
      data: mockTrafficTrend
    });
  }),

  // 获取地理流量分布
  http.get('/api/v1/dashboard/traffic-by-region', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取地理流量分布成功' },
      data: mockTrafficByRegion
    });
  }),

  // 获取实时流量
  http.get('/api/v1/dashboard/real-time-traffic', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取实时流量成功' },
      data: mockRealTimeTraffic
    });
  }),

  // 获取系统性能
  http.get('/api/v1/dashboard/performance', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取系统性能成功' },
      data: mockSystemPerformance
    });
  }),

  // 获取系统告警
  http.get('/api/v1/dashboard/alerts', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取系统告警成功' },
      data: mockSystemAlerts
    });
  }),

  // 获取热门规则
  http.get('/api/v1/dashboard/top-rules', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const limitedRules = mockTopRules.slice(0, limit);
    
    return HttpResponse.json({
      base: { success: true, message: '获取热门规则成功' },
      data: limitedRules
    });
  }),

  // 获取规则状态统计
  http.get('/api/v1/dashboard/rule-status', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取规则状态统计成功' },
      data: mockRuleStatusStats
    });
  }),

  // 获取服务器状态统计
  http.get('/api/v1/dashboard/server-status', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取服务器状态统计成功' },
      data: mockServerStatusStats
    });
  }),

  // 获取用户流量统计
  http.get('/api/v1/dashboard/user-traffic-stats', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const limitedStats = mockUserTrafficStats.slice(0, limit);
    
    return HttpResponse.json({
      base: { success: true, message: '获取用户流量统计成功' },
      data: limitedStats
    });
  }),

  // 获取日志摘要
  http.get('/api/v1/dashboard/log-summary', () => {
    return HttpResponse.json({
      base: { success: true, message: '获取日志摘要成功' },
      data: mockLogSummary
    });
  }),

  // 刷新仪表盘
  http.post('/api/v1/dashboard/refresh', () => {
    return HttpResponse.json({
      base: { success: true, message: '仪表盘刷新成功' }
    });
  })
]; 