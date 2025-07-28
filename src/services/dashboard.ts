// 使用 proto 生成类型的 Dashboard Service
import { httpClient, ApiResponse } from '@/utils/http-client';
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
  GetTrafficTrendRequest,
  GetUserTrafficStatsRequest,
  GetTopRulesRequest,
  GetLogSummaryRequest,
} from '@/types/generated/api/dashboard/dashboard_service';

class DashboardService {
  private readonly endpoint = '/v1/dashboard';

  /**
   * 获取系统概览数据
   */
  async getSystemOverview(): Promise<ApiResponse<SystemOverview>> {
    return await httpClient.get<SystemOverview>(`${this.endpoint}/overview`);
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return await httpClient.get<SystemHealth>(`${this.endpoint}/health`);
  }

  /**
   * 获取流量趋势数据
   */
  async getTrafficTrend(params: GetTrafficTrendRequest = {}): Promise<ApiResponse<TrafficTrendItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.days) queryParams.days = params.days.toString();
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;

    return await httpClient.get<TrafficTrendItem[]>(`${this.endpoint}/traffic-trend`, queryParams);
  }

  /**
   * 获取地理流量分布
   */
  async getTrafficByRegion(): Promise<ApiResponse<TrafficByRegion[]>> {
    return await httpClient.get<TrafficByRegion[]>(`${this.endpoint}/traffic-by-region`);
  }

  /**
   * 获取实时流量数据
   */
  async getRealTimeTraffic(): Promise<ApiResponse<RealTimeTraffic[]>> {
    return await httpClient.get<RealTimeTraffic[]>(`${this.endpoint}/real-time-traffic`);
  }

  /**
   * 获取系统性能数据
   */
  async getSystemPerformance(): Promise<ApiResponse<SystemPerformance>> {
    return await httpClient.get<SystemPerformance>(`${this.endpoint}/performance`);
  }

  /**
   * 获取系统告警信息
   */
  async getSystemAlerts(): Promise<ApiResponse<SystemAlert[]>> {
    return await httpClient.get<SystemAlert[]>(`${this.endpoint}/alerts`);
  }

  /**
   * 获取热门规则排行
   */
  async getTopRules(params: GetTopRulesRequest): Promise<ApiResponse<TopRule[]>> {
    const queryParams: Record<string, string> = {};
    if (params.limit) queryParams.limit = params.limit.toString();

    return await httpClient.get<TopRule[]>(`${this.endpoint}/top-rules`, queryParams);
  }

  /**
   * 获取规则状态统计
   */
  async getRuleStatus(): Promise<ApiResponse<RuleStatusStats>> {
    return await httpClient.get<RuleStatusStats>(`${this.endpoint}/rule-status`);
  }

  /**
   * 获取服务器状态统计
   */
  async getServerStatus(): Promise<ApiResponse<ServerStatusItem[]>> {
    return await httpClient.get<ServerStatusItem[]>(`${this.endpoint}/server-status`);
  }

  /**
   * 获取用户流量统计
   */
  async getUserTrafficStats(params: GetUserTrafficStatsRequest = {}): Promise<ApiResponse<UserTrafficItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.period) queryParams.period = params.period.toString();

    return await httpClient.get<UserTrafficItem[]>(`${this.endpoint}/user-traffic-stats`, queryParams);
  }

  /**
   * 获取系统日志摘要
   */
  async getLogSummary(params: GetLogSummaryRequest = {}): Promise<ApiResponse<LogSummary>> {
    const queryParams: Record<string, string> = {};
    
    if (params.hours) queryParams.hours = params.hours.toString();
    if (params.level) queryParams.level = params.level.toString();

    return await httpClient.get<LogSummary>(`${this.endpoint}/log-summary`, queryParams);
  }

  /**
   * 刷新仪表盘缓存
   */
  async refreshDashboard(): Promise<ApiResponse<void>> {
    return await httpClient.post<void>(`${this.endpoint}/refresh`);
  }
}

// 创建并导出服务实例
export const dashboardService = new DashboardService();
export default DashboardService; 