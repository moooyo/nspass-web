'use client';

/**
 * 运行时环境变量获取工具
 * 专门处理 Cloudflare Pages 部署时的环境变量获取问题
 */

// 从多个来源获取API基础URL
export function getRuntimeApiBaseUrl(): string {
  // 1. 优先使用构建时环境变量
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.log('🔧 使用环境变量 NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 2. 尝试从localStorage获取（用户手动配置）
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nspass-api-base-url');
    if (stored) {
      console.log('🔧 从localStorage获取API URL:', stored);
      return stored;
    }
  }

  // 3. 开发环境默认值
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 开发环境，使用默认localhost');
    return 'http://localhost:8080';
  }

  // 4. 生产环境必须配置环境变量
  console.error('❌ 生产环境未配置 NEXT_PUBLIC_API_BASE_URL 环境变量');
  throw new Error('NEXT_PUBLIC_API_BASE_URL 环境变量未配置，请在部署时设置正确的API地址');
}

// 手动设置API URL的函数
export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nspass-api-base-url', url);
    console.log('💾 API URL已保存到localStorage:', url);
    
    // 触发全局事件，通知其他组件更新
    window.dispatchEvent(new CustomEvent('api-url-changed', { detail: { url } }));
  }
}

// 清除手动设置的API URL
export function clearApiBaseUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nspass-api-base-url');
    console.log('🗑️ 已清除localStorage中的API URL');
    
    window.dispatchEvent(new CustomEvent('api-url-changed', { detail: { url: null } }));
  }
}

// React Hook for getting API base URL
import { useState, useEffect } from 'react';

export function useApiBaseUrl(): [string, (url: string) => void, () => void] {
  const [apiUrl, setApiUrl] = useState<string>(() => getRuntimeApiBaseUrl());

  useEffect(() => {
    const handleApiUrlChange = (event: CustomEvent) => {
      const newUrl = event.detail.url || getRuntimeApiBaseUrl();
      setApiUrl(newUrl);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('api-url-changed' as any, handleApiUrlChange);
      return () => {
        window.removeEventListener('api-url-changed' as any, handleApiUrlChange);
      };
    }
  }, []);

  const updateUrl = (url: string) => {
    setApiBaseUrl(url);
    setApiUrl(url);
  };

  const clearUrl = () => {
    clearApiBaseUrl();
    setApiUrl(getRuntimeApiBaseUrl());
  };

  return [apiUrl, updateUrl, clearUrl];
}
