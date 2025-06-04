import { httpClient, ApiResponse } from '@/utils/http-client';

// 系统概览数据类型
export interface SystemOverview {
  userCount: number;
  serverCount: number;
  ruleCount: number;
  monthlyTraffic: number; // GB
}

// 流量趋势数据类型
export interface TrafficTrendItem {
  date: string;
  traffic: number; // GB
}

// 用户流量占比数据类型
export interface UserTrafficItem {
  user: string;
  value: number; // 百分比
  traffic: number; // 实际流量GB
}

// 服务器状态数据类型
export interface ServerStatusItem {
  region: string;
  online: number;
  offline: number;
  total: number;
}

// 规则状态统计数据类型
export interface RuleStatusStats {
  active: number;
  paused: number;
  error: number;
  total: number;
}

// 系统性能数据类型
export interface SystemPerformance {
  cpuUsage: number; // 百分比
  memoryUsage: number; // 百分比
  diskUsage: number; // 百分比
  networkIn: number; // MB/s
  networkOut: number; // MB/s
}

// 实时流量数据类型
export interface RealTimeTraffic {
  timestamp: string;
  upload: number; // MB/s
  download: number; // MB/s
  connections: number;
}

class DashboardService {
  private readonly endpoint = '/dashboard';

  /**
   * 获取系统概览数据
   */
  async getSystemOverview(): Promise<ApiResponse<SystemOverview>> {
    return httpClient.get<SystemOverview>(`${this.endpoint}/overview`);
  }

  /**
   * 获取流量趋势数据
   */
  async getTrafficTrend(params: {
    days?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ApiResponse<TrafficTrendItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.days) queryParams.days = params.days.toString();
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;

    return httpClient.get<TrafficTrendItem[]>(`${this.endpoint}/traffic-trend`, queryParams);
  }

  /**
   * 获取用户流量占比数据
   */
  async getUserTrafficStats(params: {
    limit?: number;
    period?: 'day' | 'week' | 'month';
  } = {}): Promise<ApiResponse<UserTrafficItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.period) queryParams.period = params.period;

    return httpClient.get<UserTrafficItem[]>(`${this.endpoint}/user-traffic`, queryParams);
  }

  /**
   * 获取服务器状态统计
   */
  async getServerStatusStats(): Promise<ApiResponse<ServerStatusItem[]>> {
    return httpClient.get<ServerStatusItem[]>(`${this.endpoint}/server-status`);
  }

  /**
   * 获取规则状态统计
   */
  async getRuleStatusStats(): Promise<ApiResponse<RuleStatusStats>> {
    return httpClient.get<RuleStatusStats>(`${this.endpoint}/rule-status`);
  }

  /**
   * 获取系统性能数据
   */
  async getSystemPerformance(): Promise<ApiResponse<SystemPerformance>> {
    return httpClient.get<SystemPerformance>(`${this.endpoint}/performance`);
  }

  /**
   * 获取实时流量数据
   */
  async getRealTimeTraffic(): Promise<ApiResponse<RealTimeTraffic[]>> {
    return httpClient.get<RealTimeTraffic[]>(`${this.endpoint}/realtime-traffic`);
  }

  /**
   * 获取系统告警信息
   */
  async getSystemAlerts(): Promise<ApiResponse<{
    id: number;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    resolved: boolean;
  }[]>> {
    return httpClient.get(`${this.endpoint}/alerts`);
  }

  /**
   * 获取热门规则排行
   */
  async getTopRules(limit: number = 10): Promise<ApiResponse<{
    ruleId: string;
    ruleName: string;
    traffic: number;
    connections: number;
  }[]>> {
    return httpClient.get(`${this.endpoint}/top-rules`, { limit: limit.toString() });
  }

  /**
   * 获取系统日志摘要
   */
  async getLogSummary(params: {
    hours?: number;
    level?: 'info' | 'warning' | 'error';
  } = {}): Promise<ApiResponse<{
    total: number;
    info: number;
    warning: number;
    error: number;
    recentLogs: {
      timestamp: string;
      level: string;
      message: string;
    }[];
  }>> {
    const queryParams: Record<string, string> = {};
    
    if (params.hours) queryParams.hours = params.hours.toString();
    if (params.level) queryParams.level = params.level;

    return httpClient.get(`${this.endpoint}/log-summary`, queryParams);
  }

  /**
   * 获取地理流量分布
   */
  async getTrafficByRegion(): Promise<ApiResponse<{
    region: string;
    country: string;
    traffic: number;
    users: number;
  }[]>> {
    return httpClient.get(`${this.endpoint}/traffic-by-region`);
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<ApiResponse<{
    overall: 'healthy' | 'warning' | 'critical';
    components: {
      name: string;
      status: 'up' | 'down' | 'degraded';
      message?: string;
    }[];
  }>> {
    return httpClient.get(`${this.endpoint}/health`);
  }

  /**
   * 刷新仪表盘缓存
   */
  async refreshDashboard(): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${this.endpoint}/refresh`);
  }
}

// 创建并导出服务实例
export const dashboardService = new DashboardService();
export default DashboardService; 