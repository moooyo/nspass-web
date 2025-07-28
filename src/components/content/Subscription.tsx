import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Popconfirm,
  DatePicker,
  Switch,
  Card,
  Statistic,
  Row,
  Col,
  Divider,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ReloadOutlined,
  LinkOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import subscriptionService, {
  SubscriptionData,
  SubscriptionType,
  SubscriptionStats,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest
} from '@/services/subscription';

// 配置dayjs
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const Subscription: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 错误处理
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('全局错误:', event.error);
      setError('页面加载出现错误，请刷新重试');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // 加载订阅列表
  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('开始加载订阅列表...');
      const response = await subscriptionService.getSubscriptions();
      console.log('订阅列表响应:', response);
      
      if (response.success && response.data) {
        // 确保数据格式正确，给缺失字段添加默认值
        const normalizedData = Array.isArray(response.data) 
          ? response.data.map((item: any) => ({
              ...item,
              totalRequests: item.requestCount || 0, // 将 requestCount 映射为 totalRequests
              userId: item.userId || 0,
              token: item.token || 'unknown'
            }))
          : [];
        
        setSubscriptions(normalizedData);
        console.log('订阅列表加载成功:', normalizedData.length + ' 条');
      } else {
        console.error('订阅列表响应失败:', response);
        message.error('加载订阅列表失败: ' + (response.message || '未知错误'));
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('加载订阅列表出错:', error);
      message.error('加载订阅列表出错');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载统计数据
  const loadStats = useCallback(async () => {
    try {
      console.log('开始加载统计数据...');
      const response = await subscriptionService.getSubscriptionStats();
      console.log('统计数据响应:', response);
      
      if (response.success && response.data) {
        setStats(response.data);
        console.log('统计数据加载成功');
      } else {
        console.error('统计数据响应失败:', response);
      }
    } catch (error) {
      console.error('加载统计数据出错:', error);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    console.log('Subscription组件初始化...');
    
    const init = async () => {
      try {
        await Promise.all([
          loadSubscriptions(),
          loadStats()
        ]);
      } catch (error) {
        console.error('初始化加载失败:', error);
        setError('初始化失败: ' + String(error));
      }
    };
    
    init();
  }, [loadSubscriptions, loadStats]);

  // 创建订阅
  const handleCreateSubscription = async (values: any) => {
    try {
      const createData: CreateSubscriptionRequest = {
        type: values.type,
        name: values.name,
        description: values.description || '',
        expiresAt: values.expiresAt ? dayjs(values.expiresAt).toISOString() : undefined,
        includeRules: values.includeRules ? values.includeRules.split('\n').filter(Boolean) : [],
        excludeRules: values.excludeRules ? values.excludeRules.split('\n').filter(Boolean) : [],
        customTemplate: values.customTemplate || ''
      };

      const response = await subscriptionService.createSubscription(createData);
      if (response.success) {
        message.success('订阅创建成功');
        setCreateModalVisible(false);
        form.resetFields();
        loadSubscriptions();
        loadStats();
      } else {
        message.error('创建失败: ' + response.message);
      }
    } catch (error) {
      console.error('创建订阅出错:', error);
      message.error('创建订阅出错');
    }
  };

  // 更新订阅
  const handleUpdateSubscription = async (values: any) => {
    if (!editingRecord) return;

    try {
      const updateData: UpdateSubscriptionRequest = {
        type: values.type,
        name: values.name,
        description: values.description || '',
        expiresAt: values.expiresAt ? dayjs(values.expiresAt).toISOString() : undefined,
        isActive: values.isActive,
        includeRules: values.includeRules ? values.includeRules.split('\n').filter(Boolean) : [],
        excludeRules: values.excludeRules ? values.excludeRules.split('\n').filter(Boolean) : [],
        customTemplate: values.customTemplate || ''
      };

      const response = await subscriptionService.updateSubscription(editingRecord.subscriptionId || '', updateData);
      if (response.success) {
        message.success('订阅更新成功');
        setEditModalVisible(false);
        setEditingRecord(null);
        editForm.resetFields();
        loadSubscriptions();
        loadStats();
      } else {
        message.error('更新失败: ' + response.message);
      }
    } catch (error) {
      console.error('更新订阅出错:', error);
      message.error('更新订阅出错');
    }
  };

  // 删除订阅
  const handleDeleteSubscription = async (subscriptionId: string) => {
    try {
      const response = await subscriptionService.deleteSubscription(subscriptionId);
      if (response.success) {
        message.success('订阅删除成功');
        loadSubscriptions();
        loadStats();
      } else {
        message.error('删除失败: ' + response.message);
      }
    } catch (error) {
      console.error('删除订阅出错:', error);
      message.error('删除订阅出错');
    }
  };

  // 复制订阅链接
  const handleCopySubscriptionUrl = async (record: any) => {
    try {
      console.log('准备复制订阅地址，记录数据:', record);
      console.log('userId:', record.userId, 'token:', record.token);
      
      const url = await subscriptionService.copySubscriptionUrl(record.userId, record.token);
      message.success('订阅地址已复制到剪贴板！');
      console.log('复制的订阅地址:', url);
    } catch (error) {
      console.error('复制链接出错:', error);
      message.error('复制链接失败');
    }
  };

  // 打开编辑弹窗
  const handleEdit = (record: SubscriptionData) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      type: record.type,
      name: record.name,
      description: record.description,
      expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null,
      isActive: record.isActive,
      includeRules: '',
      excludeRules: '',
      customTemplate: ''
    });
    setEditModalVisible(true);
  };

  // 获取订阅类型颜色
  const getSubscriptionTypeColor = (type: SubscriptionType): string => {
    const colorMap: Record<SubscriptionType, string> = {
      [SubscriptionType.SUBSCRIPTION_TYPE_SURGE]: 'blue',
      [SubscriptionType.SUBSCRIPTION_TYPE_CLASH]: 'red',
      [SubscriptionType.SUBSCRIPTION_TYPE_QUANTUMULT_X]: 'purple',
      [SubscriptionType.SUBSCRIPTION_TYPE_SHADOWSOCKS]: 'green',
      [SubscriptionType.SUBSCRIPTION_TYPE_LOON]: 'orange',
      [SubscriptionType.SUBSCRIPTION_TYPE_STASH]: 'cyan',
      [SubscriptionType.SUBSCRIPTION_TYPE_V2RAY]: 'magenta',
      [SubscriptionType.SUBSCRIPTION_TYPE_UNSPECIFIED]: 'default',
      [SubscriptionType.UNRECOGNIZED]: 'default'
    };
    return colorMap[type] || 'default';
  };

  // 表格列定义
  const columns: ColumnsType<SubscriptionData> = [
         {
       title: '订阅名称',
       dataIndex: 'name',
       key: 'name',
       width: '25%',
       render: (text: string, record: SubscriptionData) => (
         <div>
           <div style={{ fontWeight: 'bold' }}>{text || '未命名'}</div>
           {record?.description && (
             <div style={{ fontSize: '12px', color: '#999' }}>{record.description}</div>
           )}
         </div>
       ),
     },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '12%',
      render: (type: SubscriptionType) => (
        <Tag color={getSubscriptionTypeColor(type)}>
          {subscriptionService.getSubscriptionTypeDisplayName(type)}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '8%',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
         {
       title: '请求次数',
       dataIndex: 'totalRequests',
       key: 'totalRequests',
       width: '10%',
       render: (count: number) => {
         if (typeof count === 'number') {
           return count.toLocaleString();
         }
         return count || 0;
       },
     },
         {
       title: '最后访问',
       dataIndex: 'lastAccessedAt',
       key: 'lastAccessedAt',
       width: '18%',
               render: (date: string) => {
           if (!date) return '-';
           try {
             const dayjsDate = dayjs(date);
             return (
               <Tooltip title={dayjsDate.format('YYYY-MM-DD HH:mm:ss')}>
                 {dayjsDate.fromNow()}
               </Tooltip>
             );
           } catch (error) {
             console.error('日期格式化错误:', error, date);
             return <span style={{ color: '#999' }}>日期格式错误</span>;
           }
         },
    },
         {
       title: '客户端',
       dataIndex: 'userAgent',
       key: 'userAgent',
       width: '18%',
      render: (userAgent: string) => {
        if (!userAgent) return '-';
        const shortUA = userAgent.length > 20 ? userAgent.substring(0, 20) + '...' : userAgent;
        return (
          <Tooltip title={userAgent}>
            <span style={{ fontSize: '12px' }}>{shortUA}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: '12%',
             render: (date: string) => {
         if (!date) return '永不过期';
         try {
           const dayjsDate = dayjs(date);
           const isExpired = dayjsDate.isBefore(dayjs());
           return (
             <span style={{ color: isExpired ? '#ff4d4f' : undefined }}>
               {dayjsDate.format('YYYY-MM-DD')}
             </span>
           );
         } catch (error) {
           console.error('过期时间格式化错误:', error, date);
           return <span style={{ color: '#999' }}>日期格式错误</span>;
         }
       },
    },

            {
         title: '操作',
         key: 'action',
         width: '20%',
       render: (_, record: SubscriptionData) => (
         <Space size="small">
           <Tooltip title="复制订阅地址">
             <Button
               type="text"
               size="small"
               icon={<CopyOutlined />}
               onClick={() => handleCopySubscriptionUrl(record)}
             />
           </Tooltip>
           <Tooltip title="在新窗口打开">
             <Button
               type="text"
               size="small"
               icon={<LinkOutlined />}
               onClick={() => window.open(`/s/${record.userId}/${(record as any).token}`, '_blank')}
             />
           </Tooltip>
           <Tooltip title="编辑">
             <Button
               type="text"
               size="small"
               icon={<EditOutlined />}
               onClick={() => handleEdit(record)}
             />
           </Tooltip>
           <Popconfirm
             title="确认删除"
             description="确定要删除这个订阅吗？此操作不可恢复。"
             onConfirm={() => handleDeleteSubscription(record.subscriptionId || '')}
             okText="确认"
             cancelText="取消"
           >
             <Tooltip title="删除">
               <Button
                 type="text"
                 size="small"
                 danger
                 icon={<DeleteOutlined />}
               />
             </Tooltip>
           </Popconfirm>
         </Space>
       ),
     },
  ];

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={2}>订阅管理</Title>
        <div style={{ marginTop: '50px' }}>
          <h3 style={{ color: '#ff4d4f' }}>加载失败</h3>
          <p>{error}</p>
          <Button 
            type="primary" 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
          >
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  console.log('订阅组件渲染中...', { 
    subscriptions: subscriptions?.length, 
    stats, 
    loading, 
    error,
    sampleSubscription: subscriptions?.[0] 
  });

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>订阅管理</Title>
      
             {/* 统计卡片 */}
       {stats && (
         <Row gutter={16} style={{ marginBottom: '24px' }}>
           <Col span={6}>
             <Card>
               <Statistic
                 title="总订阅数"
                 value={stats.totalSubscriptions || 0}
                 prefix={<BarChartOutlined />}
               />
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <Statistic
                 title="活跃订阅"
                 value={stats.activeSubscriptions || 0}
                 valueStyle={{ color: '#3f8600' }}
               />
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <Statistic
                 title="总请求数"
                 value={stats.totalRequests || 0}
                 precision={0}
               />
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <Statistic
                 title="今日请求"
                 value={stats.requestsToday || 0}
                 valueStyle={{ color: '#1890ff' }}
               />
             </Card>
           </Col>
         </Row>
       )}

             <Divider />



       {/* 操作栏 */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建订阅
          </Button>
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loadSubscriptions();
              loadStats();
            }}
          >
            刷新
          </Button>
        </Space>
      </div>

             {/* 订阅表格 */}
       <Table
         columns={columns}
         dataSource={subscriptions || []}
         rowKey={(record) => record?.subscriptionId || Math.random().toString()}
         loading={loading}
         pagination={{
           showSizeChanger: true,
           showQuickJumper: true,
           showTotal: (total) => `共 ${total} 条`,
           pageSizeOptions: ['10', '20', '50', '100']
         }}
         scroll={{ x: 1200 }}
         locale={{
           emptyText: loading ? '加载中...' : '暂无数据'
         }}
       />

      {/* 创建订阅弹窗 */}
      <Modal
        title="创建订阅"
        open={createModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubscription}
        >
          <Form.Item
            name="name"
            label="订阅名称"
            rules={[{ required: true, message: '请输入订阅名称' }]}
          >
            <Input placeholder="请输入订阅名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="订阅类型"
            rules={[{ required: true, message: '请选择订阅类型' }]}
          >
            <Select placeholder="请选择订阅类型">
              {subscriptionService.getSubscriptionTypeOptions().map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              placeholder="请输入订阅描述（可选）"
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="过期时间"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="选择过期时间（可选，留空表示永不过期）"
              showTime
            />
          </Form.Item>

          <Form.Item
            name="includeRules"
            label="包含规则"
          >
            <TextArea
              placeholder="每行一个规则ID，用于指定包含在订阅中的规则（可选）"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="excludeRules"
            label="排除规则"
          >
            <TextArea
              placeholder="每行一个规则ID，用于指定排除在订阅外的规则（可选）"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑订阅弹窗 */}
      <Modal
        title="编辑订阅"
        open={editModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRecord(null);
          editForm.resetFields();
        }}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateSubscription}
        >
          <Form.Item
            name="name"
            label="订阅名称"
            rules={[{ required: true, message: '请输入订阅名称' }]}
          >
            <Input placeholder="请输入订阅名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="订阅类型"
            rules={[{ required: true, message: '请选择订阅类型' }]}
          >
            <Select placeholder="请选择订阅类型">
              {subscriptionService.getSubscriptionTypeOptions().map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              placeholder="请输入订阅描述（可选）"
              rows={2}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="启用状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="过期时间"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="选择过期时间（可选）"
              showTime
            />
          </Form.Item>

          <Form.Item
            name="includeRules"
            label="包含规则"
          >
            <TextArea
              placeholder="每行一个规则ID"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="excludeRules"
            label="排除规则"
          >
            <TextArea
              placeholder="每行一个规则ID"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Subscription; 