'use client';

import { useState, useEffect } from 'react';
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  GithubOutlined,
  GoogleOutlined,
  WindowsOutlined,
  DownOutlined,
  UpOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProConfigProvider,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { theme, Divider, Space, Button, Tabs, Spin, Typography } from 'antd';
import { message } from '@/utils/message';
import { useRouter } from 'next/navigation';
import { OAuth2Service, OAuth2Factory } from '@/utils/oauth2';
import { authService } from '@/services/auth';
import { useAuth } from '@/components/hooks/useAuth';
import { passkeyService } from '@/services/passkey';
import { PasskeyUtils } from '@/utils/passkey';

const { Text } = Typography;

type LoginType = 'account' | 'email';

const LoginPage = () => {
  const { token } = theme.useToken();
  const router = useRouter();
  const { isAuthenticated, isLoading, login: authLogin } = useAuth();
  const [loginType, setLoginType] = useState<LoginType>('account');
  const [showAllOAuth, setShowAllOAuth] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // 如果已登录，重定向到主页
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // 登录验证
  const handleLogin = async (values: any) => {
    try {
      console.log('登录表单数据:', values);
      
      // 确定用户名字段：邮箱登录使用email，账号登录使用username
      const username = loginType === 'email' ? values.email : values.username;
      
      // 调用登录API
      const response = await authService.login({
        username,
        password: values.password
      });

      if (response.base.success && response.data) {
        // 保存认证信息
        authService.saveAuthData(response.data);
        
        // 使用 useAuth hook 更新登录状态
        const user = {
          ...response.data.user,
          name: response.data.user.username, // 映射 username 到 name
          provider: 'local'
        };
        authLogin(user, loginType);
        
        message.success(response.base.message || '登录成功！');
        router.push('/');
      } else {
        message.error(response.base.message || '登录失败');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请重试';
      message.error(errorMessage);
      console.error('登录错误:', error);
    }
  };

    // Passkey登录处理
  const handlePasskeyLogin = async () => {
    if (!PasskeyUtils.isWebAuthnSupported()) {
      message.error('您的浏览器不支持Passkey认证');
      return;
    }

    setPasskeyLoading(true);
    try {
      const result = await passkeyService.completeAuthentication();
      
      if (result.base?.success && result.data) {
        const loginData = result.data;
        
        // 保存认证信息到本地存储
        authService.saveAuthData({
          token: loginData.token || 'mock-passkey-token',
          refreshToken: loginData.refreshToken || 'mock-refresh-token',
          expiresIn: loginData.expiresIn || 3600,
          user: {
            id: loginData.id?.toString() || 'passkey-user',
            username: loginData.name || 'passkey-user',
            email: loginData.email || 'passkey@nspass.com',
            avatar: '',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          }
        });
        
        // 使用 useAuth hook 更新登录状态
        const user = {
          id: loginData.id?.toString() || 'passkey-user',
          name: loginData.name || 'passkey-user',
          email: loginData.email || 'passkey@nspass.com',
          role: loginData.role || 'user',
          provider: 'passkey'
        };
        authLogin(user, 'passkey');
        
        message.success(`Passkey登录成功！使用设备: ${loginData.credentialName}`);
        router.push('/');
      } else {
        message.error(result.base?.message || 'Passkey登录失败');
      }
    } catch (error) {
      console.error('Passkey登录错误:', error);
      
      // 处理特定的WebAuthn错误
      if (error instanceof Error && 'type' in error) {
        const errorType = (error as Error & { type: string }).type;
        switch (errorType) {
          case 'user_cancelled':
            message.error('Passkey认证被取消');
            break;
          case 'not_supported':
            message.error('此设备不支持Passkey认证');
            break;
          case 'security':
            message.error('Passkey认证安全错误');
            break;
          case 'network':
            message.error('网络连接错误，请检查网络');
            break;
          default:
            message.error(error.message || 'Passkey登录失败，请重试');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Passkey登录失败，请重试';
        message.error(errorMessage);
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  // OAuth2登录处理
  const handleOAuth2Login = (provider: 'github' | 'google' | 'microsoft') => {
    try {
      // 获取当前域名和端口
      const currentUrl = window.location.origin;
      const redirectUri = `${currentUrl}/login/callback?provider=${provider}`;
      
      // OAuth2配置（实际应用中应该从环境变量或服务器获取）
      const configs = {
        github: {
          clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'your_github_client_id',
          redirectUri
        },
        google: {
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your_google_client_id',
          redirectUri
        },
        microsoft: {
          clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || 'your_microsoft_client_id',
          redirectUri
        }
      };

      const config = configs[provider];
      if (!config.clientId || config.clientId.includes('your_')) {
        message.warning(`请先配置${provider.toUpperCase()}的OAuth2客户端ID`);
        return;
      }

      // 保存配置到localStorage供回调页面使用
      localStorage.setItem(`oauth2_${provider}_config`, JSON.stringify(config));

      let oauth2Provider;
      switch (provider) {
        case 'github':
          oauth2Provider = OAuth2Factory.createGitHubProvider(config.clientId, config.redirectUri);
          break;
        case 'google':
          oauth2Provider = OAuth2Factory.createGoogleProvider(config.clientId, config.redirectUri);
          break;
        case 'microsoft':
          oauth2Provider = OAuth2Factory.createMicrosoftProvider(config.clientId, config.redirectUri);
          break;
      }

      const oauth2Service = new OAuth2Service(oauth2Provider);
      oauth2Service.redirectToAuth();

    } catch (error) {
      message.error(`${provider}登录失败，请重试`);
      console.error('OAuth2登录错误:', error);
    }
  };

  const tabItems = [
    {
      key: 'account',
      label: '账号密码登录',
    },
    {
      key: 'email',
      label: '邮箱登录',
    },
  ];

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text style={{ color: 'white' }}>正在检查登录状态...</Text>
      </div>
    );
  }

  // 如果已登录，不显示登录表单（将被重定向）
  if (isAuthenticated) {
    return null;
  }

  return (
    <ProConfigProvider hashed={false}>
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        padding: '20px 0'
      }}>
        {/* 背景装饰图案 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />
        
        <div style={{ 
          width: 'auto',
          minWidth: '320px',
          maxWidth: 'min(90vw, 600px)',
          margin: '0 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1
        }}>
          <LoginForm
            logo="https://github.githubassets.com/favicons/favicon.png"
            title="NSPass"
            subTitle="现代化的密码管理平台"
            onFinish={handleLogin}
            submitter={{
              searchConfig: {
                submitText: '登录'
              },
              submitButtonProps: {
                size: 'large',
                style: {
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500'
                }
              }
            }}
            contentStyle={{
              padding: '32px clamp(24px, 4vw, 48px) 40px'
            }}
          >
            <Tabs
              activeKey={loginType}
              onChange={(activeKey) => setLoginType(activeKey as LoginType)}
              centered
              items={tabItems}
              style={{ marginBottom: '8px' }}
            />

            {loginType === 'account' && (
              <>
                <ProFormText
                  name="username"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined className={'prefixIcon'} />,
                    style: { borderRadius: '8px' }
                  }}
                  placeholder={'请输入用户名'}
                  rules={[
                    {
                      required: true,
                      message: '请输入用户名!',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={'prefixIcon'} />,
                    style: { borderRadius: '8px' }
                  }}
                  placeholder={'请输入密码'}
                  rules={[
                    {
                      required: true,
                      message: '请输入密码！',
                    },
                  ]}
                />
              </>
            )}

            {loginType === 'email' && (
              <>
                <ProFormText
                  name="email"
                  fieldProps={{
                    size: 'large',
                    prefix: <MailOutlined className={'prefixIcon'} />,
                    style: { borderRadius: '8px' }
                  }}
                  placeholder={'请输入邮箱地址'}
                  rules={[
                    {
                      required: true,
                      message: '请输入邮箱地址!',
                    },
                    {
                      type: 'email',
                      message: '请输入有效的邮箱地址!',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={'prefixIcon'} />,
                    style: { borderRadius: '8px' }
                  }}
                  placeholder={'请输入密码'}
                  rules={[
                    {
                      required: true,
                      message: '请输入密码！',
                    },
                  ]}
                />
              </>
            )}

            <div
              style={{
                marginBlockEnd: 24,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                自动登录
              </ProFormCheckbox>
              <a
                style={{
                  float: 'right',
                }}
                href="#"
              >
                忘记密码？
              </a>
            </div>

            <Divider style={{ margin: '24px 0' }}>
              <span style={{ color: token.colorTextSecondary, fontSize: '14px' }}>
                或使用以下方式登录
              </span>
            </Divider>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Passkey登录按钮 */}
              <Button
                type="primary"
                size="large"
                icon={<SafetyOutlined />}
                onClick={handlePasskeyLogin}
                loading={passkeyLoading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                  borderColor: '#722ed1',
                  borderRadius: '8px',
                  height: '44px',
                  fontSize: '15px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}
              >
                使用Passkey登录
              </Button>

              {/* 主要的GitHub登录按钮 */}
              <Button
                type="primary"
                size="large"
                icon={<GithubOutlined />}
                onClick={() => handleOAuth2Login('github')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #24292e 0%, #1a1e22 100%)',
                  borderColor: '#24292e',
                  borderRadius: '8px',
                  height: '44px',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                使用GitHub登录
              </Button>

              {/* 展开/折叠其他OAuth选项 */}
              <Button
                type="text"
                size="small"
                icon={showAllOAuth ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setShowAllOAuth(!showAllOAuth)}
                style={{
                  width: '100%',
                  color: token.colorTextSecondary,
                  fontSize: '12px',
                  height: '32px',
                  borderRadius: '6px'
                }}
              >
                {showAllOAuth ? '收起其他登录方式' : '更多登录方式'}
              </Button>

              {/* 其他OAuth登录选项 - 可折叠 */}
              {showAllOAuth && (
                <Space direction="vertical" size="small" style={{ width: '100%', marginTop: '8px' }}>
                  <Button
                    size="large"
                    icon={<GoogleOutlined />}
                    onClick={() => handleOAuth2Login('google')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: '#d9d9d9',
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px'
                    }}
                  >
                    使用Google登录
                  </Button>

                  <Button
                    size="large"
                    icon={<WindowsOutlined />}
                    onClick={() => handleOAuth2Login('microsoft')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: '#d9d9d9',
                      borderRadius: '8px',
                      height: '40px',
                      fontSize: '14px'
                    }}
                  >
                    使用Microsoft登录
                  </Button>
                </Space>
              )}
            </Space>

            {/* 测试账号提示 */}
            <div style={{
              backgroundColor: token.colorInfoBg,
              border: `1px solid ${token.colorInfoBorder}`,
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              fontSize: '12px',
              color: token.colorTextSecondary
            }}>
              <div style={{ fontWeight: '500', marginBottom: '6px', color: token.colorInfo }}>
                🔑 测试账号
              </div>
              <div style={{ lineHeight: '1.4' }}>
                <div><strong>管理员:</strong> admin / admin123</div>
                <div><strong>普通用户:</strong> user / user123</div>
                <div><strong>演示账号:</strong> demo / demo123</div>
                <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.8 }}>
                  支持用户名或邮箱登录 (如: admin@nspass.com)
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', opacity: 0.8, borderTop: `1px solid ${token.colorBorder}`, paddingTop: '6px' }}>
                  <strong>🛡️ Passkey登录:</strong> 支持指纹、Face ID、PIN码等生物识别或设备认证
                </div>
              </div>
            </div>

            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              padding: '16px 0 8px',
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              color: token.colorTextSecondary,
              fontSize: '13px'
            }}>
              还没有账号？ 
              <a 
                href="/register" 
                style={{ 
                  color: token.colorPrimary,
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                立即注册
              </a>
            </div>
          </LoginForm>
        </div>
      </div>
    </ProConfigProvider>
  );
};

LoginPage.displayName = 'LoginPage';

export default LoginPage;