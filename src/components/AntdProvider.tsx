'use client';

import React from 'react';
import { ConfigProvider, App, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import '@ant-design/v5-patch-for-react-19';
import { initMessage } from '@/utils/message';
import { useTheme } from './hooks/useTheme';
import { ANTD_THEME_CONFIG } from '@/config/theme.config';

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
  const { resolvedTheme } = useTheme();
  
  // 生成Antd主题配置
  const getThemeConfig = React.useMemo(() => {
    const themeConfig = ANTD_THEME_CONFIG[resolvedTheme];
    
    // 动态选择算法
    const algorithm = resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;
    
    return {
      algorithm,
      token: themeConfig.token,
      components: themeConfig.components,
    };
  }, [resolvedTheme]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={getThemeConfig}
      // 确保配置变更时的平滑过渡
      key={`theme-${resolvedTheme}`}
    >
      <App
        className="ant-app"
        style={{ 
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
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