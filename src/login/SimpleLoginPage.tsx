import React from 'react';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SimpleLoginPage = () => {
  const navigate = useNavigate();
  
  console.log('SimpleLoginPage rendering...');
  
  const handleLoginClick = () => {
    console.log('模拟登录按钮被点击');
    navigate('/dashboard');
  };
  
  const handleDashboardClick = () => {
    console.log('仪表板按钮被点击');
    navigate('/dashboard');
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Card 
        title={<Title level={2}>NSPass 登录</Title>}
        style={{ width: 400, textAlign: 'center' }}
      >
        <Text>简化版登录页面 - Vite 版本</Text>
        <br />
        <br />
        <Button 
          type="primary" 
          size="large"
          onClick={handleLoginClick}
          block
        >
          模拟登录
        </Button>
        <br />
        <br />
        <Button 
          onClick={handleDashboardClick}
          block
        >
          前往仪表板
        </Button>
      </Card>
    </div>
  );
};

export default SimpleLoginPage;
