'use client';

import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Input, Select, message, Card, Divider, Tag, Typography, Row, Col } from 'antd';
import { userService, User, CreateUserData } from '@/services/user-service';

const { Option } = Select;
const { Title, Text } = Typography;

export default function MSWDemoPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  // 获取用户列表
  const fetchUsers = async (page = 1, pageSize = 10, status?: string) => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        page,
        pageSize,
        status: status as 'active' | 'inactive'
      });
      
      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination({
            current: response.pagination.current,
            pageSize: response.pagination.pageSize,
            total: response.pagination.total,
          });
        }
      }
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建用户
  const handleCreateUser = async (values: CreateUserData) => {
    try {
      const response = await userService.createUser(values);
      if (response.success) {
        message.success('用户创建成功');
        form.resetFields();
        fetchUsers(); // 重新获取列表
      }
    } catch (error) {
      message.error('创建用户失败');
      console.error('Failed to create user:', error);
    }
  };

  // 删除用户
  const handleDeleteUser = async (id: number) => {
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        message.success('用户删除成功');
        fetchUsers(); // 重新获取列表
      }
    } catch (error) {
      message.error('删除用户失败');
      console.error('Failed to delete user:', error);
    }
  };

  // 测试产品API
  const testProductsAPI = async () => {
    try {
      const response = await fetch('https://api.example.com/products');
      const data = await response.json();
      console.log('Products API Response:', data);
      message.success('产品API调用成功，请查看控制台');
    } catch (error) {
      message.error('产品API调用失败');
      console.error('Failed to fetch products:', error);
    }
  };

  // 测试登录API
  const testLoginAPI = async () => {
    try {
      const response = await fetch('https://api.example.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: '123456'
        })
      });
      const data = await response.json();
      console.log('Login API Response:', data);
      message.success('登录API调用成功，请查看控制台');
    } catch (error) {
      message.error('登录API调用失败');
      console.error('Failed to login:', error);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchUsers();
  }, []);

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '激活' : '未激活'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button type="link" size="small">编辑</Button>
          <Button 
            type="link" 
            danger 
            size="small"
            onClick={() => handleDeleteUser(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🚀 MSW (Mock Service Worker) 演示</Title>
      
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <Title level={4}>🎯 优势对比</Title>
              <Space direction="vertical">
                <Text><strong>MSW方式:</strong></Text>
                <Text>• 拦截网络请求，无需真实API服务器</Text>
                <Text>• 可以模拟真实的API地址</Text>
                <Text>• 代码与生产环境完全一致</Text>
                <Text>• 支持复杂的API行为模拟</Text>
                <Text>• 可以轻松切换开启/关闭</Text>
              </Space>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Title level={4}>🧪 测试其他API</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  onClick={testProductsAPI}
                  style={{ width: '100%' }}
                >
                  测试产品API
                </Button>
                <Button 
                  type="primary" 
                  onClick={testLoginAPI}
                  style={{ width: '100%' }}
                >
                  测试登录API (admin/123456)
                </Button>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  结果将显示在浏览器控制台
                </Text>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 创建用户表单 */}
      <Card title="➕ 创建新用户" style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="姓名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>
          
          <Form.Item
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色" style={{ width: 120 }}>
              <Option value="user">用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              创建用户
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      {/* 筛选和刷新 */}
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Button onClick={() => fetchUsers()}>
            🔄 刷新
          </Button>
          <Button onClick={() => fetchUsers(1, 10, 'active')}>
            👥 仅显示激活用户
          </Button>
          <Button onClick={() => fetchUsers(1, 10, 'inactive')}>
            🚫 仅显示未激活用户
          </Button>
        </Space>
      </div>

      {/* 用户列表表格 */}
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            fetchUsers(page, pageSize);
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
        }}
      />

      {/* API信息说明 */}
      <Card title="📋 API 模拟说明" style={{ marginTop: '24px' }}>
        <div>
          <Title level={4}>🔌 被拦截的API端点:</Title>
          <ul>
            <li><strong>GET</strong> https://api.example.com/users - 获取用户列表</li>
            <li><strong>POST</strong> https://api.example.com/users - 创建新用户</li>
            <li><strong>PUT</strong> https://api.example.com/users/:id - 更新用户</li>
            <li><strong>DELETE</strong> https://api.example.com/users/:id - 删除用户</li>
            <li><strong>GET</strong> https://api.example.com/products - 获取产品列表</li>
            <li><strong>POST</strong> https://api.example.com/auth/login - 用户登录</li>
          </ul>
          
          <Title level={4}>⚡ 特性:</Title>
          <ul>
            <li>🌐 拦截真实的外部API调用</li>
            <li>📦 返回模拟数据</li>
            <li>⚙️ 支持分页、筛选、增删改查</li>
            <li>🎛️ 可以实时开启/关闭（右上角开关）</li>
            <li>🔄 数据状态在会话期间保持</li>
            <li>📱 支持复杂的业务逻辑模拟</li>
          </ul>

          <Title level={4}>💡 使用示例:</Title>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`// 这些请求都会被MSW拦截并返回模拟数据
fetch('https://api.example.com/users?page=1&pageSize=10')
fetch('https://api.example.com/products')
fetch('https://api.example.com/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'admin', password: '123456' })
})`}
          </pre>
        </div>
      </Card>
    </div>
  );
} 