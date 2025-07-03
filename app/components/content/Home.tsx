import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Progress, Avatar, List, Timeline, Badge, Spin, Alert, Button, Tag, Tooltip } from 'antd';
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
  ReloadOutlined,
  WarningOutlined,
  UploadOutlined,
  DownloadOutlined,
  HddOutlined,
  WifiOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { useTheme } from '../hooks/useTheme';
import { dashboardService } from '@/services/dashboard';
import { ServerService } from '@/services/servers';
import ProfessionalWorldMap, { type ExtendedServerItem } from './ProfessionalWorldMap';
import type { 
  SystemOverview, 
  SystemHealth, 
  SystemAlert,
  SystemPerformance
} from '@/services/dashboard';
import type { ServerItem } from '@/types/generated/api/servers/server_management';
import { AlertType } from '@/types/generated/api/dashboard/dashboard_service';
import { ServerStatus } from '@/types/generated/api/servers/server_management';
import { message } from '@/utils/message';

const { Title, Text, Paragraph } = Typography;

// 服务器扩展数据类型（包含监控信息）
interface ServerStatusData extends ServerItem {
  uptime?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  uploadSpeed?: number;
  downloadSpeed?: number;
  osVersion?: string;
  tags?: string[];
}

// 预警数据类型
interface ServiceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  serverName: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const HomeContent: React.FC = () => {
  const { theme: currentTheme } = useTheme();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 数据状态
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [servers, setServers] = useState<ServerStatusData[]>([]);
  const [serviceAlerts, setServiceAlerts] = useState<ServiceAlert[]>([]);

  // 获取国旗emoji
  const getCountryFlag = (country?: string): string => {
    const countryFlags: Record<string, string> = {
      'CN': '🇨🇳',
      'US': '🇺🇸', 
      'JP': '🇯🇵',
      'KR': '🇰🇷',
      'SG': '🇸🇬',
      'HK': '🇭🇰',
      'UK': '🇬🇧',
      'DE': '🇩🇪',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'FR': '🇫🇷',
      'AE': '🇦🇪'
    };
    return countryFlags[country || ''] || '🌍';
  };

  // 生成模拟的服务器监控数据
  const generateServerMonitoringData = (server: ServerItem): ServerStatusData => {
    return {
      ...server,
      uptime: Math.floor(Math.random() * 100) + '天',
      cpuUsage: Math.floor(Math.random() * 30) + 10, // 10-40%
      memoryUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
      diskUsage: Math.floor(Math.random() * 30) + 10, // 10-40%
      uploadSpeed: Math.random() * 10 + 0.1, // 0.1-10 K/s
      downloadSpeed: Math.random() * 20 + 0.5, // 0.5-20 K/s
      osVersion: 'Ubuntu',
      tags: ['300Mbps', '1024GB/月', 'IPv4', server.ipv6 ? 'IPv6' : '', 'MKCloud'].filter(Boolean)
    };
  };

  // 生成模拟的服务预警数据
  const generateServiceAlerts = (serverData: ServerStatusData[]): ServiceAlert[] => {
    const alertTemplates = [
      { type: 'error', message: '数据库连接失败' },
      { type: 'warning', message: 'CPU使用率过高' },
      { type: 'info', message: '系统更新完成' },
      { type: 'warning', message: '内存使用率达到80%' },
      { type: 'error', message: '磁盘空间不足' }
    ];

    return alertTemplates.slice(0, 4).map((template, index) => ({
      id: `alert-${index}`,
      type: template.type as 'error' | 'warning' | 'info',
      serverName: serverData[index]?.name || `服务器${index + 1}`,
      message: template.message,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
      resolved: Math.random() > 0.5
    }));
  };

  // 转换服务器数据为地图所需格式
  const convertToExtendedServers = (serverData: ServerStatusData[]): ExtendedServerItem[] => {
    return serverData.map(server => ({
      ...server,
      flag: getCountryFlag(server.country)
    }));
  };

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
      const [overviewRes, alertsRes, serversRes] = await Promise.all([
        dashboardService.getSystemOverview(),
        dashboardService.getSystemAlerts(),
        ServerService.getServers()
      ]);

      // 检查响应状态并设置数据
      if (overviewRes.success) {
        setSystemOverview(overviewRes.data || null);
        console.log('首页 - 系统概览数据:', overviewRes.data);
      }
      
      if (alertsRes.success) {
        setSystemAlerts(alertsRes.data || []);
        console.log('首页 - 系统警报数据:', alertsRes.data);
      }

      if (serversRes.success) {
        const serverData = (serversRes.data || []).map(generateServerMonitoringData);
        setServers(serverData);
        console.log('首页 - 服务器数据:', serverData);
        
        // 生成服务预警数据
        setServiceAlerts(generateServiceAlerts(serverData));
      }

