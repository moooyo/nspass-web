import React from 'react';
import { Layout, Button, Card, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const SimpleMainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('SimpleMainLayout rendering...', location.pathname);
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#001529', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          NSPass Dashboard
        </Title>
        <Button 
          type="text" 
          style={{ color: 'white' }}
          icon={<LogoutOutlined />}
          onClick={() => navigate('/login')}
        >
          退出登录
        </Button>
      </Header>
      
      <Content style={{ padding: '20px' }}>
        <Card>
          <Title level={2}>欢迎使用 NSPass</Title>
          <Text>这是一个简化的主页面 - Vite 版本</Text>
          <br />
          <br />
          <p><strong>当前路径:</strong> {location.pathname}</p>
          <p><strong>时间:</strong> {new Date().toLocaleString()}</p>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button 
              type="primary" 
              icon={<HomeOutlined />}
              onClick={() => navigate('/dashboard')}
            >
              仪表板
            </Button>
            <Button 
              icon={<UserOutlined />}
              onClick={() => navigate('/profile')}
            >
              用户信息
            </Button>
            <Button 
              onClick={() => navigate('/settings')}
            >
              设置
            </Button>
            <Button 
              onClick={() => navigate('/login')}
            >
              返回登录
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default SimpleMainLayout;
