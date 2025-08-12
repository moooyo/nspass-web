'use client';

import { useEffect, useState, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { OAuth2Service, OAuth2Factory, OAuth2User } from '@/utils/oauth2';
import { useAuthStore } from '@/stores/auth';

function OAuth2CallbackContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<OAuth2User | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        setError(null);

        const provider = searchParams.get('provider') || localStorage.getItem('oauth2_provider');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error_param = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error_param) {
          throw new Error(error_description || `OAuth2 error: ${error_param}`);
        }

        if (!provider) {
          throw new Error('缺少 OAuth2 提供商信息');
        }

        if (!code) {
          throw new Error('缺少授权码');
        }

        const oauth2Service: OAuth2Service = OAuth2Factory.createService(provider as any);
        const userInfo = await oauth2Service.handleCallback(code, state);
        
        if (!userInfo) {
          throw new Error('获取用户信息失败');
        }

        // Convert OAuth2User to User format expected by the store
        const appUser = {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          permissions: ['user'], // Default permissions
        };

        setUserInfo(userInfo);
        await login(appUser, 'oauth2');

        localStorage.removeItem('oauth2_provider');
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (err) {
        console.error('OAuth2 callback error:', err);
        setError(err instanceof Error ? err.message : 'OAuth2 认证失败');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <CardTitle>正在处理登录</CardTitle>
            <CardDescription>
              请稍候，正在验证您的身份...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <CardTitle>登录失败</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => navigate('/login')}
            >
              返回登录页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-600" />
          <CardTitle>登录成功</CardTitle>
          <CardDescription>
            欢迎回来，{userInfo?.name || '用户'}！正在跳转到主页...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={() => navigate('/')}
          >
            立即前往主页
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <OAuth2CallbackContent />
    </Suspense>
  );
}
