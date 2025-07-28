import { httpClient, ApiResponse } from '@/utils/http-client';
import type { 
  SubscriptionData, 
  CreateSubscriptionRequest as GeneratedCreateSubscriptionRequest,
  UpdateSubscriptionRequest as GeneratedUpdateSubscriptionRequest,
  GetSubscriptionsRequest,
  GetSubscriptionStatsRequest
} from '@/types/generated/api/subscription/subscription_management';
import { SubscriptionType } from '@/types/generated/model/subscription';

// 重新导出生成的类型
export type { SubscriptionData, GetSubscriptionsRequest, GetSubscriptionStatsRequest };
export { SubscriptionType };

// 扩展订阅数据接口以包含token字段（API实际返回的）
export interface SubscriptionDataWithToken extends SubscriptionData {
  token?: string; // API返回的token字段
}

// 简化的统计接口（用于mock）
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

// 简化的请求接口（用于前端）
export interface CreateSubscriptionRequest {
  type: SubscriptionType;
  name: string;
  description?: string;
  expiresAt?: string;
  includeRules?: string[];
  excludeRules?: string[];
  customTemplate?: string;
}

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
  async copySubscriptionUrl(userId: number, token: string): Promise<string> {
    // 使用httpClient的当前baseURL，确保与其他API调用一致
    const backendBaseUrl = httpClient.getCurrentBaseURL();
    const subscriptionUrl = `${backendBaseUrl}/s/${userId}/${token}`;
    
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      return subscriptionUrl;
    } catch (error) {
      // 如果剪贴板API不可用，返回URL供手动复制
      return subscriptionUrl;
    }
  }

  /**
   * 生成订阅URL（不复制到剪贴板）
   */
  generateSubscriptionUrl(userId: number, token: string): string {
    const backendBaseUrl = httpClient.getCurrentBaseURL();
    return `${backendBaseUrl}/s/${userId}/${token}`;
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
      [SubscriptionType.UNRECOGNIZED]: '未识别',
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