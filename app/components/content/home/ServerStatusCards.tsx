import React from 'react';
import { Card, Row, Col, Typography, Badge, Tag, Progress, Spin } from 'antd';
import { CloudServerOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import { ServerStatus } from '@/types/generated/api/servers/server_management';

const { Title, Text } = Typography;

interface ServerStatusData {
  id: string;
  name: string;
  country?: string;
  status?: ServerStatus;
  uptime?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  uploadSpeed?: number;
  downloadSpeed?: number;
  osVersion?: string;
  tags?: string[];
  uploadTraffic?: number;
  downloadTraffic?: number;
}

interface ServerStatusCardsProps {
  servers: ServerStatusData[];
  loading: boolean;
  refreshing: boolean;
  getCountryFlag: (country?: string) => string;
}

const ServerStatusCards: React.FC<ServerStatusCardsProps> = ({ 
  servers, 
  loading, 
  refreshing, 
  getCountryFlag 
}) => {
  const { theme: currentTheme } = useTheme();

  if (loading || refreshing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '300px' 
      }}>
        <Spin />
      </div>
    );
  }

  if (servers.length === 0) {
    return (
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
    );
  }

  return (
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

            {/* 资源监控面板 */}
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
                    color: (server.cpuUsage || 0) > 80 ? '#ff4d4f' : '#52c41a',
                    marginBottom: 2
                  }}>
                    {server.cpuUsage}%
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>CPU</Text>
                  <Progress 
                    percent={server.cpuUsage} 
                    size="small" 
                    showInfo={false}
                    strokeColor={(server.cpuUsage || 0) > 80 ? '#ff4d4f' : '#52c41a'}
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
                    color: (server.memoryUsage || 0) > 80 ? '#ff4d4f' : '#1890ff',
                    marginBottom: 2
                  }}>
                    {server.memoryUsage}%
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>内存</Text>
                  <Progress 
                    percent={server.memoryUsage} 
                    size="small" 
                    showInfo={false}
                    strokeColor={(server.memoryUsage || 0) > 80 ? '#ff4d4f' : '#1890ff'}
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
                    color: (server.diskUsage || 0) > 80 ? '#ff4d4f' : '#fa8c16',
                    marginBottom: 2
                  }}>
                    {server.diskUsage}%
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>存储</Text>
                  <Progress 
                    percent={server.diskUsage} 
                    size="small" 
                    showInfo={false}
                    strokeColor={(server.diskUsage || 0) > 80 ? '#ff4d4f' : '#fa8c16'}
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

            {/* 流量统计 */}
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
  );
};

export default React.memo(ServerStatusCards); 