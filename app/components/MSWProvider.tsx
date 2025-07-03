'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Switch, Card, Typography, Alert, Space, Button, Spin } from 'antd';
import { ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { initMSW } from '@/init-msw';
import { forceRestartMSW } from '@/mocks/browser';
import { useTheme } from './hooks/useTheme';

const { Text } = Typography;

// MSW 上下文
interface MSWContextType {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
  forceRestart: () => Promise<void>;
  status: 'idle' | 'starting' | 'running' | 'stopped' | 'error' | 'restarting';
}

const MSWContext = createContext<MSWContextType | null>(null);

export const useMSW = () => {
  const context = useContext(MSWContext);
  if (!context) {
    throw new Error('useMSW must be used within MSWProvider');
  }
  return context;
};

interface MSWProviderProps {
  children: React.ReactNode;
}

export const MSWProvider: React.FC<MSWProviderProps> = ({ children }) => {
  const { theme: currentTheme } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'running' | 'stopped' | 'error' | 'restarting'>('idle');

  const toggle = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!enabled) {
        console.log('🚀 启动 MSW...');
        setStatus('starting');
        
        const success = await initMSW();
        if (success) {
          setEnabled(true);
          setStatus('running');
          console.log('✅ MSW 启动成功');
        } else {
          throw new Error('MSW 启动失败');
        }
      } else {
        console.log('⏹️ 停止 MSW...');
        // 这里可以添加停止 MSW 的逻辑
        setEnabled(false);
        setStatus('stopped');
        console.log('⏹️ MSW 已停止');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MSW 操作失败';
      setError(errorMessage);
      setStatus('error');
      console.error('MSW 操作失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const forceRestart = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setStatus('restarting');
    
    try {
      console.log('🔄 强制重启 MSW...');
      
      const success = await forceRestartMSW();
      if (success) {
        setEnabled(true);
        setStatus('running');
        console.log('✅ MSW 强制重启成功');
      } else {
        throw new Error('MSW 强制重启失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MSW 强制重启失败';
      setError(errorMessage);
      setStatus('error');
      console.error('MSW 强制重启失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时的自动初始化 - 使用强制重启确保清理旧的Service Worker
  useEffect(() => {
    // 只在开发环境自动启动
    if (process.env.NODE_ENV === 'development' && !enabled && !loading && status === 'idle') {
      console.log('🚀 开发环境自动启动 MSW（强制重启模式）...');
      forceRestart();
    }
  }, []);

  const contextValue: MSWContextType = {
    enabled,
    loading,
    error,
    toggle,
    forceRestart,
    status,
  };

  return (
    <MSWContext.Provider value={contextValue}>
      {children}
    </MSWContext.Provider>
  );
};

// MSW 控制组件
export const MSWToggle: React.FC = () => {
  const { enabled, loading, error, toggle, forceRestart, status } = useMSW();
  const { theme: currentTheme } = useTheme();

  // 获取状态图标
  const getStatusIcon = () => {
    switch (status) {
      case 'starting':
        return <LoadingOutlined spin style={{ color: '#1890ff' }} />;
      case 'restarting':
        return <ReloadOutlined spin style={{ color: '#faad14' }} />;
      case 'running':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'stopped':
        return <ApiOutlined style={{ color: '#8c8c8c' }} />;
      default:
        return <ApiOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (status) {
      case 'starting':
        return '启动中...';
      case 'restarting':
        return '🔄 重启中...';
      case 'running':
        return '✅ 运行中';
      case 'error':
        return '❌ 错误';
      case 'stopped':
        return '⏹️ 已停止';
      default:
        return '💤 空闲';
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'starting':
        return '#1890ff';
      case 'restarting':
        return '#faad14';
      default:
        return '#8c8c8c';
    }
  };

  return (
    <Card 
      size="small" 
      style={{ 
        background: currentTheme === 'light' ? '#fff' : 'rgba(255, 255, 255, 0.04)',
        border: currentTheme === 'light' ? '1px solid #d9d9d9' : '1px solid rgba(255, 255, 255, 0.12)',
        minWidth: '240px'
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            {getStatusIcon()}
            <Text strong style={{ color: currentTheme === 'light' ? '#333' : '#fff' }}>
              Mock API
            </Text>
          </Space>
          <Switch
            checked={enabled}
            loading={loading}
            onChange={toggle}
            checkedChildren="开"
            unCheckedChildren="关"
            size="small"
          />
        </div>
        
        <div style={{ fontSize: '12px', color: getStatusColor() }}>
          状态: {getStatusText()}
        </div>
        
        {error && (
          <Alert
            message="MSW 错误"
            description={error}
            type="error"
            showIcon
            action={
              <Space>
                <Button size="small" onClick={toggle} loading={loading}>
                  重试
                </Button>
                <Button 
                  size="small" 
                  onClick={forceRestart} 
                  loading={loading}
                  type="primary"
                  danger
                >
                  强制重启
                </Button>
              </Space>
            }
            style={{ marginTop: '8px' }}
          />
        )}
        
        {status === 'running' && (
          <div style={{ fontSize: '11px', color: '#52c41a', marginTop: '4px' }}>
            🎯 正在拦截API请求，静态资源已被智能过滤
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <div style={{ fontSize: '11px', color: '#999' }}>
            💡 自动启动仅在开发环境生效
          </div>
          <Button 
            size="small" 
            type="text" 
            icon={<ReloadOutlined />}
            onClick={forceRestart}
            loading={loading}
            title="强制重启MSW（清理Service Worker缓存）"
            style={{ fontSize: '12px', padding: '2px 6px' }}
          >
            强制重启
          </Button>
        </div>
      </Space>
    </Card>
  );
}; 