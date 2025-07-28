'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Switch, Card, Typography, Alert, Space, Button, Popover, Input, Form, Divider, message } from 'antd';
import { ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined, ReloadOutlined, InfoCircleOutlined, SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { useTheme } from './hooks/useTheme';
import { httpClient } from '@/utils/http-client';
import { apiRefreshEventBus } from '@/utils/api-refresh-bus';
import { getRuntimeApiBaseUrl } from '@/utils/runtime-env';
import { logger } from '@/utils/logger';

const { Text } = Typography;

type MSWStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'error' | 'restarting';

interface BackendConfig {
  url: string;
  port: string;
}

interface MSWContextType {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
  forceRestart: () => Promise<void>;
  status: MSWStatus;
  backendConfig: BackendConfig;
  updateBackendConfig: (config: BackendConfig) => void;
}

const MSWContext = createContext<MSWContextType | null>(null);

export { MSWContext, type MSWContextType };

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
  // 检查是否为生产环境或MSW被明确禁用
  const isMSWDisabled = import.meta.env.PROD || import.meta.env.VITE_ENABLE_MSW !== 'true';
  
  const [isClient, setIsClient] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<MSWStatus>('idle');
  const [backendConfig, setBackendConfig] = useState<BackendConfig>({
    url: 'localhost',
    port: '8080'
  });

  // 如果MSW被禁用，提供一个简化的context值
  if (isMSWDisabled) {
    const contextValue = useMemo<MSWContextType>(() => ({
      enabled: false,
      loading: false,
      error: null,
      status: 'stopped',
      backendConfig: {
        url: 'localhost',
        port: '8080'
      },
      toggle: async () => {
        logger.info('MSW is disabled in production mode');
      },
      forceRestart: async () => {
        logger.info('MSW is disabled in production mode');
      },
      updateBackendConfig: () => {
        logger.info('MSW is disabled in production mode');
      }
    }), []);

    return (
      <MSWContext.Provider value={contextValue}>
        {children}
      </MSWContext.Provider>
    );
  }

  // 获取环境变量作为默认值
  const getDefaultBackendConfig = useCallback((): BackendConfig => {
    // 使用运行时环境变量获取函数
    const runtimeApiUrl = getRuntimeApiBaseUrl();
    try {
      const url = new URL(runtimeApiUrl);
      return {
        url: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80')
      };
    } catch {
      return {
        url: 'localhost',
        port: '8080'
      };
    }
  }, []);

  // 客户端初始化并从 localStorage 读取状态
  useEffect(() => {
    setIsClient(true);
    
    // 优先级：1. localStorage用户设置（最高优先级）2. 环境变量 3. 硬编码默认值
    const savedBackendConfig = localStorage.getItem('nspass-backend-config');
    if (savedBackendConfig) {
      try {
        const config = JSON.parse(savedBackendConfig);
        setBackendConfig(config);
        logger.debug('🔄 从 localStorage 恢复用户设置的后端配置（优先级最高）:', config);
        
        // 立即应用用户配置到httpClient（如果MSW未启用）
        if (!enabled) {
          const url = `${config.port === '443' ? 'https' : 'http'}://${config.url}${config.port === '443' || config.port === '80' ? '' : ':' + config.port}`;
          httpClient.clearCache();
          httpClient.updateBaseURL(url);
          console.log('🎯 立即应用用户配置到HTTP客户端（优先级最高）:', url);
        }
      } catch {
        logger.warn('解析用户设置的后端配置失败，使用环境变量默认配置');
        const defaultConfig = getDefaultBackendConfig();
        setBackendConfig(defaultConfig);
      }
    } else {
      // 首次使用，从环境变量获取初始配置
      const defaultConfig = getDefaultBackendConfig();
      setBackendConfig(defaultConfig);
      console.log('🔄 首次使用，从环境变量获取初始后端配置:', defaultConfig);
    }
  }, [getDefaultBackendConfig]);

  // 更新httpClient baseURL
  const updateBaseURL = useCallback((enabled: boolean) => {
    const url = enabled 
      ? window.location.origin 
      : `${backendConfig.port === '443' ? 'https' : 'http'}://${backendConfig.url}${backendConfig.port === '443' || backendConfig.port === '80' ? '' : ':' + backendConfig.port}`;
    
    httpClient.clearCache();
    httpClient.updateBaseURL(url);
  }, [backendConfig]);

  // 更新后端配置 - 用户设置具有最高优先级
  const updateBackendConfig = useCallback((config: BackendConfig) => {
    setBackendConfig(config);
    localStorage.setItem('nspass-backend-config', JSON.stringify(config));
    console.log('💾 用户后端配置已保存（优先级最高）:', config);
    
    // 立即应用新配置到httpClient（无论MSW是否启用）
    const url = enabled 
      ? window.location.origin 
      : `${config.port === '443' ? 'https' : 'http'}://${config.url}${config.port === '443' || config.port === '80' ? '' : ':' + config.port}`;
    
    httpClient.clearCache();
    httpClient.updateBaseURL(url);
    console.log('🎯 HTTP客户端已更新为用户设置的后端配置（优先级最高）:', url);
  }, [enabled]);

  // 同步httpClient配置 - 确保用户配置优先级最高
  useEffect(() => {
    if (isClient) {
      updateBaseURL(enabled);
      console.log('🔄 应用用户配置到HTTP客户端（优先级最高）');
    }
  }, [isClient, enabled, updateBaseURL, backendConfig]); // 添加backendConfig依赖确保配置变更时立即应用

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
          localStorage.setItem('nspass-mock-enabled', 'true');
          // 移除不必要的延迟，直接执行
          updateBaseURL(true);
          // 使用 Promise.resolve().then() 确保异步执行但无延迟
          Promise.resolve().then(() => apiRefreshEventBus.emit('msw-toggled'));
        } else {
          throw new Error('MSW 启动失败');
        }
      } else {
        const { stopMSW } = await import('@/mocks/browser');
        const success = await stopMSW();
        if (success) {
          setEnabled(false);
          setStatus('stopped');
          localStorage.setItem('nspass-mock-enabled', 'false');
          
          // 彻底清理缓存和配置
          httpClient.clearCache();
          
          // 移除延迟，直接更新baseURL
          updateBaseURL(false);
          console.log('🎯 MSW已停止，已切换到真实API模式');
          
          // 使用 Promise.resolve().then() 确保异步执行但无延迟
          Promise.resolve().then(() => apiRefreshEventBus.emit('msw-toggled'));
          
          // 可选：给用户一个提示而不是强制刷新
          setTimeout(() => {
            console.log('� 提示：如果遇到API请求问题，建议刷新页面以完全清除MSW缓存');
          }, 500);
        } else {
          throw new Error('MSW 停止失败');
        }
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
        localStorage.setItem('nspass-mock-enabled', 'true');
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

  // 根据 localStorage 状态决定是否启动（只在客户端初始化时执行一次）
  useEffect(() => {
    if (isClient && 
        import.meta.env.DEV && 
        !loading && 
        status === 'idle') {
      
      const savedMockEnabled = localStorage.getItem('nspass-mock-enabled');
      const shouldEnable = savedMockEnabled === null ? true : savedMockEnabled === 'true'; // 默认启用
      
      console.log('🔄 从 localStorage 恢复 MSW 状态:', shouldEnable ? '启用' : '禁用');
      
      if (shouldEnable) {
        console.log('🚀 根据保存的状态启动 MSW...');
        // 使用异步函数直接启动MSW，避免依赖toggle
        const startMSW = async () => {
          setLoading(true);
          setError(null);
          setStatus('starting');
          
          try {
            const { initMSW } = await import('@/init-msw');
            const success = await initMSW();
            
            if (success) {
              setEnabled(true);
              setStatus('running');
              localStorage.setItem('nspass-mock-enabled', 'true');
              // 更新baseURL为Mock模式（移除不必要的延迟）
              const url = window.location.origin;
              httpClient.clearCache();
              httpClient.updateBaseURL(url);
              console.log('🎯 MSW自动启动，baseURL设置为:', url);
              console.log('✅ MSW 自动启动成功');
            } else {
              throw new Error('MSW 自动启动失败');
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : 'MSW 自动启动失败';
            setError(message);
            setStatus('error');
            console.error('❌ MSW 自动启动失败:', message);
          } finally {
            setLoading(false);
          }
        };
        
        startMSW();
      } else {
        // 如果不需要启动，设置为stopped状态
        setEnabled(false);
        setStatus('stopped');
        // 更新baseURL为后端API模式（移除不必要的延迟）
        const url = `${backendConfig.port === '443' ? 'https' : 'http'}://${backendConfig.url}${backendConfig.port === '443' || backendConfig.port === '80' ? '' : ':' + backendConfig.port}`;
        httpClient.clearCache();
        httpClient.updateBaseURL(url);
        console.log('🎯 MSW保持停止，baseURL设置为:', url);
        console.log('⏹️ 根据保存的状态保持 MSW 停止状态');
      }
    }
  }, [isClient, loading, status, backendConfig]); // 添加backendConfig依赖

  const contextValue = useMemo(() => ({
    enabled,
    loading,
    error,
    toggle,
    forceRestart,
    status,
    backendConfig,
    updateBackendConfig,
  }), [enabled, loading, error, toggle, forceRestart, status, backendConfig, updateBackendConfig]);

  return (
    <MSWContext.Provider value={contextValue}>
      {children}
    </MSWContext.Provider>
  );
};

// 配置表单组件 - 独立组件确保 useForm 正确绑定
const ConfigForm: React.FC<{
  backendConfig: BackendConfig;
  updateBackendConfig: (config: BackendConfig) => void;
  enabled: boolean;
}> = ({ backendConfig, updateBackendConfig, enabled }) => {
  const [form] = Form.useForm();

  // 同步后端配置到表单
  useEffect(() => {
    form.setFieldsValue(backendConfig);
  }, [backendConfig, form]);

  // 后端配置表单提交 - 用户设置优先级最高
  const handleConfigSubmit = (values: BackendConfig) => {
    updateBackendConfig(values);
    const newUrl = enabled 
      ? window.location.origin 
      : `${values.port === '443' ? 'https' : 'http'}://${values.url}${values.port === '443' || values.port === '80' ? '' : ':' + values.port}`;
    
    message.success(`用户配置已保存（优先级最高），当前API地址：${newUrl}`);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      size="small"
      initialValues={backendConfig}
      onFinish={handleConfigSubmit}
      style={{ marginBottom: 0 }}
    >
      <Form.Item
        label="后端地址"
        style={{ marginBottom: '8px' }}
      >
        <Input.Group compact>
          <Form.Item
            name="url"
            rules={[{ required: true, message: '请输入域名或IP地址' }]}
            style={{ 
              width: 'calc(100% - 70px)', 
              marginBottom: 0
            }}
          >
            <Input 
              placeholder="localhost" 
              size="small"
              style={{ 
                fontSize: '12px'
              }}
            />
          </Form.Item>
          <Form.Item
            name="port"
            rules={[
              { required: true, message: '请输入端口号' },
              { pattern: /^\d+$/, message: '端口号必须是数字' }
            ]}
            style={{ 
              width: '70px', 
              marginBottom: 0
            }}
          >
            <Input 
              addonBefore={
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  :
                </span>
              }
              placeholder="8080"
              size="small"
              style={{ 
                fontSize: '12px'
              }}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      
      <Form.Item style={{ marginBottom: 0 }}>
        <Button 
          type="primary" 
          htmlType="submit" 
          size="small"
          icon={<SaveOutlined />}
          block
          style={{ 
            fontSize: '12px',
            height: '28px',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(24,144,255,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(24,144,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(24,144,255,0.3)';
          }}
        >
          保存配置
        </Button>
      </Form.Item>
    </Form>
  );
};

export const MSWToggle: React.FC = () => {
  // Check if MSW context is available first
  const context = useContext(MSWContext);
  const { theme } = useTheme();

  // If MSW is not enabled or context is not available, don't render
  if (!context || import.meta.env.PROD || import.meta.env.VITE_ENABLE_MSW !== 'true') {
    return null;
  }

  const { enabled, loading, error, toggle, forceRestart, status, backendConfig, updateBackendConfig } = context;

  // 所有hooks必须在早期返回之前调用
  const apiInfo = useMemo(() => {
    if (enabled) {
      return { 
        url: typeof window !== 'undefined' ? window.location.origin : '',
        type: 'Mock数据'
      };
    }
    return {
      url: `${backendConfig.port === '443' ? 'https' : 'http'}://${backendConfig.url}${backendConfig.port === '443' || backendConfig.port === '80' ? '' : ':' + backendConfig.port}`,
      type: '真实API'
    };
  }, [enabled, backendConfig]);

  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  const popoverContent = (
    <Card size="small" style={{ width: 320, borderRadius: '8px' }}>
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

        {/* 分割线 */}
        <Divider style={{ margin: '8px 0' }} />

        {/* 后端配置 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <SettingOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: '13px' }}>后端配置</Text>
          </div>
          
          <ConfigForm
            backendConfig={backendConfig}
            updateBackendConfig={updateBackendConfig}
            enabled={enabled}
          />
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