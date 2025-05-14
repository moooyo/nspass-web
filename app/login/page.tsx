'use client';
import {
    LockOutlined,
    UserOutlined,
  } from '@ant-design/icons';
  import {
    LoginForm,
    ProConfigProvider,
    ProFormCheckbox,
    ProFormText,
    setAlpha,
  } from '@ant-design/pro-components';
  import { useRouter } from 'next/navigation';

  import { Space, Tabs, message, theme, Button } from 'antd';
  import type { CSSProperties } from 'react';
  import { useState } from 'react';
  
  export default () => {
    const { token } = theme.useToken();
    const router = useRouter();
  
    const iconStyles: CSSProperties = {
      marginInlineStart: '16px',
      color: setAlpha(token.colorTextBase, 0.2),
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
    };
  
    return (
      <ProConfigProvider hashed={false}>
        <div style={{ backgroundColor: token.colorBgContainer }}>
          <LoginForm
            logo="https://github.githubassets.com/favicons/favicon.png"
            title="Github"
            subTitle="全球最大的代码托管平台"
              >
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={'prefixIcon'} />,
              }}
              placeholder={'用户名: admin or user'}
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
                strengthText:
                  'Password should contain numbers, letters and special characters, at least 8 characters long.',
                statusRender: (value) => {
                  const getStatus = () => {
                    if (value && value.length > 12) {
                      return 'ok';
                    }
                    if (value && value.length > 6) {
                      return 'pass';
                    }
                    return 'poor';
                  };
                  const status = getStatus();
                  if (status === 'pass') {
                    return (
                      <div style={{ color: token.colorWarning }}>
                        强度：中
                      </div>
                    );
                  }
                  if (status === 'ok') {
                    return (
                      <div style={{ color: token.colorSuccess }}>
                        强度：强
                      </div>
                    );
                  }
                  return (
                    <div style={{ color: token.colorError }}>强度：弱</div>
                  );
                },
              }}
              placeholder={'密码: ant.design'}
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
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
              >
                忘记密码
              </a>
            </div>
          </LoginForm>
        </div>
      </ProConfigProvider>
    );
  };