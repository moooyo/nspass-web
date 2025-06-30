import React from 'react';
import { httpClient, ApiResponse } from '@/utils/http-client';

// DNS提供商类型
export type DnsProvider = 'CLOUDFLARE';

// DNS配置项数据类型定义
export interface DnsConfigItem {
  id: React.Key;
  configName: string;
  provider: DnsProvider;
  domain: string;
  configParams: string; // JSON字符串
  createdAt: string;
}

// 创建DNS配置数据类型
export interface CreateDnsConfigData {
  configName: string;
  provider: DnsProvider;
  domain: string;
  configParams: string;
}

// 更新DNS配置数据类型
export interface UpdateDnsConfigData {
  configName?: string;
  provider?: DnsProvider;
  domain?: string;
  configParams?: string;
}

// 查询参数类型
export interface DnsConfigListParams {
  page?: number;
  pageSize?: number;
  configName?: string;
  provider?: DnsProvider;
}

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
  async updateDnsConfig(id: React.Key, data: UpdateDnsConfigData): Promise<ApiResponse<DnsConfigItem>> {
    try {
      return await httpClient.put<DnsConfigItem>(`/v1/dns/configs/${id}`, data);
    } catch (error) {
      console.error('更新DNS配置失败:', error);
      return { success: false, message: '更新DNS配置失败' };
    }
  },

  // 删除DNS配置
  async deleteDnsConfig(id: React.Key): Promise<ApiResponse<boolean>> {
    try {
      return await httpClient.delete<boolean>(`/v1/dns/configs/${id}`);
    } catch (error) {
      console.error('删除DNS配置失败:', error);
      return { success: false, message: '删除DNS配置失败' };
    }
  },

  // 测试DNS配置
  async testDnsConfig(id: React.Key): Promise<ApiResponse<boolean>> {
    try {
      return await httpClient.post<boolean>(`/v1/dns/configs/${id}/test`);
    } catch (error) {
      console.error('测试DNS配置失败:', error);
      return { success: false, message: '测试DNS配置失败' };
    }
  },
}; 