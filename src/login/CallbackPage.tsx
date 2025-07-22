'use client';

import { useEffect, useState, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { OAuth2Service, OAuth2Factory, OAuth2User } from '@/utils/oauth2';
import { useAuth } from '@/components/hooks/useAuth';

function OAuth2CallbackContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<OAuth2User | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('OAuth2 Callback - 参数:', { code, state, error });

        if (error) {
          setError(`OAuth2 错误: ${error}`);
          setLoading(false);
          return;
        }

        if (!code || !state) {
          setError('缺少必要的参数 (code 或 state)');
          setLoading(false);
          return;
        }

        // 从 state 中恢复 OAuth2 提供商信息
        let provider: string;
        try {
          const stateData = JSON.parse(atob(state));
          provider = stateData.provider;
        } catch {
          setError('无效的 state 参数');
          setLoading(false);
          return;
        }

        console.log('OAuth2 Callback - 提供商:', provider);

        // 获取 OAuth2 服务实例 (暂时使用占位符配置)
        const oauth2Service = OAuth2Factory.getService(provider, 'placeholder', window.location.origin);
        if (!oauth2Service) {
          setError(`不支持的 OAuth2 提供商: ${provider}`);
          setLoading(false);
          return;
        }

        // 交换授权码获取用户信息
        const userInfo = await oauth2Service.exchangeCode(code, state);
        
        console.log('OAuth2 Callback - 用户信息:', userInfo);
        
        setUser(userInfo);
        
        // 执行登录
        authLogin(userInfo, 'oauth2');
        
        setTimeout(() => {
          navigate('/');
        }, 1500);

      } catch (err) {
        console.error('OAuth2 回调处理失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, authLogin, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: 20
      }}>
        <Spin 
          size="large" 
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} />}
        />
        <h2 style={{ color: '#1890ff', margin: 0 }}>正在处理登录...</h2>
        <p style={{ color: '#666', margin: 0 }}>请稍候，正在验证您的身份</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Result
          status="error"
          title="登录失败"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => navigate('/login')}>
              返回登录
            </Button>
          }
        />
      </div>
    );
  }

  if (user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Result
          status="success"
          title="登录成功"
          subTitle={`欢迎，${user.name}！正在跳转到主页...`}
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              立即跳转
            </Button>
          }
        />
      </div>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    }>
      <OAuth2CallbackContent />
    </Suspense>
  );
}
