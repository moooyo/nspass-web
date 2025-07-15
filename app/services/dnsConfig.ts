import React from 'react';
import { httpClient, ApiResponse } from '@/utils/http-client';
import type { DnsConfig, DnsProvider } from '@/types/generated/model/dnsConfig';
import type {
  CreateDnsConfigRequest,
  UpdateDnsConfigRequest,
  GetDnsConfigsRequest,
} from '@/types/generated/api/dns/dns_config';

// 重新导出枚举类型
export { DnsProvider };

// DNS配置项数据类型定义（使用生成的类型）
export interface DnsConfigItem extends DnsConfig {
  // 扩展字段可以在这里添加
}

// 重新导出生成的类型，提供更简洁的导入路径
export type CreateDnsConfigData = CreateDnsConfigRequest;
export type UpdateDnsConfigData = UpdateDnsConfigRequest;
export type DnsConfigListParams = GetDnsConfigsRequest;

// DNS配置服务
export const dnsConfigService = {
  // 获取DNS配置列表
  async getDnsConfigs(params?: DnsConfigListParams): Promise<ApiResponse<DnsConfigItem[]>> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.pageSize) queryParams.pageSize = params.pageSize.toString();
      if (params?.configName) queryParams.configName = params.configName;
      if (params?.provider) queryParams.provider = params.provider;

      return await httpClient.get<DnsConfigItem[]>('/v1/dns/configs', queryParams);
    } catch (error) {
      console.error('获取DNS配置列表失败:', error);
      return { success: false, message: '获取DNS配置列表失败' };
    }
  },

  // 创建DNS配置
  async createDnsConfig(data: CreateDnsConfigData): Promise<ApiResponse<DnsConfigItem>> {
    try {
      return await httpClient.post<DnsConfigItem>('/v1/dns/configs', data);
    } catch (error) {
      console.error('创建DNS配置失败:', error);
      return { success: false, message: '创建DNS配置失败' };
    }
  },

  // 更新DNS配置
  async updateDnsConfig(id: number, data: UpdateDnsConfigData): Promise<ApiResponse<DnsConfigItem>> {
    try {
      return await httpClient.put<DnsConfigItem>(`/v1/dns/configs/${id}`, data);
    } catch (error) {
      console.error('更新DNS配置失败:', error);
      return { success: false, message: '更新DNS配置失败' };
    }
  },

  // 删除DNS配置
  async deleteDnsConfig(id: number): Promise<ApiResponse<boolean>> {
    try {
      return await httpClient.delete<boolean>(`/v1/dns/configs/${id}`);
    } catch (error) {
      console.error('删除DNS配置失败:', error);
      return { success: false, message: '删除DNS配置失败' };
    }
  },

  // 测试DNS配置
  async testDnsConfig(id: number): Promise<ApiResponse<boolean>> {
    try {
      return await httpClient.post<boolean>(`/v1/dns/configs/${id}/test`);
    } catch (error) {
      console.error('测试DNS配置失败:', error);
      return { success: false, message: '测试DNS配置失败' };
    }
  },
}; 