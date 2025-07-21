import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';

const { Text } = Typography;

interface StatItem {
  title: string;
  value: number;
  prefix: React.ReactNode;
  suffix: string;
  precision: number;
  trend: { value: number; isUp: boolean };
  gradient: string;
}

interface StatisticCardsProps {
  stats: StatItem[];
  loading: boolean;
  refreshing: boolean;
}

const StatisticCards: React.FC<StatisticCardsProps> = ({ stats, loading, refreshing }) => {
  const { theme: currentTheme } = useTheme();

  return (
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
  );
};

export default React.memo(StatisticCards); 