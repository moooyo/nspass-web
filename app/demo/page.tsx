'use client';

import { Card, Row, Col, Typography, Button, Space } from 'antd';
import { LoginOutlined, GithubOutlined } from '@ant-design/icons';
import TestAccountsCard from '@/components/TestAccountsCard';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function DemoPage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={1} style={{ color: '#1890ff', marginBottom: '16px' }}>
              🔐 NSPass 登录演示
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              欢迎体验 NSPass 登录系统！我们为您准备了完整的测试账号和 OAuth2 登录功能。
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <TestAccountsCard />
            </Col>
            
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <LoginOutlined />
                    <span>功能特色</span>
                  </Space>
                }
                size="small"
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={5}>🔑 多种登录方式</Title>
                    <Paragraph>
                      • 账号密码登录<br/>
                      • 邮箱登录<br/>
                      • GitHub OAuth2 登录<br/>
                      • Google OAuth2 登录<br/>
                      • Microsoft OAuth2 登录
                    </Paragraph>
                  </div>

                  <div>
                    <Title level={5}>🎨 现代化UI设计</Title>
                    <Paragraph>
                      • 响应式布局设计<br/>
                      • 美观的渐变背景<br/>
                      • 毛玻璃效果<br/>
                      • 平滑的动画过渡
                    </Paragraph>
                  </div>

                  <div>
                    <Title level={5}>🔧 技术特色</Title>
                    <Paragraph>
                      • Next.js 15 + React 19<br/>
                      • Ant Design Pro Components<br/>
                      • 完整的 OAuth2 实现<br/>
                      • MSW Mock 数据<br/>
                      • TypeScript 类型安全
                    </Paragraph>
                  </div>

                  <div style={{ 
                    background: '#fff7e6', 
                    border: '1px solid #ffd591',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '16px'
                  }}>
                    <Title level={5} style={{ margin: 0, color: '#fa8c16' }}>
                      ⚠️ OAuth2 配置说明
                    </Title>
                    <Paragraph style={{ margin: '8px 0 0', fontSize: '13px' }}>
                      OAuth2 登录功能需要配置对应的 Client ID。<br/>
                      如未配置，点击时会显示配置提示。
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px',
            padding: '24px',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <Space size="large">
              <Link href="/login">
                <Button type="primary" size="large" icon={<LoginOutlined />}>
                  前往登录页面
                </Button>
              </Link>
              
              <Button 
                size="large" 
                icon={<GithubOutlined />}
                onClick={() => window.open('https://github.com', '_blank')}
              >
                查看源码
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
} 