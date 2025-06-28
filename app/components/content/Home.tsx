import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Progress, Avatar, List, Timeline, Badge } from 'antd';
import { 
  UserOutlined, 
  GlobalOutlined, 
  CloudServerOutlined, 
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  SafetyOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useTheme } from '../hooks/useTheme';

const { Title, Text, Paragraph } = Typography;

const HomeContent: React.FC = () => {
  const { theme: currentTheme } = useTheme();
  
  // 模拟数据
  const stats = [
    {
      title: '在线用户',
      value: 1284,
      prefix: <UserOutlined style={{ color: '#52c41a' }} />,
      suffix: '人',
      precision: 0,
      trend: { value: 12.8, isUp: true },
      gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
    },
    {
      title: '活跃规则',
      value: 89,
      prefix: <GlobalOutlined style={{ color: '#1890ff' }} />,
      suffix: '条',
      precision: 0,
      trend: { value: 3.2, isUp: true },
      gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
    },
    {
      title: '服务器状态',
      value: 98.9,
      prefix: <CloudServerOutlined style={{ color: '#722ed1' }} />,
      suffix: '%',
      precision: 1,
      trend: { value: 0.5, isUp: true },
      gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)'
    },
    {
      title: '流量使用',
      value: 756.2,
      prefix: <LineChartOutlined style={{ color: '#fa8c16' }} />,
      suffix: 'GB',
      precision: 1,
      trend: { value: 8.7, isUp: false },
      gradient: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)'
    }
  ];

  const recentActivities = [
    { user: '张三', action: '创建了新的转发规则', time: '2分钟前', type: 'success' },
    { user: '李四', action: '更新了服务器配置', time: '15分钟前', type: 'info' },
    { user: '王五', action: '删除了过期规则', time: '1小时前', type: 'warning' },
    { user: '赵六', action: '登录系统', time: '2小时前', type: 'default' }
  ];

  const systemStatus = [
    { name: 'API服务', status: 'online', uptime: '99.9%' },
    { name: '数据库', status: 'online', uptime: '99.8%' },
    { name: '缓存服务', status: 'warning', uptime: '98.5%' },
    { name: '监控系统', status: 'online', uptime: '99.7%' }
  ];

  const quickActions = [
    { title: '创建规则', icon: <FireOutlined />, description: '快速创建新的转发规则' },
    { title: '用户管理', icon: <SafetyOutlined />, description: '管理系统用户和权限' },
    { title: '性能监控', icon: <ThunderboltOutlined />, description: '查看系统性能指标' },
    { title: '安全设置', icon: <SafetyOutlined />, description: '配置安全策略' }
  ];

  return (
    <div className="fade-in-up" style={{ padding: '0' }}>
      {/* 欢迎区域 */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          欢迎回到 NSPass 管理中心
        </Title>
        <Paragraph style={{ 
          fontSize: 16, 
          color: currentTheme === 'light' ? '#666' : '#ccc', 
          marginTop: 8 
        }}>
          实时监控您的网络状态，管理转发规则和用户权限
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className="stat-card hover-lift"
              style={{ 
                height: '140px',
                background: currentTheme === 'light' 
                  ? `linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`
                  : `linear-gradient(145deg, rgba(31, 31, 31, 0.9) 0%, rgba(20, 20, 20, 0.9) 100%)`,
                backdropFilter: 'blur(20px)',
                border: currentTheme === 'light' 
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: stat.gradient }}></div>
              <Statistic
                title={
                  <Text style={{ 
                    color: currentTheme === 'light' ? '#666' : '#ccc', 
                    fontSize: 14, 
                    fontWeight: 500 
                  }}>
                    {stat.title}
                  </Text>
                }
                value={stat.value}
                precision={stat.precision}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ 
                  color: currentTheme === 'light' ? '#333' : '#fff', 
                  fontSize: 28, 
                  fontWeight: 'bold',
                  lineHeight: 1.2
                }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                {stat.trend.isUp ? (
                  <RiseOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                ) : (
                  <FallOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                )}
                <Text style={{ 
                  color: stat.trend.isUp ? '#52c41a' : '#ff4d4f', 
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {stat.trend.value}%
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 主要内容区域 */}
      <Row gutter={[24, 24]}>
        {/* 快速操作 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Title level={4} style={{ 
                margin: 0, 
                color: currentTheme === 'light' ? '#333' : '#fff' 
              }}>
                <FireOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                快速操作
              </Title>
            }
            className="modern-card"
          >
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col span={12} key={index}>
                  <Card 
                    size="small"
                    className="hover-lift"
                    style={{
                      background: currentTheme === 'light' 
                        ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)'
                        : 'linear-gradient(145deg, rgba(42, 42, 42, 0.8) 0%, rgba(31, 31, 31, 0.6) 100%)',
                      border: currentTheme === 'light'
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                                         <div style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }}>
                       {action.icon}
                     </div>
                    <Title level={5} style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: 14,
                      color: currentTheme === 'light' ? '#333' : '#fff'
                    }}>
                      {action.title}
                    </Title>
                    <Text style={{ 
                      fontSize: 12, 
                      color: currentTheme === 'light' ? '#666' : '#ccc' 
                    }}>
                      {action.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 系统状态 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Title level={4} style={{ 
                margin: 0, 
                color: currentTheme === 'light' ? '#333' : '#fff' 
              }}>
                <CloudServerOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                系统状态
              </Title>
            }
            className="modern-card"
          >
            <List
              dataSource={systemStatus}
              renderItem={(item) => (
                <List.Item style={{ border: 'none', padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={item.status === 'online' ? 'success' : item.status === 'warning' ? 'warning' : 'error'} 
                        dot 
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ 
                          fontSize: 14,
                          color: currentTheme === 'light' ? '#333' : '#fff'
                        }}>{item.name}</Text>
                        <Text style={{ 
                          fontSize: 12, 
                          color: currentTheme === 'light' ? '#666' : '#ccc' 
                        }}>{item.uptime}</Text>
                      </div>
                    }
                    description={
                      <Progress 
                        percent={parseFloat(item.uptime)} 
                        size="small" 
                        showInfo={false}
                        strokeColor={item.status === 'online' ? '#52c41a' : '#fa8c16'}
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24}>
          <Card 
            title={
              <Title level={4} style={{ 
                margin: 0, 
                color: currentTheme === 'light' ? '#333' : '#fff' 
              }}>
                <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                最近活动
              </Title>
            }
            className="modern-card"
          >
            <Timeline
              items={recentActivities.map((activity, index) => ({
                dot: activity.type === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                     activity.type === 'warning' ? <ExclamationCircleOutlined style={{ color: '#fa8c16' }} /> :
                     <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                children: (
                  <div>
                    <Space direction="vertical" size={0}>
                      <Text strong style={{ 
                        color: currentTheme === 'light' ? '#333' : '#fff' 
                      }}>{activity.user}</Text>
                      <Text style={{ 
                        color: currentTheme === 'light' ? '#666' : '#ccc' 
                      }}>{activity.action}</Text>
                      <Text type="secondary" style={{ 
                        fontSize: 12,
                        color: currentTheme === 'light' ? '#999' : '#888'
                      }}>{activity.time}</Text>
                    </Space>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomeContent; 