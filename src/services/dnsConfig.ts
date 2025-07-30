import { globalHttpClient } from '@/shared/services/EnhancedBaseService';
import type { StandardApiResponse } from '@/shared/types/common';
import type { DnsConfig, DnsProviderConfig } from '@/types/generated/model/dnsConfig';
import { DnsProvider } from '@/types/generated/model/dnsConfig';
import type {
  CreateDnsConfigRequest,
  UpdateDnsConfigRequest,
  GetDnsConfigsRequest,
  CreateDnsProviderConfigRequest,
  UpdateDnsProviderConfigRequest,
  GetDnsProviderConfigsRequest,
} from '@/types/generated/api/dns/dns_config';

// 重新导出枚举类型
export { DnsProvider };

// DNS配置项数据类型定义（使用生成的类型）
export type DnsConfigItem = DnsConfig;
export type DnsProviderConfigItem = DnsProviderConfig;

// 重新导出生成的类型，提供更简洁的导入路径
export type CreateDnsConfigData = CreateDnsConfigRequest;
export type UpdateDnsConfigData = UpdateDnsConfigRequest;
export type DnsConfigListParams = GetDnsConfigsRequest;

// DNS Provider配置相关类型
export type CreateDnsProviderConfigData = CreateDnsProviderConfigRequest;
export type UpdateDnsProviderConfigData = UpdateDnsProviderConfigRequest;
export type DnsProviderConfigListParams = GetDnsProviderConfigsRequest;

// DNS配置服务
class DnsConfigService {
  private readonly endpoint = '/v1/dns/configs';

  // 获取DNS配置列表
  async getDnsConfigs(params?: DnsConfigListParams): Promise<StandardApiResponse<DnsConfigItem[]>> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();
      if (params?.configName) queryParams.configName = params.configName;

      return await globalHttpClient.get<DnsConfigItem[]>(this.endpoint, queryParams);
    } catch (error) {
      console.error('获取DNS配置列表失败:', error);
      return { success: false, message: '获取DNS配置列表失败' };
    }
  }

  // 创建DNS配置
  async createDnsConfig(data: CreateDnsConfigData): Promise<StandardApiResponse<DnsConfigItem>> {
    try {
      return await globalHttpClient.post<DnsConfigItem>(this.endpoint, data);
    } catch (error) {
      console.error('创建DNS配置失败:', error);
      return { success: false, message: '创建DNS配置失败' } as StandardApiResponse<DnsConfigItem>;
    }
  }

  // 更新DNS配置
  async updateDnsConfig(id: number, data: UpdateDnsConfigData): Promise<StandardApiResponse<DnsConfigItem>> {
    try {
      return await globalHttpClient.put<DnsConfigItem>(`${this.endpoint}/${id}`, data);
    } catch (error) {
      console.error('更新DNS配置失败:', error);
      return { success: false, message: '更新DNS配置失败' } as StandardApiResponse<DnsConfigItem>;
    }
  }

  // 删除DNS配置
  async deleteDnsConfig(id: number): Promise<StandardApiResponse<boolean>> {
    try {
      return await globalHttpClient.delete<boolean>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error('删除DNS配置失败:', error);
      return { success: false, message: '删除DNS配置失败' } as StandardApiResponse<boolean>;
    }
  }

  // 测试DNS配置
  async testDnsConfig(id: number): Promise<StandardApiResponse<boolean>> {
    try {
      return await globalHttpClient.post<boolean>(`${this.endpoint}/${id}/test`);
    } catch (error) {
      console.error('测试DNS配置失败:', error);
      return { success: false, message: '测试DNS配置失败' } as StandardApiResponse<boolean>;
    }
  }
}

// DNS Provider配置服务
class DnsProviderConfigService {
  private readonly endpoint = '/v1/dns/provider-configs';

  // 获取DNS Provider配置列表
  async getDnsProviderConfigs(params?: DnsProviderConfigListParams): Promise<StandardApiResponse<DnsProviderConfigItem[]>> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();
      if (params?.provider) queryParams.provider = params.provider;

      return await globalHttpClient.get<DnsProviderConfigItem[]>(this.endpoint, queryParams);
    } catch (error) {
      console.error('获取DNS Provider配置列表失败:', error);
      return { success: false, message: '获取DNS Provider配置列表失败' };
    }
  }

  // 创建DNS Provider配置
  async createDnsProviderConfig(data: CreateDnsProviderConfigData): Promise<StandardApiResponse<DnsProviderConfigItem>> {
    try {
      return await globalHttpClient.post<DnsProviderConfigItem>(this.endpoint, data);
    } catch (error) {
      console.error('创建DNS Provider配置失败:', error);
      return { success: false, message: '创建DNS Provider配置失败' } as StandardApiResponse<DnsProviderConfigItem>;
    }
  }

  // 更新DNS Provider配置
  async updateDnsProviderConfig(id: number, data: UpdateDnsProviderConfigData): Promise<StandardApiResponse<DnsProviderConfigItem>> {
    try {
      return await globalHttpClient.put<DnsProviderConfigItem>(`${this.endpoint}/${id}`, data);
    } catch (error) {
      console.error('更新DNS Provider配置失败:', error);
      return { success: false, message: '更新DNS Provider配置失败' } as StandardApiResponse<DnsProviderConfigItem>;
    }
  }

  // 删除DNS Provider配置
  async deleteDnsProviderConfig(id: number): Promise<StandardApiResponse<boolean>> {
    try {
      return await globalHttpClient.delete<boolean>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error('删除DNS Provider配置失败:', error);
      return { success: false, message: '删除DNS Provider配置失败' } as StandardApiResponse<boolean>;
    }
  }
}

// 创建并导出服务实例
export const dnsConfigService = new DnsConfigService();
export const dnsProviderConfigService = new DnsProviderConfigService();