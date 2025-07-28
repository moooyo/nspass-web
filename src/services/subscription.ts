import { httpClient, ApiResponse } from '@/utils/http-client';

// 订阅类型枚举
export enum SubscriptionType {
  SUBSCRIPTION_TYPE_UNSPECIFIED = 'SUBSCRIPTION_TYPE_UNSPECIFIED',
  SUBSCRIPTION_TYPE_SURGE = 'SUBSCRIPTION_TYPE_SURGE',
  SUBSCRIPTION_TYPE_SHADOWSOCKS = 'SUBSCRIPTION_TYPE_SHADOWSOCKS',
  SUBSCRIPTION_TYPE_QUANTUMULT_X = 'SUBSCRIPTION_TYPE_QUANTUMULT_X',
  SUBSCRIPTION_TYPE_LOON = 'SUBSCRIPTION_TYPE_LOON',
  SUBSCRIPTION_TYPE_STASH = 'SUBSCRIPTION_TYPE_STASH',
  SUBSCRIPTION_TYPE_CLASH = 'SUBSCRIPTION_TYPE_CLASH',
  SUBSCRIPTION_TYPE_V2RAY = 'SUBSCRIPTION_TYPE_V2RAY',
}

// 订阅数据接口
export interface SubscriptionData {
  subscriptionId: string;
  type: SubscriptionType;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  url: string;
  totalRequests: number;
  lastAccessedAt?: string;
  userAgent?: string;
}

// 订阅统计数据接口
export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRequests: number;
  requestsToday: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  popularType: SubscriptionType;
  avgRequestsPerDay: number;
}

// 分页请求参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// 创建订阅请求
export interface CreateSubscriptionRequest {
  type: SubscriptionType;
  name: string;
  description?: string;
  expiresAt?: string;
  includeRules?: string[];
  excludeRules?: string[];
  customTemplate?: string;
}

// 更新订阅请求
export interface UpdateSubscriptionRequest {
  type?: SubscriptionType;
  name?: string;
  description?: string;
  expiresAt?: string;
  isActive?: boolean;
  includeRules?: string[];
  excludeRules?: string[];
  customTemplate?: string;
}

// 获取订阅列表请求参数
export interface GetSubscriptionsRequest {
  pagination?: PaginationParams;
}

// 获取订阅统计请求参数
export interface GetSubscriptionStatsRequest {
  startDate?: string;
  endDate?: string;
  type?: SubscriptionType;
}

class SubscriptionService {
  private readonly endpoint = '/v1/subscriptions';

  /**
   * 获取订阅列表 - 匹配swagger接口 GET /v1/subscriptions
   */
  async getSubscriptions(params: GetSubscriptionsRequest = {}): Promise<ApiResponse<SubscriptionData[]>> {
    const queryParams: Record<string, string> = {};
    
    if (params.pagination?.page) {
      queryParams['pagination.page'] = params.pagination.page.toString();
    }
    if (params.pagination?.pageSize) {
      queryParams['pagination.pageSize'] = params.pagination.pageSize.toString();
    }

    return httpClient.get<SubscriptionData[]>(this.endpoint, queryParams);
  }

  /**
   * 创建订阅 - 匹配swagger接口 POST /v1/subscriptions
   */
  async createSubscription(data: CreateSubscriptionRequest): Promise<ApiResponse<SubscriptionData>> {
    return httpClient.post<SubscriptionData>(this.endpoint, data);
  }

  /**
   * 更新订阅 - 匹配swagger接口 PUT /v1/subscriptions/{subscriptionId}
   */
  async updateSubscription(subscriptionId: string, data: UpdateSubscriptionRequest): Promise<ApiResponse<SubscriptionData>> {
    return httpClient.put<SubscriptionData>(`${this.endpoint}/${subscriptionId}`, data);
  }

  /**
   * 删除订阅 - 匹配swagger接口 DELETE /v1/subscriptions/{subscriptionId}
   */
  async deleteSubscription(subscriptionId: string): Promise<ApiResponse<void>> {
    return httpClient.delete(`${this.endpoint}/${subscriptionId}`);
  }

  /**
   * 获取订阅统计 - 匹配swagger接口 GET /v1/subscriptions/stats
   */
  async getSubscriptionStats(params: GetSubscriptionStatsRequest = {}): Promise<ApiResponse<SubscriptionStats>> {
    const queryParams: Record<string, string> = {};
    
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.type && params.type !== SubscriptionType.SUBSCRIPTION_TYPE_UNSPECIFIED) {
      queryParams.type = params.type;
    }

    return httpClient.get<SubscriptionStats>(`${this.endpoint}/stats`, queryParams);
  }

  /**
   * 获取订阅内容 - 匹配swagger接口 GET /s/{subscriptionId}
   */
  async getSubscriptionContent(subscriptionId: string, userAgent?: string): Promise<ApiResponse<string>> {
    const queryParams: Record<string, string> = {};
    if (userAgent) queryParams.userAgent = userAgent;

    return httpClient.get<string>(`/s/${subscriptionId}`, queryParams);
  }

  /**
   * 复制订阅URL到剪贴板
   */
  async copySubscriptionUrl(subscriptionId: string): Promise<string> {
    const baseUrl = window.location.origin;
    const subscriptionUrl = `${baseUrl}/s/${subscriptionId}`;
    
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      return subscriptionUrl;
    } catch (error) {
      // 如果剪贴板API不可用，返回URL供手动复制
      return subscriptionUrl;
    }
  }

  /**
   * 获取订阅类型的显示名称
   */
  getSubscriptionTypeDisplayName(type: SubscriptionType): string {
    const typeMap: Record<SubscriptionType, string> = {
      [SubscriptionType.SUBSCRIPTION_TYPE_UNSPECIFIED]: '未指定',
      [SubscriptionType.SUBSCRIPTION_TYPE_SURGE]: 'Surge',
      [SubscriptionType.SUBSCRIPTION_TYPE_SHADOWSOCKS]: 'Shadowsocks',
      [SubscriptionType.SUBSCRIPTION_TYPE_QUANTUMULT_X]: 'QuantumultX',
      [SubscriptionType.SUBSCRIPTION_TYPE_LOON]: 'Loon',
      [SubscriptionType.SUBSCRIPTION_TYPE_STASH]: 'Stash',
      [SubscriptionType.SUBSCRIPTION_TYPE_CLASH]: 'Clash',
      [SubscriptionType.SUBSCRIPTION_TYPE_V2RAY]: 'V2Ray',
    };
    return typeMap[type] || '未知';
  }

  /**
   * 获取订阅类型选项
   */
  getSubscriptionTypeOptions() {
    return [
      { label: 'Surge', value: SubscriptionType.SUBSCRIPTION_TYPE_SURGE },
      { label: 'Shadowsocks', value: SubscriptionType.SUBSCRIPTION_TYPE_SHADOWSOCKS },
      { label: 'QuantumultX', value: SubscriptionType.SUBSCRIPTION_TYPE_QUANTUMULT_X },
      { label: 'Loon', value: SubscriptionType.SUBSCRIPTION_TYPE_LOON },
      { label: 'Stash', value: SubscriptionType.SUBSCRIPTION_TYPE_STASH },
      { label: 'Clash', value: SubscriptionType.SUBSCRIPTION_TYPE_CLASH },
      { label: 'V2Ray', value: SubscriptionType.SUBSCRIPTION_TYPE_V2RAY },
    ];
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService; 