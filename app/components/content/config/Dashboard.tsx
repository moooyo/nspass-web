import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Space, Typography, Progress, Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { dashboardService } from '@/services/dashboard';
import type { 
  SystemOverview, 
  TrafficTrendItem, 
  UserTrafficItem 
} from '@/services/dashboard';
import { message } from '@/utils/message';

const { Title } = Typography;

// 动态导入图表组件
const DynamicColumn = React.lazy(() => 
  import('@ant-design/charts').then(module => ({ default: module.Column }))
);

const Dashboard: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 数据状态
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [trafficTrend, setTrafficTrend] = useState<TrafficTrendItem[]>([]);
  const [userTrafficStats, setUserTrafficStats] = useState<UserTrafficItem[]>([]);

  // 加载所有仪表盘数据
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // 并发请求所有数据
      const [overviewRes, trafficTrendRes, userTrafficRes] = await Promise.all([
        dashboardService.getSystemOverview(),
        dashboardService.getTrafficTrend({ days: 30 }),
        dashboardService.getUserTrafficStats({ limit: 5 })
      ]);

      // 检查响应状态
      if (!overviewRes.success) {
        throw new Error(overviewRes.message || '获取系统概览失败');
      }
      if (!trafficTrendRes.success) {
        throw new Error(trafficTrendRes.message || '获取流量趋势失败');
      }
      if (!userTrafficRes.success) {
        throw new Error(userTrafficRes.message || '获取用户流量统计失败');
      }

      // 更新状态
      setSystemOverview(overviewRes.data || null);
      setTrafficTrend(trafficTrendRes.data || []);
      setUserTrafficStats(userTrafficRes.data || []);

      if (isRefresh) {
        message.success('仪表盘数据刷新成功');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载数据失败';
      setError(errorMessage);
      console.error('Dashboard data loading error:', err);
      
      if (isRefresh) {
        message.error('刷新失败: ' + errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 刷新仪表盘数据
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const refreshRes = await dashboardService.refreshDashboard();
      
      if (refreshRes.success) {
        // 刷新成功后重新加载数据
        await loadDashboardData(true);
      } else {
        throw new Error(refreshRes.message || '刷新失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刷新失败';
      message.error(errorMessage);
      console.error('Dashboard refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardData]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 缓存图表配置，避免重复创建
  const chartConfig = useMemo(() => ({
    data: trafficTrend,
    xField: 'date',
    yField: 'traffic',
    meta: {
      traffic: {
        alias: '流量(GB)',
      },
      date: {
        alias: '日期',
      },
    },
    smooth: true,
    point: {
      size: 5,
    },
  }), [trafficTrend]);

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
        <Typography.Text type="secondary">正在加载仪表盘数据...</Typography.Text>
      </div>
    );
  }

  // 如果有错误且没有数据，显示错误状态
  if (error && !systemOverview) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button 
              type="primary" 
              onClick={() => loadDashboardData()}
              loading={loading}
            >
              重试
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={2} style={{ margin: 0 }}>系统仪表盘</Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          刷新数据
        </Button>
      </div>
      
      {/* 如果有错误但有数据，显示警告 */}
      {error && systemOverview && (
        <Alert
          message="部分数据加载失败"
          description={error}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 数据概览卡片 */}
        <ProCard gutter={16}>
          <StatisticCard
            statistic={{
              title: '总用户数',
              value: systemOverview?.userCount || 0,
              suffix: '人',
            }}
            loading={loading || refreshing}
          />
          <StatisticCard
            statistic={{
              title: '总服务器数',
              value: systemOverview?.serverCount || 0,
              suffix: '台',
            }}
            loading={loading || refreshing}
          />
          <StatisticCard
            statistic={{
              title: '总规则数',
              value: systemOverview?.ruleCount || 0,
              suffix: '条',
            }}
            loading={loading || refreshing}
          />
          <StatisticCard
            statistic={{
              title: '当月流量消耗',
              value: systemOverview?.monthlyTraffic || 0,
              suffix: 'GB',
              precision: 1,
            }}
            loading={loading || refreshing}
          />
        </ProCard>
        
        {/* 流量趋势和用户占比 */}
        <ProCard gutter={16} split="vertical">
          <ProCard title="最近30天流量消耗趋势" colSpan={16}>
            {loading || refreshing ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px' 
              }}>
                <Spin />
              </div>
            ) : trafficTrend.length > 0 ? (
              <React.Suspense fallback={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '300px' 
                }}>
                  <Spin tip="正在加载图表..." />
                </div>
              }>
                <DynamicColumn {...chartConfig} />
              </React.Suspense>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                color: '#999'
              }}>
                暂无流量趋势数据
              </div>
            )}
          </ProCard>
          
          <ProCard title="用户流量使用排行">
            {loading || refreshing ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
              }}>
                <Spin />
              </div>
            ) : userTrafficStats.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {userTrafficStats.map((item, index) => (
                  <div key={item.user || index} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{item.user}</span>
                      <span>{item.value?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress 
                      percent={item.value || 0} 
                      showInfo={false}
                      size="small"
                    />
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#999', 
                      marginTop: 2,
                      textAlign: 'right'
                    }}>
                      {item.traffic?.toFixed(1) || 0} GB
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px',
                color: '#999'
              }}>
                暂无用户流量数据
              </div>
            )}
          </ProCard>
        </ProCard>
      </Space>
    </div>
  );
};

export default React.memo(Dashboard); 