import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Progress, Avatar, List, Timeline, Badge, Spin, Alert, Button } from 'antd';
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
  ThunderboltOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useTheme } from '../hooks/useTheme';
import { dashboardService } from '@/services/dashboard';
import type { 
  SystemOverview, 
  SystemHealth, 
  SystemAlert,
  SystemPerformance
} from '@/services/dashboard';
import { AlertType } from '@/types/generated/api/dashboard/dashboard_service';
import { message } from '@/utils/message';
import { ComponentStatus } from '@/types/generated/api/dashboard/dashboard_service';

const { Title, Text, Paragraph } = Typography;

const HomeContent: React.FC = () => {
  const { theme: currentTheme } = useTheme();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 数据状态
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [systemPerformance, setSystemPerformance] = useState<SystemPerformance | null>(null);

  // 加载首页数据
  const loadHomeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // 并发请求所有数据
      const [overviewRes, healthRes, alertsRes, performanceRes] = await Promise.all([
        dashboardService.getSystemOverview(),
        dashboardService.getSystemHealth(),
        dashboardService.getSystemAlerts(),
        dashboardService.getSystemPerformance()
      ]);

      // 检查响应状态并设置数据
      if (overviewRes.success) {
        setSystemOverview(overviewRes.data || null);
        console.log('首页 - 系统概览数据:', overviewRes.data);
      }
      if (healthRes.success) {
        setSystemHealth(healthRes.data || null);
        console.log('首页 - 系统健康数据:', healthRes.data);
      }
      if (alertsRes.success) {
        setSystemAlerts(alertsRes.data || []);
        console.log('首页 - 系统警报数据:', alertsRes.data);
      }
      if (performanceRes.success) {
        setSystemPerformance(performanceRes.data || null);
        console.log('首页 - 系统性能数据:', performanceRes.data);
      }

      // 如果所有请求都失败，设置错误
      if (!overviewRes.success && !healthRes.success && !alertsRes.success && !performanceRes.success) {
        throw new Error('所有数据加载失败');
      }

      if (isRefresh) {
        message.success('首页数据刷新成功');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载数据失败';
      setError(errorMessage);
      console.error('Home data loading error:', err);
      
      if (isRefresh) {
        message.error('刷新失败: ' + errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    loadHomeData(true);
  }, [loadHomeData]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // 根据API数据生成统计卡片数据
  const stats = [
    {
      title: '在线用户',
      value: systemOverview?.userCount || 0,
      prefix: <UserOutlined style={{ color: '#52c41a' }} />,
      suffix: '人',
      precision: 0,
      trend: { value: 12.8, isUp: true }, // 暂时使用固定值，后续可以通过历史数据计算
      gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
    },
    {
      title: '活跃规则',
      value: systemOverview?.ruleCount || 0,
      prefix: <GlobalOutlined style={{ color: '#1890ff' }} />,
      suffix: '条',
      precision: 0,
      trend: { value: 3.2, isUp: true },
      gradient: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
    },
    {
      title: '服务器状态',
      value: systemOverview?.serverCount || 0,
      prefix: <CloudServerOutlined style={{ color: '#722ed1' }} />,
      suffix: '台',
      precision: 0,
      trend: { value: 0.5, isUp: true },
      gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)'
    },
    {
      title: '流量使用',
      value: systemOverview?.monthlyTraffic || 0,
      prefix: <LineChartOutlined style={{ color: '#fa8c16' }} />,
      suffix: 'GB',
      precision: 1,
      trend: { value: 8.7, isUp: false },
      gradient: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)'
    }
  ];

  // 根据系统警报生成最近活动数据
  const recentActivities = systemAlerts.slice(0, 4).map((alert, index) => ({
    user: '系统',
    action: alert.message || '未知活动',
    time: alert.timestamp ? new Date(alert.timestamp).toLocaleString('zh-CN') : '未知时间',
    type: alert.type === AlertType.ALERT_TYPE_ERROR ? 'error' : 
          alert.type === AlertType.ALERT_TYPE_WARNING ? 'warning' : 
          alert.type === AlertType.ALERT_TYPE_INFO ? 'info' : 'default'
  }));

  // 根据系统健康状态生成服务状态数据
  const systemStatus = systemHealth?.components?.map(component => ({
    name: component.name || '未知服务',
    status: component.status === ComponentStatus.COMPONENT_STATUS_UP ? 'online' : 
            component.status === ComponentStatus.COMPONENT_STATUS_DEGRADED ? 'warning' : 'offline',
    uptime: '99.9%', // 暂时使用固定值，后续可以从性能数据中获取
    message: component.message
  })) || [];

  const quickActions = [
    { title: '创建规则', icon: <FireOutlined />, description: '快速创建新的转发规则' },
    { title: '用户管理', icon: <SafetyOutlined />, description: '管理系统用户和权限' },
    { title: '性能监控', icon: <ThunderboltOutlined />, description: '查看系统性能指标' },
    { title: '安全设置', icon: <SafetyOutlined />, description: '配置安全策略' }
  ];

  // 如果正在加载且没有数据，显示加载状态
  if (loading && !systemOverview) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Typography.Text type="secondary">正在加载首页数据...</Typography.Text>
      </div>
    );
  }

  return (
    <div className="fade-in-up" style={{ padding: '0' }}>
      {/* 欢迎区域 */}
      <div style={{ 
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
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
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          刷新数据
        </Button>
      </div>

      {/* 如果有错误，显示警告 */}
      {error && (
        <Alert
          message="部分数据加载失败"
          description={error}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
          action={
            <Button 
              size="small" 
              onClick={() => loadHomeData()}
              loading={loading}
            >
              重试
            </Button>
          }
        />
      )}

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
              styles={{ body: { padding: '20px' } }}
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
                loading={loading || refreshing}
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
                    styles={{ body: { padding: '16px' } }}
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
            {loading || refreshing ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
              }}>
                <Spin />
              </div>
            ) : (
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
            )}
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
            {loading || refreshing ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
              }}>
                <Spin />
              </div>
            ) : recentActivities.length > 0 ? (
              <Timeline
                items={recentActivities.map((activity, index) => ({
                  dot: activity.type === 'error' ? <WarningOutlined style={{ color: '#ff4d4f' }} /> :
                       activity.type === 'warning' ? <ExclamationCircleOutlined style={{ color: '#fa8c16' }} /> :
                       activity.type === 'info' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
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
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                color: '#999'
              }}>
                暂无最近活动
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomeContent; 