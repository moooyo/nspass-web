// 使用 proto 生成类型的 Dashboard Service
import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { createServiceConfig } from '@/shared/services/ServiceConfig';
import type { StandardApiResponse } from '@/shared/types/common';
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

class DashboardService extends EnhancedBaseService {
  private readonly endpoint = '/v1/dashboard';

  constructor() {
    super(createServiceConfig('dashboard'));
  }

  /**
   * 获取系统概览数据
   */
  async getSystemOverview(): Promise<StandardApiResponse<SystemOverview>> {
    return await this.get<SystemOverview>(`${this.endpoint}/overview`);
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<StandardApiResponse<SystemHealth>> {
    return await this.get<SystemHealth>(`${this.endpoint}/health`);
  }

  /**
   * 获取流量趋势数据
   */
  async getTrafficTrend(params: GetTrafficTrendRequest = {}): Promise<StandardApiResponse<TrafficTrendItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.days) queryParams.days = params.days.toString();
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;

    return await this.get<TrafficTrendItem[]>(`${this.endpoint}/traffic-trend`, queryParams);
  }

  /**
   * 获取地理流量分布
   */
  async getTrafficByRegion(): Promise<StandardApiResponse<TrafficByRegion[]>> {
    return await this.get<TrafficByRegion[]>(`${this.endpoint}/traffic-by-region`);
  }

  /**
   * 获取实时流量数据
   */
  async getRealTimeTraffic(): Promise<StandardApiResponse<RealTimeTraffic[]>> {
    return await this.get<RealTimeTraffic[]>(`${this.endpoint}/real-time-traffic`);
  }

  /**
   * 获取系统性能数据
   */
  async getSystemPerformance(): Promise<StandardApiResponse<SystemPerformance>> {
    return await this.get<SystemPerformance>(`${this.endpoint}/performance`);
  }

  /**
   * 获取系统告警信息
   */
  async getSystemAlerts(): Promise<StandardApiResponse<SystemAlert[]>> {
    return await this.get<SystemAlert[]>(`${this.endpoint}/alerts`);
  }

  /**
   * 获取热门规则排行
   */
  async getTopRules(params: GetTopRulesRequest): Promise<StandardApiResponse<TopRule[]>> {
    const queryParams: Record<string, string> = {};
    if (params.limit) queryParams.limit = params.limit.toString();

    return await this.get<TopRule[]>(`${this.endpoint}/top-rules`, queryParams);
  }

  /**
   * 获取规则状态统计
   */
  async getRuleStatus(): Promise<StandardApiResponse<RuleStatusStats>> {
    return await this.get<RuleStatusStats>(`${this.endpoint}/rule-status`);
  }

  /**
   * 获取服务器状态统计
   */
  async getServerStatus(): Promise<StandardApiResponse<ServerStatusItem[]>> {
    return await this.get<ServerStatusItem[]>(`${this.endpoint}/server-status`);
  }

  /**
   * 获取用户流量统计
   */
  async getUserTrafficStats(params: GetUserTrafficStatsRequest = {}): Promise<StandardApiResponse<UserTrafficItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.period) queryParams.period = params.period.toString();

    return await this.get<UserTrafficItem[]>(`${this.endpoint}/user-traffic-stats`, queryParams);
  }

  /**
   * 获取系统日志摘要
   */
  async getLogSummary(params: GetLogSummaryRequest = {}): Promise<StandardApiResponse<LogSummary>> {
    const queryParams: Record<string, string> = {};

    if (params.hours) queryParams.hours = params.hours.toString();
    if (params.level) queryParams.level = params.level.toString();

    return await this.get<LogSummary>(`${this.endpoint}/log-summary`, queryParams);
  }

  /**
   * 刷新仪表盘缓存
   */
  async refreshDashboard(): Promise<StandardApiResponse<void>> {
    return await this.post<void>(`${this.endpoint}/refresh`);
  }
}

// 创建并导出服务实例
export const dashboardService = new DashboardService();
export default DashboardService; 