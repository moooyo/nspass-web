'use client';

import React from 'react';
import { ConfigProvider, App, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import '@ant-design/v5-patch-for-react-19';
import { initMessage } from '@/utils/message';
import { useTheme } from './hooks/useTheme';

// 内部组件，用于获取 App 实例
function AppContent({ children }: { children: React.ReactNode }) {
  const { message } = App.useApp();
  
  // 初始化消息实例
  React.useEffect(() => {
    initMessage(message);
  }, [message]);
  
  return <>{children}</>;
}

// 主题感知的配置提供者
function ThemeAwareConfigProvider({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme();
  
  const getThemeConfig = () => {
    const isDark = currentTheme === 'dark';
    
    return {
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#1890FF',
        borderRadius: 6,
      },
      components: {
        Table: {
          fontSize: 14,
          headerBg: isDark ? '#1f1f1f' : '#f5f5f5',
        },
        Card: {
          boxShadow: 'none',
          borderRadius: 8,
        },
        Layout: {
          bodyBg: 'transparent',
          headerBg: 'transparent',
          siderBg: 'transparent',
        },
        Menu: {
          darkItemBg: 'transparent',
          darkSubMenuItemBg: 'transparent',
          darkItemColor: 'rgba(255, 255, 255, 0.85)',
          darkItemHoverColor: '#ffffff',
          darkItemSelectedColor: '#ffffff',
          darkItemSelectedBg: '#1890ff',
          itemBg: 'transparent',
          subMenuItemBg: 'transparent',
          itemColor: 'rgba(255, 255, 255, 0.85)',
          itemHoverColor: '#ffffff',
          itemSelectedColor: '#ffffff',
          itemSelectedBg: '#1890ff',
        },
      },
    };
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={getThemeConfig()}
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

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return <ThemeAwareConfigProvider>{children}</ThemeAwareConfigProvider>;
} 