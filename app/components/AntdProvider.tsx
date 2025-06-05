'use client';

import React from 'react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import '@ant-design/v5-patch-for-react-19';
import { initMessage } from '@/utils/message';

// 内部组件，用于获取 App 实例
function AppContent({ children }: { children: React.ReactNode }) {
  const { message } = App.useApp();
  
  // 初始化消息实例
  React.useEffect(() => {
    initMessage(message);
  }, [message]);

  // 使用 div 包装而不是 Fragment，避免 React 19 的兼容性问题
  return <div style={{ height: '100%', width: '100%' }}>{children}</div>;
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        // 添加一些 React 19 兼容性配置
        token: {
          // 确保主题配置正确
        },
      }}
    >
      <App
        style={{ height: '100%' }}
        // 禁用一些可能导致问题的特性
        notification={{
          placement: 'topRight',
        }}
        message={{
          duration: 3,
        }}
      >
        <AppContent>{children}</AppContent>
      </App>
    </ConfigProvider>
  );
} 