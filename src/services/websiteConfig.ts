import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { createServiceConfig } from '@/shared/services/ServiceConfig';
import type { StandardApiResponse } from '@/shared/types/common';
import type { 
  AgentReportBaseUrlData,
  UpdateAgentReportBaseUrlRequest,
  UpdateAgentReportBaseUrlResponse 
} from '@/types/generated/api/settings/settings_management';

// 网站配置数据类型定义
export interface WebsiteConfig {
  id: number;
  siteName: string;
  allowRegister: boolean;
  inviteStrategy: 'email' | 'code';
  inviteCode?: string;
  allowLookingGlass: boolean;
  showAnnouncement: boolean;
  announcementContent?: string;
  updatedAt: string;
}

// 更新网站配置数据类型
export interface UpdateWebsiteConfigData {
  siteName?: string;
  allowRegister?: boolean;
  inviteStrategy?: 'email' | 'code';
  inviteCode?: string;
  allowLookingGlass?: boolean;
  showAnnouncement?: boolean;
  announcementContent?: string;
}

class WebsiteConfigService extends EnhancedBaseService {
  constructor() {
    super(createServiceConfig('WebsiteConfigService'));
  }
  private readonly endpoint = '/v1/settings';

  /**
   * 获取网站配置
   */
  async getWebsiteConfig(): Promise<StandardApiResponse<WebsiteConfig>> {
    return this.get<WebsiteConfig>(this.endpoint);
  }

  /**
   * 更新网站配置
   */
  async updateWebsiteConfig(configData: UpdateWebsiteConfigData): Promise<StandardApiResponse<WebsiteConfig>> {
    return this.put<WebsiteConfig>(this.endpoint, configData);
  }

  /**
   * 重置网站配置为默认值
   */
  async resetWebsiteConfig(): Promise<StandardApiResponse<WebsiteConfig>> {
    return this.post<WebsiteConfig>(`${this.endpoint}/reset`);
  }

  /**
   * 验证邀请码
   */
  async validateInviteCode(code: string): Promise<StandardApiResponse<{ valid: boolean }>> {
    return this.post<{ valid: boolean }>(`${this.endpoint}/validateInvite`, { code });
  }

  /**
   * 生成新的邀请码
   */
  async generateInviteCode(): Promise<StandardApiResponse<{ inviteCode: string }>> {
    return this.post<{ inviteCode: string }>(`${this.endpoint}/inviteCode`);
  }

  /**
   * 获取Agent上报Base URL设置
   */
  async getAgentReportBaseUrl(): Promise<StandardApiResponse<AgentReportBaseUrlData>> {
    return this.get<AgentReportBaseUrlData>(`${this.endpoint}/agent/report-base-url`);
  }

  /**
   * 更新Agent上报Base URL设置
   */
  async updateAgentReportBaseUrl(baseUrl: string): Promise<StandardApiResponse<UpdateAgentReportBaseUrlResponse>> {
    const requestData: UpdateAgentReportBaseUrlRequest = { baseUrl };
    return this.put<UpdateAgentReportBaseUrlResponse>(`${this.endpoint}/agent/report-base-url`, requestData);
  }
}

// 创建并导出服务实例
export const websiteConfigService = new WebsiteConfigService();
export default WebsiteConfigService; 