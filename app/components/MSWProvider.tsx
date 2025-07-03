'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Switch, Card, Typography, Alert, Space, Button, Popover } from 'antd';
import { ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTheme } from './hooks/useTheme';
import { httpClient } from '@/utils/http-client';

const { Text } = Typography;

type MSWStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'error' | 'restarting';

interface MSWContextType {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
  forceRestart: () => Promise<void>;
  status: MSWStatus;
}

const MSWContext = createContext<MSWContextType | null>(null);

export const useMSW = () => {
  const context = useContext(MSWContext);
  if (!context) {
    throw new Error('useMSW must be used within MSWProvider');
  }
  return context;
};

// 状态配置映射
const STATUS_CONFIG = {
  running: { color: '#52c41a', icon: CheckCircleOutlined, text: '运行中' },
  error: { color: '#ff4d4f', icon: ExclamationCircleOutlined, text: '错误' },
  starting: { color: '#1890ff', icon: LoadingOutlined, text: '启动中' },
  restarting: { color: '#1890ff', icon: ReloadOutlined, text: '重启中' },
  stopped: { color: '#8c8c8c', icon: ApiOutlined, text: '已停止' },
  idle: { color: '#8c8c8c', icon: ApiOutlined, text: '空闲' },
} as const;

export const MSWProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<MSWStatus>('idle');

  // 客户端初始化
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 更新httpClient baseURL
  const updateBaseURL = useCallback((enabled: boolean) => {
    const url = enabled 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_REAL_API_URL || 'http://localhost:8080';
    
    httpClient.clearCache();
    httpClient.updateBaseURL(url);
  }, []);

  // 同步httpClient配置
  useEffect(() => {
    if (isClient) {
      updateBaseURL(enabled);
    }
  }, [isClient, enabled, updateBaseURL]);

  // MSW操作函数
  const toggle = useCallback(async () => {
    if (!isClient || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!enabled) {
        setStatus('starting');
        const { initMSW } = await import('@/init-msw');
        const success = await initMSW();
        
        if (success) {
          setEnabled(true);
          setStatus('running');
          setTimeout(() => updateBaseURL(true), 100);
        } else {
          throw new Error('MSW 启动失败');
        }
      } else {
        const { worker } = await import('@/mocks/browser');
        if (worker) await worker.stop();
        
        setEnabled(false);
        setStatus('stopped');
        setTimeout(() => updateBaseURL(false), 100);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'MSW 操作失败';
      setError(message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [isClient, loading, enabled, updateBaseURL]);

  const forceRestart = useCallback(async () => {
    if (!isClient || loading) return;
    
    setLoading(true);
    setError(null);
    setStatus('restarting');
    
    try {
      const { forceRestartMSW } = await import('@/mocks/browser');
      const success = await forceRestartMSW();
      
      if (success) {
        setEnabled(true);
        setStatus('running');
        setTimeout(() => updateBaseURL(true), 100);
      } else {
        throw new Error('MSW 重启失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'MSW 重启失败';
      setError(message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [isClient, loading, updateBaseURL]);

  // 开发环境自动启动
  useEffect(() => {
    if (isClient && 
        process.env.NODE_ENV === 'development' && 
        !enabled && 
        !loading && 
        status === 'idle') {
      setTimeout(forceRestart, 100);
    }
  }, [isClient, enabled, loading, status, forceRestart]);

  const contextValue = useMemo(() => ({
    enabled,
    loading,
    error,
    toggle,
    forceRestart,
    status,
  }), [enabled, loading, error, toggle, forceRestart, status]);

  return (
    <MSWContext.Provider value={contextValue}>
      {children}
    </MSWContext.Provider>
  );
};

export const MSWToggle: React.FC = () => {
  const { enabled, loading, error, toggle, forceRestart, status } = useMSW();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 所有hooks必须在早期返回之前调用
  const apiInfo = useMemo(() => {
    if (!isClient) {
      return { url: '', type: '' };
    }
    if (enabled) {
      return { 
        url: window.location.origin,
        type: 'Mock数据'
      };
    }
    return {
      url: process.env.NEXT_PUBLIC_REAL_API_URL || 'http://localhost:8080',
      type: '真实API'
    };
  }, [enabled, isClient]);

  if (!isClient) return null;

  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  const popoverContent = (
    <Card size="small" style={{ width: 300, borderRadius: '8px' }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* 状态 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconComponent spin={status === 'starting' || status === 'restarting'} style={{ color: config.color }} />
          <Text strong>Mock API</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {config.text}
          </Text>
        </div>

        {/* 运行提示 */}
        {status === 'running' && (
          <Alert
            message="正在拦截API请求，静态资源已被智能过滤"
            type="success"
            showIcon
            style={{ fontSize: '12px', padding: '8px' }}
          />
        )}

        {/* 错误提示 */}
        {error && (
          <Alert
            message="服务异常"
            description={error}
            type="error"
            showIcon
            style={{ fontSize: '12px' }}
            action={
              <Space>
                <Button size="small" onClick={toggle} loading={loading}>
                  重试
                </Button>
                <Button size="small" onClick={forceRestart} loading={loading} type="primary" danger>
                  重启
                </Button>
              </Space>
            }
          />
        )}

        {/* API信息 */}
        <div style={{
          background: theme === 'light' ? '#fafafa' : 'rgba(255,255,255,0.05)',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '4px' }}>
            <Text type="secondary">当前数据源: </Text>
            <Text style={{ color: config.color, fontWeight: '500' }}>
              {apiInfo.type}
            </Text>
          </div>
          <Text type="secondary" style={{ 
            fontFamily: 'monospace',
            fontSize: '11px',
            wordBreak: 'break-all'
          }}>
            {apiInfo.url}
          </Text>
        </div>

        {/* 操作区 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            💡 开发环境自动启动
          </Text>
          <Button 
            size="small" 
            type="text" 
            icon={<ReloadOutlined />}
            onClick={forceRestart}
            loading={loading}
            style={{ fontSize: '11px' }}
          >
            强制重启
          </Button>
        </div>
      </Space>
    </Card>
  );

  return (
    <Space size={8}>
      <Switch
        checked={enabled}
        loading={loading}
        onChange={toggle}
        checkedChildren="开"
        unCheckedChildren="关"
        style={{
          backgroundColor: enabled ? config.color : undefined
        }}
      />
      
      <Popover
        content={popoverContent}
        placement="bottomRight"
        trigger="click"
        arrow={{ pointAtCenter: true }}
      >
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          size="small"
          style={{
            color: config.color,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px'
          }}
          title="查看Mock服务详情"
        />
      </Popover>
    </Space>
  );
}; 