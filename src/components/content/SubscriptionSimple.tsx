import React, { useState, useEffect } from 'react';
import { Table, Button, message, Typography } from 'antd';
import subscriptionService from '@/services/subscription';

const { Title } = Typography;

const SubscriptionSimple: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    console.log('简化版订阅组件加载中...');
    
    const loadData = async () => {
      try {
        console.log('开始调用API...');
        const response = await subscriptionService.getSubscriptions();
        console.log('API响应:', response);
        
        if (response.success && response.data) {
          setData(response.data);
          message.success('数据加载成功');
        } else {
          message.error('加载失败');
        }
      } catch (error) {
        console.error('加载出错:', error);
        message.error('加载出错');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const columns = [
    {
      title: '订阅名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => active ? '启用' : '禁用'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>订阅管理（简化版）</Title>
      
      <div style={{ marginBottom: '16px' }}>
        <Button onClick={() => window.location.reload()}>
          刷新页面
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="subscriptionId"
        loading={loading}
        pagination={false}
      />

      <div style={{ marginTop: '16px', color: '#666' }}>
        <p>数据条数: {data.length}</p>
        <p>加载状态: {loading ? '加载中' : '完成'}</p>
      </div>
    </div>
  );
};

export default SubscriptionSimple; 