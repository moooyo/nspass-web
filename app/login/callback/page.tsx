'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { OAuth2Service, OAuth2Factory, OAuth2User } from '@/utils/oauth2';
import { useAuth } from '@/components/hooks/useAuth';

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<OAuth2User | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const provider = searchParams.get('provider') || 'github';
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth2 error: ${error}`);
        }

        if (!code) {
          throw new Error('未收到授权码');
        }

        // 从localStorage获取OAuth2配置（实际应用中应该从服务器获取）
        const storedConfig = localStorage.getItem(`oauth2_${provider}_config`);
        if (!storedConfig) {
          throw new Error('OAuth2配置未找到');
        }

        const config = JSON.parse(storedConfig);
        let oauth2Provider;

        // 根据provider类型创建对应的OAuth2Provider
        switch (provider) {
          case 'github':
            oauth2Provider = OAuth2Factory.createGitHubProvider(
              config.clientId,
              config.redirectUri
            );
            break;
          case 'google':
            oauth2Provider = OAuth2Factory.createGoogleProvider(
              config.clientId,
              config.redirectUri
            );
            break;
          case 'microsoft':
            oauth2Provider = OAuth2Factory.createMicrosoftProvider(
              config.clientId,
              config.redirectUri
            );
            break;
          default:
            throw new Error(`不支持的OAuth2提供商: ${provider}`);
        }

        const oauth2Service = new OAuth2Service(oauth2Provider);
        const userInfo = await oauth2Service.login(code, state || undefined);

        setUser(userInfo);
        
        // 使用 useAuth hook 更新登录状态
        authLogin(userInfo, 'oauth2');

        // 清理OAuth2配置
        localStorage.removeItem(`oauth2_${provider}_config`);

        // 延迟跳转，让用户看到成功信息
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (err) {
        setError(err instanceof Error ? err.message : '登录失败');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
          size="large" 
        />
        <div style={{ fontSize: '16px', color: '#666' }}>
          正在处理登录信息...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Result
          status="error"
          title="登录失败"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" onClick={() => router.push('/login')}>
              重试登录
            </Button>,
          ]}
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
        height: '100vh' 
      }}>
        <Result
          status="success"
          title="登录成功"
          subTitle={`欢迎，${user.name}！正在跳转到主页...`}
          extra={[
            <Button type="primary" key="home" onClick={() => router.push('/')}>
              立即跳转
            </Button>,
          ]}
        />
      </div>
    );
  }

  return null;
} 