'use client';

import { Card, Typography, Tag, Divider, Space } from 'antd';
import { UserOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { mockLoginUsers } from '@/mocks/data/users';

const { Text } = Typography;

interface TestAccountsCardProps {
  style?: React.CSSProperties;
}

export const TestAccountsCard: React.FC<TestAccountsCardProps> = ({ style }) => {
  return (
    <Card
      title={
        <Space>
          <KeyOutlined />
          <span>可用测试账号</span>
        </Space>
      }
      size="small"
      style={{ ...style }}
    >
      {mockLoginUsers.map((user, index) => (
        <div key={user.id}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>{user.name}</Text>
              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                {user.role === 'admin' ? '管理员' : '用户'}
              </Tag>
            </div>
            
            <Space size="large">
              <Space size="small">
                <UserOutlined style={{ color: '#666' }} />
                <Text code copyable={{ text: user.username }}>
                  {user.username}
                </Text>
              </Space>
              
              <Space size="small">
                <MailOutlined style={{ color: '#666' }} />
                <Text code copyable={{ text: user.email }}>
                  {user.email}
                </Text>
              </Space>
            </Space>
            
            <div>
              <Text type="secondary">密码: </Text>
              <Text code copyable={{ text: user.password }}>
                {user.password}
              </Text>
            </div>
          </Space>
          
          {index < mockLoginUsers.length - 1 && (
            <Divider style={{ margin: '12px 0' }} />
          )}
        </div>
      ))}
      
      <Divider style={{ margin: '12px 0' }} />
      
      <div style={{ 
        background: '#f6ffed', 
        border: '1px solid #b7eb8f',
        borderRadius: '6px',
        padding: '8px',
        fontSize: '12px'
      }}>
        <Text type="success">
          💡 提示: 您可以使用用户名或邮箱登录，支持复制粘贴
        </Text>
      </div>
    </Card>
  );
};

export default TestAccountsCard; 