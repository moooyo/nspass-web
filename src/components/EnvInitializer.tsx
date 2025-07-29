'use client';

import React, { useEffect, useState } from 'react';
import { EnhancedBaseService } from '@/shared/services/EnhancedBaseService';
import { getRuntimeApiBaseUrl, updateRuntimeApiBaseUrl } from '@/utils/runtime-env';
import { logger } from '@/utils/logger';

// 创建全局HTTP客户端实例
const globalHttpClient = new EnhancedBaseService();

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

    logger.group('🔧 Environment Initializer');

    // 在开发环境中，动态设置本地 API URL
    if (import.meta.env.DEV) {
      const localApiUrl = 'http://localhost:8080';
      updateRuntimeApiBaseUrl(localApiUrl);
      logger.info('🔧 开发环境: 已设置本地 API URL:', localApiUrl);
    }

    // 获取运行时API URL（现在会返回动态设置的URL）
    const runtimeApiUrl = getRuntimeApiBaseUrl();
    setCurrentApiUrl(runtimeApiUrl);

    // 更新globalHttpClient的baseURL
    globalHttpClient.updateBaseURL(runtimeApiUrl);

    // 输出调试信息
    logger.info('📊 环境变量检查结果:');
    logger.info('  window.__ENV__:', (window as any).__ENV__);
    logger.info('  最终选择的API URL:', runtimeApiUrl);
    logger.info('  HTTP Client Base URL:', globalHttpClient.getCurrentBaseURL());
    logger.info('  部署平台: Cloudflare Workers');

    // 验证API URL
    if (runtimeApiUrl.includes('localhost') && import.meta.env.PROD) {
      logger.error('⚠️ 生产环境警告: API URL 仍指向 localhost');
      logger.error('🔧 请检查环境变量配置');
    } else {
      logger.info('✅ API URL 配置正确:', runtimeApiUrl);
    }

    logger.groupEnd();
    setInitialized(true);
  }, []);

  // 在开发环境中显示当前API URL
  if (import.meta.env.DEV && initialized) {
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
        wordBreak: 'break-all'
      }}>
        API: {currentApiUrl.replace(/^https?:\/\//, '')}
      </div>
    );
  }

  // 在生产环境中，如果API URL有问题，显示警告
  if (initialized && currentApiUrl.includes('localhost') && import.meta.env.PROD) {
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
