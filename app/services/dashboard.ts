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
  GetSystemOverviewResponse,
  GetTrafficTrendResponse,
  GetUserTrafficStatsResponse,
  GetServerStatusStatsResponse,
  GetRuleStatusStatsResponse,
  GetSystemPerformanceResponse,
  GetRealTimeTrafficResponse,
  GetSystemAlertsResponse,
  GetTopRulesResponse,
  GetLogSummaryResponse,
  GetTrafficByRegionResponse,
  GetSystemHealthResponse,
  RefreshDashboardResponse,
  TimePeriod,
  LogLevel
} from '@/types/generated/api/dashboard/dashboard';
import type { ApiResponse as CommonApiResponse } from '@/types/generated/common';

// 将httpClient的ApiResponse转换为proto响应格式的辅助函数
function toProtoResponse<T>(response: ApiResponse<T>): { base?: CommonApiResponse; data?: T } {
  return {
    base: {
      success: response.success,
      message: response.message,
      errorCode: response.success ? undefined : 'API_ERROR'
    },
    data: response.data
  };
}

class DashboardService {
  private readonly endpoint = '/dashboard';

  /**
   * 获取系统概览数据
   */
  async getSystemOverview(): Promise<GetSystemOverviewResponse> {
    const response = await httpClient.get<SystemOverview>(`${this.endpoint}/overview`);
    return toProtoResponse(response);
  }

  /**
   * 获取流量趋势数据
   */
  async getTrafficTrend(params: GetTrafficTrendRequest = {}): Promise<GetTrafficTrendResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.days) queryParams.days = params.days.toString();
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;

    const response = await httpClient.get<TrafficTrendItem[]>(`${this.endpoint}/traffic-trend`, queryParams);
    return toProtoResponse(response);
  }

  /**
   * 获取用户流量占比数据
   */
  async getUserTrafficStats(params: GetUserTrafficStatsRequest = {}): Promise<GetUserTrafficStatsResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.period) queryParams.period = params.period;

    const response = await httpClient.get<UserTrafficItem[]>(`${this.endpoint}/user-traffic`, queryParams);
    return toProtoResponse(response);
  }

  /**
   * 获取服务器状态统计
   */
  async getServerStatusStats(): Promise<GetServerStatusStatsResponse> {
    const response = await httpClient.get<ServerStatusItem[]>(`${this.endpoint}/server-status`);
    return toProtoResponse(response);
  }

  /**
   * 获取规则状态统计
   */
  async getRuleStatusStats(): Promise<GetRuleStatusStatsResponse> {
    const response = await httpClient.get<RuleStatusStats>(`${this.endpoint}/rule-status`);
    return toProtoResponse(response);
  }

  /**
   * 获取系统性能数据
   */
  async getSystemPerformance(): Promise<GetSystemPerformanceResponse> {
    const response = await httpClient.get<SystemPerformance>(`${this.endpoint}/performance`);
    return toProtoResponse(response);
  }

  /**
   * 获取实时流量数据
   */
  async getRealTimeTraffic(): Promise<GetRealTimeTrafficResponse> {
    const response = await httpClient.get<RealTimeTraffic[]>(`${this.endpoint}/realtime-traffic`);
    return toProtoResponse(response);
  }

  /**
   * 获取系统告警信息
   */
  async getSystemAlerts(): Promise<GetSystemAlertsResponse> {
    const response = await httpClient.get<SystemAlert[]>(`${this.endpoint}/alerts`);
    return toProtoResponse(response);
  }

  /**
   * 获取热门规则排行
   */
  async getTopRules(params: GetTopRulesRequest): Promise<GetTopRulesResponse> {
    const response = await httpClient.get<TopRule[]>(`${this.endpoint}/top-rules`, { 
      limit: params.limit?.toString() || '10' 
    });
    return toProtoResponse(response);
  }

  /**
   * 获取系统日志摘要
   */
  async getLogSummary(params: GetLogSummaryRequest = {}): Promise<GetLogSummaryResponse> {
    const queryParams: Record<string, string> = {};
    
    if (params.hours) queryParams.hours = params.hours.toString();
    if (params.level) queryParams.level = params.level;

    const response = await httpClient.get<LogSummary>(`${this.endpoint}/log-summary`, queryParams);
    return toProtoResponse(response);
  }

  /**
   * 获取地理流量分布
   */
  async getTrafficByRegion(): Promise<GetTrafficByRegionResponse> {
    const response = await httpClient.get<TrafficByRegion[]>(`${this.endpoint}/traffic-by-region`);
    return toProtoResponse(response);
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<GetSystemHealthResponse> {
    const response = await httpClient.get<SystemHealth>(`${this.endpoint}/health`);
    return toProtoResponse(response);
  }

  /**
   * 刷新仪表盘缓存
   */
  async refreshDashboard(): Promise<RefreshDashboardResponse> {
    const response = await httpClient.post<void>(`${this.endpoint}/refresh`);
    return toProtoResponse(response);
  }
}

// 创建并导出服务实例
export const dashboardService = new DashboardService();
export default DashboardService;

// 导出常用类型和枚举
export type {
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
  GetLogSummaryRequest
} from '@/types/generated/api/dashboard/dashboard';

// 单独导出枚举作为值
export {
  TimePeriod,
  LogLevel
} from '@/types/generated/api/dashboard/dashboard'; 