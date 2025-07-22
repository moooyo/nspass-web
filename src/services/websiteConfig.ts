import { httpClient, ApiResponse } from '@/utils/http-client';
import type { 
  GetAgentReportBaseUrlResponse,
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

class WebsiteConfigService {
  private readonly endpoint = '/v1/settings';

  /**
   * 获取网站配置
   */
  async getWebsiteConfig(): Promise<ApiResponse<WebsiteConfig>> {
    return httpClient.get<WebsiteConfig>(this.endpoint);
  }

  /**
   * 更新网站配置
   */
  async updateWebsiteConfig(configData: UpdateWebsiteConfigData): Promise<ApiResponse<WebsiteConfig>> {
    return httpClient.put<WebsiteConfig>(this.endpoint, configData);
  }

  /**
   * 重置网站配置为默认值
   */
  async resetWebsiteConfig(): Promise<ApiResponse<WebsiteConfig>> {
    return httpClient.post<WebsiteConfig>(`${this.endpoint}/reset`);
  }

  /**
   * 验证邀请码
   */
  async validateInviteCode(code: string): Promise<ApiResponse<{ valid: boolean }>> {
    return httpClient.post<{ valid: boolean }>(`${this.endpoint}/validateInvite`, { code });
  }

  /**
   * 生成新的邀请码
   */
  async generateInviteCode(): Promise<ApiResponse<{ inviteCode: string }>> {
    return httpClient.post<{ inviteCode: string }>(`${this.endpoint}/inviteCode`);
  }

  /**
   * 获取Agent上报Base URL设置
   */
  async getAgentReportBaseUrl(): Promise<ApiResponse<GetAgentReportBaseUrlResponse>> {
    return httpClient.get<GetAgentReportBaseUrlResponse>(`${this.endpoint}/agent/report-base-url`);
  }

  /**
   * 更新Agent上报Base URL设置
   */
  async updateAgentReportBaseUrl(baseUrl: string): Promise<ApiResponse<UpdateAgentReportBaseUrlResponse>> {
    const requestData: UpdateAgentReportBaseUrlRequest = { baseUrl };
    return httpClient.put<UpdateAgentReportBaseUrlResponse>(`${this.endpoint}/agent/report-base-url`, requestData);
  }
}

// 创建并导出服务实例
export const websiteConfigService = new WebsiteConfigService();
export default WebsiteConfigService; 