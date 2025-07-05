import React, { useEffect, useState, useCallback } from 'react';
import {
    ProForm,
    ProFormText,
  } from '@ant-design/pro-components';
  import { handleDataResponse } from '@/utils/message';
  import { Card, Row, Col, Avatar, Typography, Space, Tag, Divider, Progress, Statistic, Button } from 'antd';
  import { 
    UserOutlined, 
    CrownOutlined, 
    TeamOutlined, 
    CloudOutlined,
    CalendarOutlined,
    SettingOutlined,
    SafetyCertificateOutlined,
    LineChartOutlined,
    ReloadOutlined
  } from '@ant-design/icons';
  import { useTheme } from '../hooks/useTheme';
  import { userInfoService } from '@/services/userInfo';
  import type { UserInfo } from '@/services/userInfo';

  const { Title, Text } = Typography;

  const _waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

const UserInfo: React.FC = () => {
  const { theme: currentTheme } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [_hasLoadedData, setHasLoadedData] = useState<boolean>(false);
  
  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userInfoService.getCurrentUserInfo();
      
      if (response.success && response.data) {
        setUserInfo(response.data);
        setHasLoadedData(true);
        handleDataResponse.success('获取用户信息', response);
      } else {
        // 失败时清空数据，避免显示过期缓存
        setUserInfo(null);
        setHasLoadedData(false);
        handleDataResponse.error('获取用户信息', undefined, response);
      }
    } catch (error) {
      // 失败时清空数据，避免显示过期缓存
      setUserInfo(null);
      setHasLoadedData(false);
      handleDataResponse.error('获取用户信息', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  // 模拟用户数据
  const userStats = [
    { title: '规则数量', value: 12, icon: <SettingOutlined />, color: '#1890ff' },
    { title: '今日流量', value: 156, suffix: 'MB', icon: <CloudOutlined />, color: '#52c41a' },
    { title: '在线时长', value: 8.5, suffix: 'h', icon: <LineChartOutlined />, color: '#722ed1' },
    { title: '安全等级', value: 95, suffix: '%', icon: <SafetyCertificateOutlined />, color: '#fa8c16' }
  ];

  return (
    <div className="fade-in-up" style={{ padding: '0' }}>
      {/* 用户信息概览 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={8}>
          <Card 
            className="modern-card hover-lift"
            style={{ textAlign: 'center' }}
            styles={{ body: { padding: '32px 24px' } }}
            loading={loading}
          >
            <Avatar 
              size={120} 
              src={userInfo?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
              style={{ 
                marginBottom: 24,
                border: '4px solid #fff',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Title level={3} style={{ 
              margin: '0 0 8px 0', 
              color: currentTheme === 'light' ? '#333' : '#fff' 
            }}>
              {userInfo?.name || '用户名称'}
            </Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Tag 
                icon={<CrownOutlined />} 
                color="gold" 
                style={{ 
                  padding: '4px 12px', 
                  fontSize: 14,
                  borderRadius: 20,
                  border: 'none'
                }}
              >
                {userInfo?.role === 1 ? '管理员' : '普通用户'}
              </Tag>
              <Tag 
                icon={<TeamOutlined />} 
                color="blue"
                style={{ 
                  padding: '4px 12px', 
                  fontSize: 14,
                  borderRadius: 20,
                  border: 'none'
                }}
              >
                {userInfo?.userGroup?.[0] ? `用户组${userInfo.userGroup[0]}` : '高级用户组'}
              </Tag>
            </Space>
            
            <Divider />
            
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ 
                  fontSize: 12,
                  color: currentTheme === 'light' ? '#666' : '#ccc'
                }}>当月流量使用</Text>
                                 <Progress 
                   percent={65} 
                   strokeColor={{
                     '0%': '#1890ff',
                     '100%': '#69c0ff',
                   }}
                   style={{ marginTop: 4 }}
                 />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ 
                    fontSize: 12, 
                    color: currentTheme === 'light' ? '#666' : '#ccc' 
                  }}>650 MB</Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: currentTheme === 'light' ? '#666' : '#ccc' 
                  }}>{userInfo?.traffic || '1000'} MB</Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ 
                  color: currentTheme === 'light' ? '#666' : '#ccc' 
                }}>账户状态</Text>
                <Tag color="success" style={{ borderRadius: 12 }}>正常</Tag>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ 
                  color: currentTheme === 'light' ? '#666' : '#ccc' 
                }}>上次登录</Text>
                <Text style={{ 
                  fontSize: 12,
                  color: currentTheme === 'light' ? '#333' : '#fff'
                }}>{userInfo?.lastLoginTime ? new Date(userInfo.lastLoginTime).toLocaleString() : '2小时前'}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* 统计信息 */}
          <Card 
            title={
              <Title level={4} style={{ 
                margin: 0, 
                color: currentTheme === 'light' ? '#333' : '#fff' 
              }}>
                <LineChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                数据概览
              </Title>
            }
            className="modern-card"
            style={{ marginBottom: 24 }}
            loading={loading}
          >
            <Row gutter={[24, 16]}>
              {userStats.map((stat, index) => (
                <Col xs={12} lg={6} key={index}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ 
                      fontSize: 28, 
                      color: stat.color, 
                      marginBottom: 12,
                      background: `${stat.color}15`,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      {stat.icon}
                    </div>
                    <Statistic
                      value={stat.value}
                      suffix={stat.suffix}
                      valueStyle={{ 
                        fontSize: 24, 
                        fontWeight: 'bold',
                        color: currentTheme === 'light' ? '#333' : '#fff',
                        lineHeight: 1.2
                      }}
                    />
                    <Text style={{ 
                      fontSize: 14, 
                      color: currentTheme === 'light' ? '#666' : '#ccc', 
                      marginTop: 8, 
                      display: 'block',
                      fontWeight: 500
                    }}>
                      {stat.title}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 用户信息表单 */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ 
                  margin: 0, 
                  color: currentTheme === 'light' ? '#333' : '#fff' 
                }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  个人信息设置
                </Title>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadUserInfo}
                  loading={loading}
                  size="small"
                >
                  刷新
                </Button>
              </div>
            }
            className="modern-card"
            loading={loading}
          >
            <ProForm
              onFinish={async (values: Record<string, unknown>) => {
                try {
                  const response = await userInfoService.updateCurrentUserInfo({
                    name: values.name as string,
                    email: values.email as string,
                    phone: values.phone as string,
                  });
                  
                  if (response.success) {
                    handleDataResponse.userAction('保存用户信息', true, response);
                    // 重新获取用户信息
                    const updatedResponse = await userInfoService.getCurrentUserInfo();
                    if (updatedResponse.success && updatedResponse.data) {
                      setUserInfo(updatedResponse.data);
                    }
                  } else {
                    handleDataResponse.userAction('保存用户信息', false, response);
                  }
                } catch (error) {
                  handleDataResponse.userAction('保存用户信息', false, undefined, error);
                }
              }}
              initialValues={{
                name: userInfo?.name || '',
                email: userInfo?.email || '',
                phone: userInfo?.phone || '',
                role: userInfo?.role === 1 ? 'admin' : 'user',
                user_group: userInfo?.userGroup?.[0]?.toString() || '',
                traffic: userInfo?.traffic || '',
                traffic_reset_date: userInfo?.trafficResetDate || '',
                forward_rule_config_limit: userInfo?.forwardRuleConfigLimit || '',
              }}
              key={userInfo?.id} // 当用户信息更新时重新渲染表单
              submitter={{
                searchConfig: {
                  submitText: '保存设置',
                  resetText: '重置',
                },
                submitButtonProps: {
                  style: {
                    background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                    border: 'none',
                    borderRadius: 12,
                    height: 40,
                    fontSize: 14,
                    fontWeight: 500
                  }
                },
                resetButtonProps: {
                  style: {
                    borderRadius: 12,
                    height: 40,
                    fontSize: 14
                  }
                }
              }}
              layout="horizontal"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Row gutter={[24, 0]}>
                <Col xs={24} lg={12}>
                  <ProFormText
                    name="name"
                    label="用户名"
                    placeholder="请输入用户名"
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <ProFormText 
                    name="role"
                    label="角色"
                    disabled
                  />
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} lg={12}>
                  <ProFormText
                    name="user_group"
                    label="用户组"
                    disabled
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <ProFormText
                    name="traffic"
                    label="流量限制"
                    disabled
                    addonAfter="MB"
                  />
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} lg={12}>
                  <ProFormText
                    name="traffic_reset_date"
                    label="流量重置日期"
                    disabled
                    fieldProps={{
                      prefix: <CalendarOutlined style={{ 
                        color: currentTheme === 'light' ? '#666' : '#ccc' 
                      }} />
                    }}
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <ProFormText 
                    name="forward_rule_config_limit"
                    label="规则限制"
                    disabled
                    addonAfter="条"
                  />
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col xs={24} lg={12}>
                  <ProFormText
                    name="email"
                    label="邮箱"
                    placeholder="请输入邮箱"
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <ProFormText
                    name="phone"
                    label="手机号"
                    placeholder="请输入手机号"
                  />
                </Col>
              </Row>
            </ProForm>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserInfo; 