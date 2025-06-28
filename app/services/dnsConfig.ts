import React from 'react';

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
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.configName) queryParams.append('configName', params.configName);
      if (params?.provider) queryParams.append('provider', params.provider);

      const response = await fetch(`/api/v1/dns/configs?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取DNS配置列表失败:', error);
      return { success: false, message: '获取DNS配置列表失败' };
    }
  },

  // 创建DNS配置
  async createDnsConfig(data: CreateDnsConfigData): Promise<ApiResponse<DnsConfigItem>> {
    try {
      const response = await fetch('/api/v1/dns/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('创建DNS配置失败:', error);
      return { success: false, message: '创建DNS配置失败' };
    }
  },

  // 更新DNS配置
  async updateDnsConfig(id: React.Key, data: UpdateDnsConfigData): Promise<ApiResponse<DnsConfigItem>> {
    try {
      const response = await fetch(`/api/v1/dns/configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('更新DNS配置失败:', error);
      return { success: false, message: '更新DNS配置失败' };
    }
  },

  // 删除DNS配置
  async deleteDnsConfig(id: React.Key): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`/api/v1/dns/configs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('删除DNS配置失败:', error);
      return { success: false, message: '删除DNS配置失败' };
    }
  },

  // 测试DNS配置
  async testDnsConfig(id: React.Key): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`/api/v1/dns/configs/${id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('测试DNS配置失败:', error);
      return { success: false, message: '测试DNS配置失败' };
    }
  },
}; 