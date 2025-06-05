import React from 'react';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Space, Typography, Progress } from 'antd';
import { Column } from '@ant-design/charts';

const { Title } = Typography;

// 模拟数据
const mockData = {
  userCount: 2547,
  serverCount: 128,
  ruleCount: 356,
  monthlyTraffic: 1024, // GB
  trafficTrend: Array.from({ length: 30 }, (_, i) => ({
    date: `2023-12-${i + 1}`,
    traffic: Math.floor(Math.random() * 50) + 10,
  })),
  trafficByUser: [
    { user: '张三', value: 38 },
    { user: '李四', value: 25 },
    { user: '王五', value: 15 },
    { user: '赵六', value: 12 },
    { user: '其他用户', value: 10 },
  ],
};

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Title level={2}>系统仪表盘</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 数据概览卡片 */}
        <ProCard gutter={16}>
          <StatisticCard
            statistic={{
              title: '总用户数',
              value: mockData.userCount,
              suffix: '人',
            }}
          />
          <StatisticCard
            statistic={{
              title: '总服务器数',
              value: mockData.serverCount,
              suffix: '台',
            }}
          />
          <StatisticCard
            statistic={{
              title: '总规则数',
              value: mockData.ruleCount,
              suffix: '条',
            }}
          />
          <StatisticCard
            statistic={{
              title: '当月流量消耗',
              value: mockData.monthlyTraffic,
              suffix: 'GB',
            }}
          />
        </ProCard>
        
        {/* 流量趋势和用户占比 */}
        <ProCard gutter={16} split="vertical">
          <ProCard title="最近30天流量消耗趋势" colSpan={16}>
            <Column
              data={mockData.trafficTrend}
              xField="date"
              yField="traffic"
              meta={{
                traffic: {
                  alias: '流量(GB)',
                },
                date: {
                  alias: '日期',
                },
              }}
            />
          </ProCard>
          
          <ProCard title="流量消耗占比">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {mockData.trafficByUser.map((item) => (
                <div key={item.user} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.user}</span>
                    <span>{item.value}%</span>
                  </div>
                  <Progress percent={item.value} showInfo={false} />
                </div>
              ))}
            </div>
          </ProCard>
        </ProCard>
      </Space>
    </div>
  );
};

export default Dashboard; 