      // 如果所有请求都失败，设置错误
      if (!overviewRes.success && !alertsRes.success && !serversRes.success) {
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
      trend: { value: 12.8, isUp: true },
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
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .server-card {
          animation: slideInUp 0.5s ease-out;
        }
        
        .alert-card {
          animation: slideInUp 0.5s ease-out;
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
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

              {/* 服务器分布地图 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <ProfessionalWorldMap servers={convertToExtendedServers(servers)} />
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Row gutter={[24, 24]}>
        {/* 服务器状态 */}
        <Col xs={24} xl={16}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={4} style={{ 
                  margin: 0, 
                  color: currentTheme === 'light' ? '#333' : '#fff',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <CloudServerOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  服务器状态
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {servers.filter(s => s.status === ServerStatus.SERVER_STATUS_ONLINE).length}/{servers.length} 在线
                </Text>
              </div>
            }
            className="modern-card"
            styles={{ body: { padding: '20px' } }}
          >
            {loading || refreshing ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px' 
              }}>
                <Spin />
              </div>
            ) : servers.length > 0 ? (
              <Row gutter={[16, 16]}>
                {servers.map((server, index) => (
                  <Col xs={24} lg={12} key={server.id}>
                    <div
                      className="server-card hover-lift"
                      style={{
                        padding: '16px',
                        background: currentTheme === 'light' 
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: currentTheme === 'light'
                          ? '1px solid #f0f0f0'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        boxShadow: currentTheme === 'light'
                          ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                          : '0 2px 8px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        height: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = currentTheme === 'light'
                          ? '0 8px 24px rgba(0, 0, 0, 0.12)'
                          : '0 8px 24px rgba(0, 0, 0, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = currentTheme === 'light'
                          ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                          : '0 2px 8px rgba(0, 0, 0, 0.15)';
                      }}
                    >
                      {/* 状态指示条 */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: server.status === ServerStatus.SERVER_STATUS_ONLINE
                          ? 'linear-gradient(90deg, #52c41a, #73d13d)'
                          : 'linear-gradient(90deg, #ff4d4f, #ff7875)'
                      }} />

                      {/* 服务器头部信息 */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 16
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '20px' }}>
                            {getCountryFlag(server.country)}
                          </span>
                          <div>
                            <Title level={5} style={{ 
                              margin: 0, 
                              fontSize: 16,
                              fontWeight: 600,
                              color: currentTheme === 'light' ? '#333' : '#fff'
                            }}>
                              {server.name}
                            </Title>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <Badge 
                                status={server.status === ServerStatus.SERVER_STATUS_ONLINE ? 'success' : 'error'} 
                                text={
                                  <Text style={{ 
                                    color: server.status === ServerStatus.SERVER_STATUS_ONLINE ? '#52c41a' : '#ff4d4f',
                                    fontWeight: 500,
                                    fontSize: 12
                                  }}>
                                    {server.status === ServerStatus.SERVER_STATUS_ONLINE ? '在线' : '离线'}
                                  </Text>
                                }
                              />
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {server.osVersion} • {server.uptime}
                              </Text>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {server.tags?.slice(0, 3).map(tag => (
                            <Tag 
                              key={tag} 
                              color="processing" 
                              style={{ 
                                fontSize: '10px',
                                border: 'none',
                                background: currentTheme === 'light' 
                                  ? 'rgba(24, 144, 255, 0.1)' 
                                  : 'rgba(24, 144, 255, 0.2)',
                                color: '#1890ff',
                                fontWeight: 500,
                                padding: '2px 6px'
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </div>

                      {/* 资源监控面板 - 紧凑版 */}
                      <Row gutter={[12, 12]}>
                        {/* CPU使用率 */}
                        <Col span={12}>
                          <div style={{
                            padding: '12px',
                            background: currentTheme === 'light' 
                              ? 'rgba(82, 196, 26, 0.05)' 
                              : 'rgba(82, 196, 26, 0.1)',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ 
                              fontSize: 20, 
                              fontWeight: 'bold',
                              color: server.cpuUsage! > 80 ? '#ff4d4f' : '#52c41a',
                              marginBottom: 2
                            }}>
                              {server.cpuUsage}%
                            </div>
                            <Text type="secondary" style={{ fontSize: 11 }}>CPU</Text>
                            <Progress 
                              percent={server.cpuUsage} 
                              size="small" 
                              showInfo={false}
                              strokeColor={server.cpuUsage! > 80 ? '#ff4d4f' : '#52c41a'}
                              trailColor={currentTheme === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                        </Col>

                        {/* 内存使用率 */}
                        <Col span={12}>
                          <div style={{
                            padding: '12px',
                            background: currentTheme === 'light' 
                              ? 'rgba(24, 144, 255, 0.05)' 
                              : 'rgba(24, 144, 255, 0.1)',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ 
                              fontSize: 20, 
                              fontWeight: 'bold',
                              color: server.memoryUsage! > 80 ? '#ff4d4f' : '#1890ff',
                              marginBottom: 2
                            }}>
                              {server.memoryUsage}%
                            </div>
                            <Text type="secondary" style={{ fontSize: 11 }}>内存</Text>
                            <Progress 
                              percent={server.memoryUsage} 
                              size="small" 
                              showInfo={false}
                              strokeColor={server.memoryUsage! > 80 ? '#ff4d4f' : '#1890ff'}
                              trailColor={currentTheme === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                        </Col>

                        {/* 存储使用率 */}
                        <Col span={12}>
                          <div style={{
                            padding: '12px',
                            background: currentTheme === 'light' 
                              ? 'rgba(250, 140, 22, 0.05)' 
                              : 'rgba(250, 140, 22, 0.1)',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ 
                              fontSize: 20, 
                              fontWeight: 'bold',
                              color: server.diskUsage! > 80 ? '#ff4d4f' : '#fa8c16',
                              marginBottom: 2
                            }}>
                              {server.diskUsage}%
                            </div>
                            <Text type="secondary" style={{ fontSize: 11 }}>存储</Text>
                            <Progress 
                              percent={server.diskUsage} 
                              size="small" 
                              showInfo={false}
                              strokeColor={server.diskUsage! > 80 ? '#ff4d4f' : '#fa8c16'}
                              trailColor={currentTheme === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                        </Col>

                        {/* 网络速度 */}
                        <Col span={12}>
                          <div style={{
                            padding: '12px',
                            background: currentTheme === 'light' 
                              ? 'rgba(114, 46, 209, 0.05)' 
                              : 'rgba(114, 46, 209, 0.1)',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#52c41a' }}>
                                  ↑ {server.uploadSpeed?.toFixed(1)}K/s
                                </div>
                                <Text type="secondary" style={{ fontSize: 10 }}>上传</Text>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1890ff' }}>
                                  ↓ {server.downloadSpeed?.toFixed(1)}K/s
                                </div>
                                <Text type="secondary" style={{ fontSize: 10 }}>下载</Text>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      {/* 流量统计 - 紧凑版 */}
                      <div style={{
                        marginTop: 16,
                        padding: '12px',
                        background: currentTheme === 'light' 
                          ? 'rgba(0, 0, 0, 0.02)' 
                          : 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a' }}>
                            {((server.uploadTraffic || 0) / 1024).toFixed(1)} GB
                          </div>
                          <Text type="secondary" style={{ fontSize: 10 }}>总上传</Text>
                        </div>
                        <div style={{ 
                          width: '1px', 
                          background: currentTheme === 'light' ? '#f0f0f0' : 'rgba(255, 255, 255, 0.1)' 
                        }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}>
                            {((server.downloadTraffic || 0) / 1024).toFixed(1)} GB
                          </div>
                          <Text type="secondary" style={{ fontSize: 10 }}>总下载</Text>
                        </div>
                        <div style={{ 
                          width: '1px', 
                          background: currentTheme === 'light' ? '#f0f0f0' : 'rgba(255, 255, 255, 0.1)' 
                        }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fa8c16' }}>
                            {(((server.uploadTraffic || 0) + (server.downloadTraffic || 0)) / 1024).toFixed(1)} GB
                          </div>
                          <Text type="secondary" style={{ fontSize: 10 }}>总流量</Text>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                color: '#999'
              }}>
                <CloudServerOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
                <Text type="secondary">暂无服务器数据</Text>
              </div>
            )}
          </Card>
        </Col>

                {/* 服务预警 */}
        <Col xs={24} xl={8}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={4} style={{ 
                  margin: 0, 
                  color: currentTheme === 'light' ? '#333' : '#fff',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <AlertOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                  服务预警
                </Title>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Badge 
                    count={serviceAlerts.filter(a => a.type === 'error' && !a.resolved).length} 
                    size="small" 
                    style={{ backgroundColor: '#ff4d4f' }}
                  />
                  <Badge 
                    count={serviceAlerts.filter(a => a.type === 'warning' && !a.resolved).length} 
                    size="small" 
                    style={{ backgroundColor: '#fa8c16' }}
                  />
                </div>
              </div>
            }
            className="modern-card"
            styles={{ body: { padding: '20px' } }}
          >
            {loading || refreshing ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px' 
              }}>
                <Spin />
              </div>
            ) : serviceAlerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {serviceAlerts.map((alert, index) => (
                                                        <div
                     key={alert.id}
                     className="alert-card hover-lift"
                     style={{
                       padding: '20px',
                       background: currentTheme === 'light' 
                         ? '#ffffff'
                         : 'rgba(255, 255, 255, 0.04)',
                       border: currentTheme === 'light'
                         ? '1px solid #f0f0f0'
                         : '1px solid rgba(255, 255, 255, 0.08)',
                       borderLeft: `4px solid ${
                         alert.type === 'error' ? '#ff4d4f' : 
                         alert.type === 'warning' ? '#fa8c16' : '#52c41a'
                       }`,
                       borderRadius: '12px',
                       boxShadow: currentTheme === 'light'
                         ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                         : '0 2px 8px rgba(0, 0, 0, 0.15)',
                       transition: 'all 0.3s ease',
                       cursor: 'pointer',
                       position: 'relative',
                       opacity: alert.resolved ? 0.6 : 1
                     }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = currentTheme === 'light'
                        ? '0 8px 20px rgba(0, 0, 0, 0.1)'
                        : '0 8px 20px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = currentTheme === 'light'
                        ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                        : '0 2px 8px rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    {/* 预警头部 */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      marginBottom: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {alert.type === 'error' ? (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 16
                          }}>
                            <WarningOutlined />
                          </div>
                        ) : alert.type === 'warning' ? (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fa8c16, #ffa940)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 16
                          }}>
                            <ExclamationCircleOutlined />
                          </div>
                        ) : (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 16
                          }}>
                            <CheckCircleOutlined />
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text strong style={{ 
                              fontSize: 16,
                              color: currentTheme === 'light' ? '#333' : '#fff'
                            }}>
                              {alert.serverName}
                            </Text>
                            {alert.resolved && (
                              <Tag 
                                color="success" 
                                style={{ 
                                  fontSize: '11px',
                                  border: 'none',
                                  background: 'rgba(82, 196, 26, 0.1)',
                                  color: '#52c41a',
                                  fontWeight: 500
                                }}
                              >
                                已解决
                              </Tag>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Tag 
                              color={
                                alert.type === 'error' ? 'error' : 
                                alert.type === 'warning' ? 'warning' : 'success'
                              }
                              style={{ 
                                fontSize: '11px',
                                fontWeight: 500,
                                border: 'none'
                              }}
                            >
                              {alert.type === 'error' ? '严重' : 
                               alert.type === 'warning' ? '警告' : '信息'}
                            </Tag>
                            <Text type="secondary" style={{ 
                              fontSize: 12,
                              color: currentTheme === 'light' ? '#999' : '#888'
                            }}>
                              {alert.timestamp}
                            </Text>
                          </div>
                        </div>
                      </div>
                      
                                             {!alert.resolved && (
                         <div 
                           className="pulse"
                           style={{
                             width: 8,
                             height: 8,
                             borderRadius: '50%',
                             background: alert.type === 'error' ? '#ff4d4f' : '#fa8c16'
                           }} 
                         />
                       )}
                    </div>

                    {/* 预警内容 */}
                    <div style={{
                      padding: '16px',
                      background: currentTheme === 'light' 
                        ? 'rgba(0, 0, 0, 0.02)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      marginTop: 12
                    }}>
                      <Text style={{ 
                        color: currentTheme === 'light' ? '#666' : '#ccc',
                        fontSize: 14,
                        lineHeight: 1.5
                      }}>
                        {alert.message}
                      </Text>
                    </div>

                    {/* 操作按钮（如果需要的话） */}
                    {!alert.resolved && (
                      <div style={{ 
                        marginTop: 16,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 8
                      }}>
                        <Button 
                          size="small" 
                          type="text"
                          style={{ 
                            fontSize: 12,
                            color: currentTheme === 'light' ? '#666' : '#ccc'
                          }}
                        >
                          查看详情
                        </Button>
                        <Button 
                          size="small" 
                          type="primary"
                          style={{ fontSize: 12 }}
                        >
                          标记已解决
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* 查看更多按钮 */}
                <div style={{ 
                  textAlign: 'center',
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: currentTheme === 'light' 
                    ? '1px solid #f0f0f0' 
                    : '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <Button type="link" style={{ fontSize: 13 }}>
                    查看全部预警 ({serviceAlerts.length})
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                color: '#999'
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: currentTheme === 'light' 
                    ? 'rgba(82, 196, 26, 0.1)' 
                    : 'rgba(82, 196, 26, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <CheckCircleOutlined style={{ 
                    fontSize: 32, 
                    color: '#52c41a',
                    opacity: 0.8
                  }} />
                </div>
                <Title level={5} style={{ 
                  color: currentTheme === 'light' ? '#52c41a' : '#73d13d',
                  margin: '0 0 8px 0'
                }}>
                  系统运行正常
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  暂无服务预警信息
                </Text>
              </div>
            )}
          </Card>
                </Col>
      </Row>
    </div>
  );
};

export default HomeContent; 