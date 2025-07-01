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
  SystemHealth,
  SystemComponent
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

// 模拟数据 - 使用正确的Proto格式
const mockSystemOverview: SystemOverview = {
  userCount: 1250,
  serverCount: 12,
  ruleCount: 356,
  monthlyTraffic: 450 // GB
};

const mockSystemHealth: SystemHealth = {
  overall: HealthStatus.HEALTH_STATUS_HEALTHY,
  components: [
    { 
      name: '主服务', 
      status: ComponentStatus.COMPONENT_STATUS_UP, 
      message: '运行正常' 
    },
    { 
      name: '数据库', 
      status: ComponentStatus.COMPONENT_STATUS_UP, 
      message: '连接正常' 
    },
    { 
      name: '缓存服务', 
      status: ComponentStatus.COMPONENT_STATUS_UP, 
      message: '缓存命中率正常' 
    },
    { 
      name: '消息队列', 
      status: ComponentStatus.COMPONENT_STATUS_DEGRADED, 
      message: '性能略有下降' 
    }
  ]
};

const mockTrafficTrend: TrafficTrendItem[] = [
  { date: '2024-01-01', traffic: 120 },
  { date: '2024-01-02', traffic: 132 },
  { date: '2024-01-03', traffic: 101 },
  { date: '2024-01-04', traffic: 134 },
  { date: '2024-01-05', traffic: 90 },
  { date: '2024-01-06', traffic: 230 },
  { date: '2024-01-07', traffic: 210 },
  { date: '2024-01-08', traffic: 189 },
  { date: '2024-01-09', traffic: 156 },
  { date: '2024-01-10', traffic: 178 },
  { date: '2024-01-11', traffic: 145 },
  { date: '2024-01-12', traffic: 167 },
  { date: '2024-01-13', traffic: 198 },
  { date: '2024-01-14', traffic: 234 },
  { date: '2024-01-15', traffic: 187 },
  { date: '2024-01-16', traffic: 156 },
  { date: '2024-01-17', traffic: 145 },
  { date: '2024-01-18', traffic: 167 },
  { date: '2024-01-19', traffic: 189 },
  { date: '2024-01-20', traffic: 201 },
  { date: '2024-01-21', traffic: 178 },
  { date: '2024-01-22', traffic: 165 },
  { date: '2024-01-23', traffic: 189 },
  { date: '2024-01-24', traffic: 234 },
  { date: '2024-01-25', traffic: 198 },
  { date: '2024-01-26', traffic: 167 },
  { date: '2024-01-27', traffic: 189 },
  { date: '2024-01-28', traffic: 201 },
  { date: '2024-01-29', traffic: 187 },
  { date: '2024-01-30', traffic: 156 }
];

const mockTrafficByRegion: TrafficByRegion[] = [
  { region: 'Asia', country: 'China', traffic: 1250, users: 450 },
  { region: 'North America', country: 'United States', traffic: 890, users: 320 },
  { region: 'Europe', country: 'Germany', traffic: 456, users: 164 },
  { region: 'Others', country: 'Various', traffic: 178, users: 63 }
];

const mockRealTimeTraffic: RealTimeTraffic[] = [
  { timestamp: '2024-01-07T10:00:00Z', upload: 45, download: 123, connections: 89 },
  { timestamp: '2024-01-07T10:01:00Z', upload: 52, download: 134, connections: 92 },
  { timestamp: '2024-01-07T10:02:00Z', upload: 38, download: 98, connections: 76 },
  { timestamp: '2024-01-07T10:03:00Z', upload: 61, download: 156, connections: 103 },
  { timestamp: '2024-01-07T10:04:00Z', upload: 47, download: 127, connections: 88 }
];

const mockSystemPerformance: SystemPerformance = {
  cpuUsage: 45.2,
  memoryUsage: 68.7,
  diskUsage: 34.1,
  networkIn: 125.5,
  networkOut: 89.3
};

const mockSystemAlerts: SystemAlert[] = [
  {
    id: 1,
    type: AlertType.ALERT_TYPE_WARNING,
    message: '内存使用率超过80%',
    timestamp: '2024-01-07T10:15:00Z',
    resolved: false
  },
  {
    id: 2,
    type: AlertType.ALERT_TYPE_INFO,
    message: '系统备份已完成',
    timestamp: '2024-01-07T09:00:00Z',
    resolved: true
  },
  {
    id: 3,
    type: AlertType.ALERT_TYPE_ERROR,
    message: '数据库连接异常',
    timestamp: '2024-01-07T08:45:00Z',
    resolved: false
  },
  {
    id: 4,
    type: AlertType.ALERT_TYPE_INFO,
    message: '新用户注册',
    timestamp: '2024-01-07T08:30:00Z',
    resolved: true
  },
  {
    id: 5,
    type: AlertType.ALERT_TYPE_WARNING,
    message: 'CPU使用率较高',
    timestamp: '2024-01-07T08:15:00Z',
    resolved: false
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
  http.get('/v1/dashboard/log-summary', () => {
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