'use client';

import { useEffect, useState } from 'react';
import { httpClient } from '@/utils/http-client';
import { getRuntimeApiBaseUrl } from '@/utils/runtime-env';

/**
 * 环境变量初始化组件
 * 确保在客户端正确设置和验证环境变量
 */
export const EnvInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState<string>('');

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    console.group('🔧 Environment Initializer');
    
    // 获取运行时API URL
    const runtimeApiUrl = getRuntimeApiBaseUrl();
    setCurrentApiUrl(runtimeApiUrl);
    
    // 更新httpClient的baseURL
    httpClient.updateBaseURL(runtimeApiUrl);
    
    // 输出调试信息
    console.log('📊 环境变量检查结果:');
    console.log('  window.__ENV__:', (window as any).__ENV__);
    console.log('  process.env.NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('  最终选择的API URL:', runtimeApiUrl);
    console.log('  HTTP Client Base URL:', httpClient.getCurrentBaseURL());
    
    // 验证API URL
    if (runtimeApiUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.error('⚠️ 生产环境警告: API URL 仍指向 localhost');
      console.error('🔧 这表明环境变量可能未正确设置');
      console.error('📝 请检查 Cloudflare Pages 控制台中的环境变量配置');
    } else if (runtimeApiUrl !== 'https://api.nspass.com') {
      console.log('✅ API URL 配置正确:', runtimeApiUrl);
    }
    
    console.groupEnd();
    setInitialized(true);
  }, []);

  // 监听API URL变化事件
  useEffect(() => {
    const handleApiUrlChange = (event: CustomEvent) => {
      const newUrl = event.detail.url || getRuntimeApiBaseUrl();
      setCurrentApiUrl(newUrl);
      httpClient.updateBaseURL(newUrl);
      console.log('� API URL已更新:', newUrl);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('api-url-changed' as any, handleApiUrlChange);
      return () => {
        window.removeEventListener('api-url-changed' as any, handleApiUrlChange);
      };
    }
  }, []);

  // 在开发环境中显示调试信息和配置按钮
  if (process.env.NODE_ENV === 'development' && initialized) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: currentApiUrl.includes('localhost') ? 'rgba(255,193,7,0.9)' : 'rgba(40,167,69,0.9)',
        color: 'white',
        padding: '8px 12px',
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '0 0 0 8px',
        fontFamily: 'monospace',
        maxWidth: '300px',
        wordBreak: 'break-all',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>API: {currentApiUrl.replace(/^https?:\/\//, '')}</span>
      </div>
    );
  }

  // 在生产环境中，如果API URL有问题，显示警告
  if (initialized && currentApiUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(220,53,69,0.9)',
        color: 'white',
        padding: '8px 16px',
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '0 0 8px 8px',
        fontFamily: 'monospace'
      }}>
        ⚠️ API 配置错误: 生产环境不应使用 localhost
      </div>
    );
  }

  return null;
};

export default EnvInitializer;
