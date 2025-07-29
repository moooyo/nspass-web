'use client';

import React, { useEffect, useState } from 'react';
import { globalHttpClient } from '@/shared/services/EnhancedBaseService';
import { logger } from '@/utils/logger';

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

    // 直接使用环境变量中的API URL，不再动态设置
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    setCurrentApiUrl(apiUrl);

    // 更新globalHttpClient的baseURL
    globalHttpClient.updateBaseURL(apiUrl);

    // 输出调试信息
    logger.info('📊 环境变量检查结果:');
    logger.info('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    logger.info('  最终选择的API URL:', apiUrl);
    logger.info('  HTTP Client Base URL:', globalHttpClient.getCurrentBaseURL());

    // 验证API URL
    if (apiUrl.includes('localhost') && import.meta.env.PROD) {
      logger.error('⚠️ 生产环境警告: API URL 仍指向 localhost');
      logger.error('🔧 请检查环境变量配置');
    } else {
      logger.info('✅ API URL 配置正确:', apiUrl);
    }

    logger.groupEnd();
    setInitialized(true);
  }, []);



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
