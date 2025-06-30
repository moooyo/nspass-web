'use client';

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ApiOutlined } from '@ant-design/icons';
import { MSWContext } from './types';
import { message } from '@/utils/message';
import { httpClient } from '@/utils/http-client';

// LocalStorage键名
const MOCK_ENABLED_KEY = 'nspass-mock-enabled';

export const MockToggle: React.FC = () => {
  // 从Context获取Mock状态
  const { enabled: mockEnabled, setEnabled: setMockEnabled } = useContext(MSWContext);
  
  // 是否正在加载中
  const [isLoading, setIsLoading] = useState(false);

  // 初始化时同步 baseURL 与 Mock 状态
  useEffect(() => {
    if (mockEnabled) {
      // MSW启用时使用空字符串，让MSW拦截请求
      httpClient.updateBaseURL('');
    } else {
      // MSW禁用时使用真实后端地址
      const realApiUrl = process.env.NEXT_PUBLIC_REAL_API_URL || 'http://localhost:8080';
      httpClient.updateBaseURL(realApiUrl);
    }
  }, [mockEnabled]);

  // 确保不会出现滚动条
  useEffect(() => {
    // 创建样式规则来防止滚动条
    const style = document.createElement('style');
    style.textContent = `
      /* 确保固定定位的按钮不会影响页面滚动 */
      [data-testid="mock-toggle"] {
        contain: layout style paint !important;
        will-change: transform !important;
      }
      
      /* 防止按钮影响body的滚动 */
      body {
        overflow-x: hidden !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // 清理样式
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // 开启Mock服务
  const startMockService = useCallback(async () => {
    setIsLoading(true);
    try {
      const { startMSW } = await import('@mock/browser');
      const result = await startMSW();
      
      // 启动 Mock 时，使用空字符串让MSW拦截请求
      httpClient.updateBaseURL('');
      
      console.log('🚀 Mock服务已启动');
      message.success('Mock服务已启动');
      setIsLoading(false);
      return Boolean(result);
    } catch (error) {
      console.error('启动Mock服务失败:', error);
      message.error('启动Mock服务失败');
      setIsLoading(false);
      return false;
    }
  }, []);

  // 停止Mock服务
  const stopMockService = useCallback(async () => {
    setIsLoading(true);
    try {
      const { stopMSW } = await import('@mock/browser');
      const result = stopMSW();
      
      // 停止 Mock 时，切换到真实的后端地址
      const realApiUrl = process.env.NEXT_PUBLIC_REAL_API_URL || 'http://localhost:8080';
      httpClient.updateBaseURL(realApiUrl);
      
      console.log('⏹️ Mock服务已停止');
      message.success(`Mock服务已停止，API已切换到: ${realApiUrl}`);
      setIsLoading(false);
      return Boolean(result);
    } catch (error) {
      console.error('停止Mock服务失败:', error);
      message.error('停止Mock服务失败');
      setIsLoading(false);
      return false;
    }
  }, []);

  // 切换Mock状态
  const toggleMock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    const newState = !mockEnabled;
    
    let success = false;
    
    // 根据状态启动或停止Mock服务
    if (newState) {
      success = await startMockService();
    } else {
      success = await stopMockService();
    }
    
    // 只有在成功切换服务状态后才更新UI状态
    if (success) {
      // 更新Context中的状态
      setMockEnabled(newState);
      
      // 保存到LocalStorage
      localStorage.setItem(MOCK_ENABLED_KEY, String(newState));
    }
  };

  return (
    <>
      <button
        onClick={toggleMock}
        title={isLoading 
          ? "正在处理..." 
          : (mockEnabled ? "Mock 已开启 (点击关闭)" : "Mock 已关闭 (点击开启)")}
        data-testid="mock-toggle"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          zIndex: 9999,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: mockEnabled ? '#1677ff' : '#ffffff',
          color: mockEnabled ? '#ffffff' : '#666666',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          outline: 'none',
          margin: 0,
          padding: 0,
          // 关键样式：确保不影响页面布局
          pointerEvents: 'auto',
          transform: 'translate3d(0, 0, 0)', // 启用硬件加速
          backfaceVisibility: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1)';
        }}
      >
        <ApiOutlined spin={isLoading} />
      </button>
    </>
  );
}; 