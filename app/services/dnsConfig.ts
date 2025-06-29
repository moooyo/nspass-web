import React from 'react';
import { httpClient, ApiResponse as HttpClientApiResponse } from '@/utils/http-client';

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

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
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

      const response = await httpClient.get<DnsConfigItem[]>('/v1/dns/configs', queryParams);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('获取DNS配置列表失败:', error);
      return { success: false, message: '获取DNS配置列表失败' };
    }
  },

  // 创建DNS配置
  async createDnsConfig(data: CreateDnsConfigData): Promise<ApiResponse<DnsConfigItem>> {
    try {
      const response = await httpClient.post<DnsConfigItem>('/v1/dns/configs', data);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('创建DNS配置失败:', error);
      return { success: false, message: '创建DNS配置失败' };
    }
  },

  // 更新DNS配置
  async updateDnsConfig(id: React.Key, data: UpdateDnsConfigData): Promise<ApiResponse<DnsConfigItem>> {
    try {
      const response = await httpClient.put<DnsConfigItem>(`/v1/dns/configs/${id}`, data);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('更新DNS配置失败:', error);
      return { success: false, message: '更新DNS配置失败' };
    }
  },

  // 删除DNS配置
  async deleteDnsConfig(id: React.Key): Promise<ApiResponse<boolean>> {
    try {
      const response = await httpClient.delete<boolean>(`/v1/dns/configs/${id}`);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('删除DNS配置失败:', error);
      return { success: false, message: '删除DNS配置失败' };
    }
  },

  // 测试DNS配置
  async testDnsConfig(id: React.Key): Promise<ApiResponse<boolean>> {
    try {
      const response = await httpClient.post<boolean>(`/v1/dns/configs/${id}/test`);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('测试DNS配置失败:', error);
      return { success: false, message: '测试DNS配置失败' };
    }
  },
}; 