'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ApiOutlined } from '@ant-design/icons';
import { useMSW } from './MSWProvider';
import { message } from '@/utils/message';
import { httpClient } from '@/utils/http-client';

export const MockToggle: React.FC = () => {
  // 使用新的MSWProvider中的useMSW hook
  const { enabled: mockEnabled, toggle, status, loading } = useMSW();
  
  // 本地loading状态（用于按钮动画）
  const [isLoading, setIsLoading] = useState(false);

  // 监听MSW状态变化，同步httpClient的baseURL
  useEffect(() => {
    if (mockEnabled) {
      // MSW启用时使用当前域名作为baseURL，确保MSW能拦截完整路径
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      httpClient.updateBaseURL(currentOrigin);
      console.log(`🎯 MSW已启用，baseURL设置为: ${currentOrigin}`);
    } else {
      // MSW禁用时使用真实后端地址
      const realApiUrl = process.env.NEXT_PUBLIC_REAL_API_URL || 'http://localhost:8080';
      httpClient.updateBaseURL(realApiUrl);
      console.log(`🎯 MSW已禁用，baseURL设置为: ${realApiUrl}`);
    }
  }, [mockEnabled]);

  // 同步本地loading状态
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

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

  // 切换Mock状态
  const toggleMock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    try {
      // 使用MSWProvider的toggle方法（已包含localStorage操作）
      await toggle();
      
      // 显示成功消息
      if (!mockEnabled) {
        message.success('Mock服务已启动');
      } else {
        message.success('Mock服务已停止');
      }
    } catch (error) {
      console.error('切换Mock状态失败:', error);
      message.error('切换Mock状态失败');
    }
  };

  // 获取状态相关的UI属性
  const getStatusInfo = () => {
    switch (status) {
      case 'starting':
        return {
          color: '#1890ff',
          title: 'MSW正在启动中...',
          spinning: true
        };
      case 'restarting':
        return {
          color: '#faad14',
          title: 'MSW正在重启中...',
          spinning: true
        };
      case 'running':
        return {
          color: '#52c41a',
          title: 'MSW运行中（点击关闭）',
          spinning: false
        };
      case 'error':
        return {
          color: '#ff4d4f',
          title: 'MSW出现错误（点击重试）',
          spinning: false
        };
      case 'stopped':
        return {
          color: '#8c8c8c',
          title: 'MSW已停止（点击启动）',
          spinning: false
        };
      default:
        return {
          color: mockEnabled ? '#1677ff' : '#ffffff',
          title: mockEnabled ? 'Mock已开启（点击关闭）' : 'Mock已关闭（点击开启）',
          spinning: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <button
        onClick={toggleMock}
        title={statusInfo.title}
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
          backgroundColor: statusInfo.color === '#ffffff' ? '#ffffff' : statusInfo.color,
          color: statusInfo.color === '#ffffff' ? '#666666' : '#ffffff',
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
        <ApiOutlined spin={statusInfo.spinning || isLoading} />
      </button>
    </>
  );
}; 