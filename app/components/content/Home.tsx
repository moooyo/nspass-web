import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Avatar, Badge } from 'antd';
import { 
  UserOutlined, 
  GlobalOutlined, 
  CloudServerOutlined, 
  LineChartOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;

const HomeContent: React.FC = () => {
  const { theme: currentTheme } = useTheme();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 获取问候语
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  // 快速统计数据
  const quickStats = [
    {
      title: '在线用户',
      value: 168,
      icon: <UserOutlined />,
      color: '#52c41a',
      suffix: '人'
    },
    {
      title: '活跃规则',
      value: 24,
      icon: <GlobalOutlined />,
      color: '#1890ff',
      suffix: '条'
    },
    {
      title: '服务器',
      value: 8,
      icon: <CloudServerOutlined />,
      color: '#722ed1',
      suffix: '台'
    },
    {
      title: '今日流量',
      value: 1.2,
      icon: <LineChartOutlined />,
      color: '#fa8c16',
      suffix: 'TB'
    }
  ];

  // 快速操作
  const quickActions = [
    {
      title: '添加规则',
      description: '创建新的转发规则',
      icon: <RocketOutlined />,
      color: '#1890ff',
      action: () => window.location.hash = 'rules'
    },
    {
      title: '服务器管理',
      description: '管理和监控服务器',
      icon: <CloudServerOutlined />,
      color: '#722ed1',
      action: () => window.location.hash = 'servers'
    },
    {
      title: '用户管理',
      description: '管理用户权限',
      icon: <UserOutlined />,
      color: '#52c41a',
      action: () => window.location.hash = 'users'
    },
    {
      title: '系统设置',
      description: '配置系统参数',
      icon: <SafetyCertificateOutlined />,
      color: '#fa8c16',
      action: () => window.location.hash = 'website'
    }
  ];

  return (
    <div className="fade-in-up" style={{ 
      minHeight: '100%',
      background: currentTheme === 'light' 
        ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      margin: '-24px',
      padding: '32px'
    }}>
      {/* 欢迎区域 */}
      <div className="home-welcome-card" style={{ 
        marginBottom: 32,
        textAlign: 'center',
        padding: '40px 0'
      }}>
        <div style={{ marginBottom: 24 }}>
          <Avatar 
            size={80} 
            src={user?.avatar}
            style={{ 
              backgroundColor: '#1890ff',
              fontSize: '32px',
              boxShadow: '0 8px 32px rgba(24, 144, 255, 0.3)'
            }}
          >
            {user?.name?.[0] || 'U'}
          </Avatar>
        </div>
        <Title 
          level={1} 
          style={{ 
            margin: 0, 
            background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontSize: '2.5rem'
          }}
        >
          {getGreeting()}，{user?.name || '用户'}
        </Title>
        <Paragraph style={{ 
          fontSize: 16, 
          color: currentTheme === 'light' ? '#666' : '#ccc', 
          marginTop: 16,
          maxWidth: '600px',
          margin: '16px auto 0'
        }}>
          欢迎使用 NSPass 管理中心，您的网络管理一站式解决方案
        </Paragraph>
        <div style={{ 
          marginTop: 16,
          fontSize: 14,
          color: currentTheme === 'light' ? '#999' : '#666'
        }}>
          {currentTime.toLocaleString('zh-CN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* 快速统计 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {quickStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className="home-stat-card"
              hoverable
              style={{ 
                height: '120px'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold',
                    color: stat.color,
                    marginBottom: 4
                  }}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div style={{ 
                    fontSize: 14, 
                    color: currentTheme === 'light' ? '#666' : '#ccc'
                  }}>
                    {stat.title}
                  </div>
                </div>
                <div style={{ 
                  fontSize: 32,
                  color: stat.color,
                  opacity: 0.8
                }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速操作 */}
      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ 
          textAlign: 'center',
          marginBottom: 24,
          color: currentTheme === 'light' ? '#333' : '#fff'
        }}>
          快速操作
        </Title>
        <Row gutter={[24, 24]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                className="home-action-card"
                onClick={action.action}
                style={{ 
                  height: '140px'
                }}
                styles={{ body: { padding: '20px', height: '100%' } }}
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: 32,
                    color: action.color,
                    marginBottom: 12
                  }}>
                    {action.icon}
                  </div>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    color: currentTheme === 'light' ? '#333' : '#fff',
                    marginBottom: 4
                  }}>
                    {action.title}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: currentTheme === 'light' ? '#666' : '#ccc'
                  }}>
                    {action.description}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 状态指示器 */}
      <div className="home-status-indicator" style={{ 
        textAlign: 'center'
      }}>
        <Space size="large" wrap>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge status="success" />
            <span style={{ color: currentTheme === 'light' ? '#666' : '#ccc' }}>
              系统运行正常
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThunderboltOutlined style={{ color: '#52c41a' }} />
            <span style={{ color: currentTheme === 'light' ? '#666' : '#ccc' }}>
              网络连接稳定
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeartOutlined style={{ color: '#ff4d4f' }} />
            <span style={{ color: currentTheme === 'light' ? '#666' : '#ccc' }}>
              服务健康运行
            </span>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default HomeContent;