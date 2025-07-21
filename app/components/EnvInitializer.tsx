'use client';

import { useEffect, useState } from 'react';
import { httpClient } from '@/utils/http-client';
import { logEnvDebugInfo, validateApiBaseUrl } from '@/utils/env-debug';

/**
 * 环境变量初始化组件
 * 确保在客户端正确设置和验证环境变量
 */
export const EnvInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    console.group('🔧 Environment Initializer');
    
    // 输出环境变量调试信息
    const debugInfo = logEnvDebugInfo();
    
    // 验证API Base URL
    const validation = validateApiBaseUrl();
    
    if (!validation.isValid) {
      console.error('❌ API Base URL 验证失败:', validation.issues);
      
      // 在开发环境中显示详细错误信息
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = [
          '环境变量配置错误:',
          ...validation.issues,
          '',
          '解决方案:',
          '1. 在 .env.local 文件中设置 NEXT_PUBLIC_API_BASE_URL',
          '2. 或在 Cloudflare Pages 控制台中设置环境变量',
          '3. 确保 URL 格式正确 (如: https://api.example.com)',
        ].join('\n');
        
        console.error(errorMessage);
      }
    } else {
      console.log('✅ API Base URL 验证通过:', validation.value);
    }
    
    // 检查 httpClient 的当前配置
    const currentBaseURL = httpClient.getCurrentBaseURL();
    console.log('🔗 HTTP Client Base URL:', currentBaseURL);
    
    // 如果 httpClient 的 baseURL 是 localhost 但我们在生产环境，发出警告
    if (
      process.env.NODE_ENV === 'production' && 
      (currentBaseURL.includes('localhost') || currentBaseURL.includes('127.0.0.1'))
    ) {
      console.error('⚠️ 生产环境警告: HTTP Client 仍在使用 localhost');
      console.error('🔧 这可能是因为环境变量未正确设置或 MSWProvider 覆盖了设置');
    }
    
    console.groupEnd();
    setInitialized(true);
  }, []);

  // 在开发环境中显示调试信息
  if (process.env.NODE_ENV === 'development' && initialized) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px 12px',
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '0 0 0 8px',
        fontFamily: 'monospace'
      }}>
        API: {httpClient.getCurrentBaseURL().replace(/^https?:\/\//, '')}
      </div>
    );
  }

  return null;
};

export default EnvInitializer;
