'use client';

/**
 * 运行时环境变量获取工具
 * 专门处理 Cloudflare Pages 部署时的环境变量获取问题
 */

// 从多个来源获取API基础URL
export function getRuntimeApiBaseUrl(): string {
  // 1. 尝试从window.__ENV__获取（如果有设置的话）
  if (typeof window !== 'undefined' && (window as any).__ENV__?.NEXT_PUBLIC_API_BASE_URL) {
    console.log('🔧 从 window.__ENV__ 获取API URL:', (window as any).__ENV__.NEXT_PUBLIC_API_BASE_URL);
    return (window as any).__ENV__.NEXT_PUBLIC_API_BASE_URL;
  }

  // 2. 尝试从构建时环境变量获取
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.log('🔧 从构建时环境变量获取API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 3. 尝试从localStorage获取（用户手动配置）
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nspass-api-base-url');
    if (stored) {
      console.log('🔧 从localStorage获取API URL:', stored);
      return stored;
    }
  }

  // 4. 根据当前环境推断
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 开发环境，使用默认localhost');
    return 'http://localhost:8080';
  }

  // 5. 生产环境的备用方案 - 根据当前域名推断
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const inferredUrl = hostname.includes('localhost') 
      ? 'http://localhost:8080'
      : `https://api.${hostname.replace('nspass.', '').replace('www.', '')}`;
    
    console.log('🔧 根据当前域名推断API URL:', inferredUrl);
    return inferredUrl;
  }

  console.error('❌ 无法确定API Base URL，使用默认值');
  return 'https://api.nspass.com';
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
