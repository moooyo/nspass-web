'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, List, Alert, Space, Spin } from 'antd';
import { getServerIptablesConfig, type IptablesConfigInfo } from '@/services/iptables';

const IptablesTest: React.FC = () => {
  const [configs, setConfigs] = useState<IptablesConfigInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getServerIptablesConfig('1');
      if (response.success && response.data) {
        setConfigs(response.data);
        console.log('✅ API test successful:', response.data);
      } else {
        setError(response.message || 'API调用失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <Card title="Iptables API 测试" style={{ margin: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={testAPI} loading={loading}>
          重新测试 API
        </Button>
        
        {error && (
          <Alert 
            message="错误" 
            description={error} 
            type="error" 
            showIcon 
          />
        )}
        
        {loading && <Spin size="large" />}
        
        {configs.length > 0 && (
          <List
            header={<div>找到 {configs.length} 个 iptables 配置</div>}
            bordered
            dataSource={configs}
            renderItem={(config) => (
              <List.Item>
                <div>
                  <strong>{config.configName}</strong> - {config.tableName}/{config.chainName}
                  <br />
                  <small>动作: {config.ruleAction} | 协议: {config.protocol}</small>
                </div>
              </List.Item>
            )}
          />
        )}
      </Space>
    </Card>
  );
};

export default IptablesTest;
