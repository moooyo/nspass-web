'use client';

import React from 'react';
import { ConfigProvider, App, theme } from 'antd';
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
  
  return <>{children}</>;
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890FF',
          borderRadius: 6,
        },
        components: {
          Table: {
            fontSize: 14,
            headerBg: '#f5f5f5',
          },
          Card: {
            boxShadow: 'none',
            borderRadius: 8,
          },
          Layout: {
            bodyBg: '#f0f2f5',
            headerBg: '#fff',
            siderBg: '#001529',
          },
        },
      }}
    >
      <App
        className="ant-app"
        style={{ height: '100%' }}
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