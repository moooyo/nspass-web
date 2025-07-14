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

// Proto格式的响应包装器
interface ProtoResponse<T> {
  status: {
    success: boolean;
    message: string;
    errorCode?: string;
  };
  data?: T;
}



class DashboardService {
  private readonly endpoint = '/v1/dashboard';

  /**
   * 获取系统概览数据
   */
  async getSystemOverview(): Promise<ApiResponse<SystemOverview>> {
    const response = await httpClient.get<ProtoResponse<SystemOverview>>(`${this.endpoint}/overview`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    const response = await httpClient.get<ProtoResponse<SystemHealth>>(`${this.endpoint}/health`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取流量趋势数据
   */
  async getTrafficTrend(params: GetTrafficTrendRequest = {}): Promise<ApiResponse<TrafficTrendItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.days) queryParams.days = params.days.toString();
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;

    const response = await httpClient.get<ProtoResponse<TrafficTrendItem[]>>(`${this.endpoint}/traffic-trend`, queryParams);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取地理流量分布
   */
  async getTrafficByRegion(): Promise<ApiResponse<TrafficByRegion[]>> {
    const response = await httpClient.get<ProtoResponse<TrafficByRegion[]>>(`${this.endpoint}/traffic-by-region`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取实时流量数据
   */
  async getRealTimeTraffic(): Promise<ApiResponse<RealTimeTraffic[]>> {
    const response = await httpClient.get<ProtoResponse<RealTimeTraffic[]>>(`${this.endpoint}/real-time-traffic`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取系统性能数据
   */
  async getSystemPerformance(): Promise<ApiResponse<SystemPerformance>> {
    const response = await httpClient.get<ProtoResponse<SystemPerformance>>(`${this.endpoint}/performance`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取系统告警信息
   */
  async getSystemAlerts(): Promise<ApiResponse<SystemAlert[]>> {
    const response = await httpClient.get<ProtoResponse<SystemAlert[]>>(`${this.endpoint}/alerts`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取热门规则排行
   */
  async getTopRules(params: GetTopRulesRequest): Promise<ApiResponse<TopRule[]>> {
    const queryParams: Record<string, string> = {};
    if (params.limit) queryParams.limit = params.limit.toString();

    const response = await httpClient.get<ProtoResponse<TopRule[]>>(`${this.endpoint}/top-rules`, queryParams);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取规则状态统计
   */
  async getRuleStatus(): Promise<ApiResponse<RuleStatusStats>> {
    const response = await httpClient.get<ProtoResponse<RuleStatusStats>>(`${this.endpoint}/rule-status`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取服务器状态统计
   */
  async getServerStatus(): Promise<ApiResponse<ServerStatusItem[]>> {
    const response = await httpClient.get<ProtoResponse<ServerStatusItem[]>>(`${this.endpoint}/server-status`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取用户流量统计
   */
  async getUserTrafficStats(params: GetUserTrafficStatsRequest = {}): Promise<ApiResponse<UserTrafficItem[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.period) queryParams.period = params.period.toString();

    const response = await httpClient.get<ProtoResponse<UserTrafficItem[]>>(`${this.endpoint}/user-traffic-stats`, queryParams);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 获取系统日志摘要
   */
  async getLogSummary(params: GetLogSummaryRequest = {}): Promise<ApiResponse<LogSummary>> {
    const queryParams: Record<string, string> = {};
    
    if (params.hours) queryParams.hours = params.hours.toString();
    if (params.level) queryParams.level = params.level.toString();

    const response = await httpClient.get<ProtoResponse<LogSummary>>(`${this.endpoint}/log-summary`, queryParams);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
  }

  /**
   * 刷新仪表盘缓存
   */
  async refreshDashboard(): Promise<ApiResponse<void>> {
    const response = await httpClient.post<ProtoResponse<void>>(`${this.endpoint}/refresh`);
    return {
      success: response.data?.status?.success || false,
      message: response.data?.status?.message || '',
      data: response.data?.data
    };
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
} from '@/types/generated/api/dashboard/dashboard_service';

// 单独导出枚举作为值
export {
  TimePeriod,
  LogLevel
} from '@/types/generated/api/dashboard/dashboard_service'; 