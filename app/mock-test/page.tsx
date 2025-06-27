'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, List, Typography, Divider } from 'antd';
import { message } from '@/utils/message';
import { httpClient } from '@/utils/http-client';
import { initMSW } from '../init-msw';

const { Title, Text } = Typography;

export default function MockTestPage() {
  const [userConfigData, setUserConfigData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mswStatus, setMswStatus] = useState<string>('未知');

  // 检查 MSW 状态
  useEffect(() => {
    const checkMswStatus = () => {
      if (typeof window !== 'undefined') {
        const mockEnabled = localStorage.getItem('nspass-mock-enabled');
        setMswStatus(mockEnabled === 'true' ? '已启用' : '已禁用');
      }
    };

    checkMswStatus();
    // 每秒检查一次状态
    const interval = setInterval(checkMswStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 测试 userConfig API
  const testUserConfigApi = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/users/settings');
      console.log('UserConfig API 响应:', response);
      setUserConfigData(response);
      if (response.success) {
        message.success('UserConfig API 调用成功');
      } else {
        message.error('UserConfig API 调用失败');
      }
    } catch (error) {
      console.error('UserConfig API 错误:', error);
      message.error('UserConfig API 调用出错');
    } finally {
      setLoading(false);
    }
  };

  // 测试 users API
  const testUsersApi = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/users');
      console.log('Users API 响应:', response);
      setUsersData(response);
      if (response.success) {
        message.success('Users API 调用成功');
      } else {
        message.error('Users API 调用失败');
      }
    } catch (error) {
      console.error('Users API 错误:', error);
      message.error('Users API 调用出错');
    } finally {
      setLoading(false);
    }
  };

  // 重新启动 MSW
  const restartMsw = async () => {
    if (typeof window !== 'undefined') {
      try {
        // 保存当前状态
        const currentState = localStorage.getItem('nspass-mock-enabled');
        
        // 关闭 MSW
        localStorage.setItem('nspass-mock-enabled', 'false');
        // 等待一秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 重新启用 MSW
        localStorage.setItem('nspass-mock-enabled', currentState || 'true');
        
        message.success('MSW 重启请求已发送，请等待几秒钟');
      } catch (error) {
        console.error('MSW 重启失败:', error);
        message.error('MSW 重启失败');
      }
    }
  };

  // 手动初始化 MSW
  const manualInitMsw = async () => {
    setLoading(true);
    try {
      // 确保启用 MSW
      localStorage.setItem('nspass-mock-enabled', 'true');
      
      // 初始化 MSW
      const result = await initMSW();
      
      if (result) {
        message.success('MSW 初始化成功');
      } else {
        message.error('MSW 初始化失败');
      }
    } catch (error) {
      console.error('MSW 初始化错误:', error);
      message.error('MSW 初始化出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>MSW 测试页面</Title>
      <Text>当前 MSW 状态: <Text strong>{mswStatus}</Text></Text>
      
      <Divider />
      
      <div style={{ marginBottom: '20px' }}>
        <Button 
          type="primary" 
          onClick={testUserConfigApi} 
          loading={loading}
          style={{ marginRight: '10px' }}
        >
          测试 UserConfig API
        </Button>
        
        <Button 
          type="primary" 
          onClick={testUsersApi} 
          loading={loading}
          style={{ marginRight: '10px' }}
        >
          测试 Users API
        </Button>
        
        <Button 
          onClick={restartMsw}
          loading={loading}
          style={{ marginRight: '10px' }}
          danger
        >
          重启 MSW
        </Button>
        
        <Button 
          onClick={manualInitMsw}
          loading={loading}
          type="primary"
          danger
        >
          手动初始化 MSW
        </Button>
      </div>
      
      {userConfigData && (
        <Card title="UserConfig API 响应" style={{ marginBottom: '20px' }}>
          <pre>{JSON.stringify(userConfigData, null, 2)}</pre>
        </Card>
      )}
      
      {usersData && (
        <Card title="Users API 响应">
          <pre>{JSON.stringify(usersData, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
} 