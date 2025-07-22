import { useState, useEffect } from 'react';
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  GithubOutlined,
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
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { useAuth } from '@/components/hooks/useAuth';
import { LoginType as ProtoLoginType } from '../../types/generated/api/users/user_auth';
import { MSWToggle } from '@/components/MSWProvider';

const { Text } = Typography;

type LoginType = 'account' | 'email';

const LoginPageFixed = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login: authLogin } = useAuth();
  const [loginType, setLoginType] = useState<LoginType>('account');

  // 如果已登录，重定向到主页
  useEffect(() => {
    console.log('LoginPageFixed - Auth状态检查:', { isLoading, isAuthenticated });
    if (!isLoading && isAuthenticated) {
      console.log('用户已登录，重定向到首页');
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // 登录验证
  const handleLogin = async (values: any) => {
    try {
      console.log('登录表单数据:', values);
      
      // 确定登录类型和标识符
      const isEmailLogin = loginType === 'email';
      const identifier = isEmailLogin ? values.email : values.username;
      console.log('here')

      // 调用登录API - 使用新的proto结构
      const response = await authService.login({
        loginType: isEmailLogin ? ProtoLoginType.LOGIN_TYPE_EMAIL : ProtoLoginType.LOGIN_TYPE_USERNAME,
        identifier,
        password: values.password
      });
      console.log('response:', response);

      if (response.status?.success && response.data) {
        console.log('auth response:', response.data);
        // 保存认证信息
        authService.saveAuthData(response.data);
        
        // 使用 useAuth hook 更新登录状态
        const user = {
          id: response.data.id?.toString() || 'unknown-id',
          name: response.data.name || 'Unknown User',
          email: response.data.email || '',
          role: response.data.role?.toString() || 'user',
          provider: 'local'
        };
        console.log('user:', user);
        authLogin(user, loginType);
        
        message.success(response.status?.message || '登录成功！');
        console.log('登录成功，准备跳转到首页');
        navigate('/');
      } else {
        message.error(response.status?.message || '登录失败');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请重试';
      message.error(errorMessage);
      console.error('登录错误:', error);
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
        position: 'relative',
        padding: '20px 0'
      }}>
        {/* MSW开关 - 开发环境显示 */}
        {import.meta.env.DEV && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <MSWToggle />
          </div>
        )}
        
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
              {/* 简化的GitHub登录按钮 */}
              <Button
                size="large"
                icon={<GithubOutlined />}
                onClick={() => message.info('OAuth功能开发中')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: '#d9d9d9',
                  borderRadius: '8px',
                  height: '44px',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                使用GitHub登录
              </Button>
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

LoginPageFixed.displayName = 'LoginPageFixed';

export default LoginPageFixed;
