import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Button, Tag, Modal, Space, Typography, Progress, Divider, Select } from 'antd';
import {
    ProTable,
    ProColumns,
    ActionType,
    ProDescriptions,
    ProCard
} from '@ant-design/pro-components';
import { 
    SyncOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { message } from '@/utils/message';
import { 
  getServerIptablesConfigs,
  rebuildServerIptables,
  getIptablesRebuildStatusText,
  getIptablesRebuildStatusColor,
  type IptablesConfig,
  type IptablesRebuildTask
} from '@/services/iptables';
import { serverService } from '@/services/server';
import { ServerItem } from '@/types/generated/api/servers/server_management';
import { useApiRefresh } from '@/utils/api-refresh-bus';

const { Title, Text } = Typography;

const IptablesManagement: React.FC = () => {
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [rebuildModalVisible, setRebuildModalVisible] = useState(false);
  const [rebuildTask, setRebuildTask] = useState<IptablesRebuildTask | null>(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<IptablesConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<IptablesConfig[]>([]);
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [serversLoading, setServersLoading] = useState(false);
  
  const actionRef = useRef<ActionType>(null);

  // 获取服务器列表
  const loadServers = useCallback(async () => {
    setServersLoading(true);
    try {
      const result = await serverService.getList();
      if (result.success && result.data) {
        setServers(result.data);
        // 自动选择第一个服务器
        if (result.data.length > 0 && result.data[0].id) {
          setSelectedServer(result.data[0].id);
        }
      }
    } catch {
      message.error('获取服务器列表失败');
    } finally {
      setServersLoading(false);
    }
  }, []);

  // 组件初始化时加载服务器列表
  useEffect(() => {
    loadServers();
  }, [loadServers]);

  // 服务器选项
  const serverOptions = useMemo(() => {
    return servers.map(server => ({
      label: server.name,
      value: server.id
    }));
  }, [servers]);

  // 获取 iptables 配置
  const loadIptablesConfig = useCallback(async (serverId: string) => {
    if (!serverId) return;
    
    setLoading(true);
    try {
      const response = await getServerIptablesConfigs(serverId);
      if (response.success && response.data) {
        setConfigs(response.data.data);
      } else {
        message.error(response.message || '获取 iptables 配置失败');
      }
    } catch {
      message.error('获取 iptables 配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 重建 iptables 配置
  const handleRebuildIptables = useCallback(async (serverId: string, force = false) => {
    if (!serverId) return;
    
    try {
      const response = await rebuildServerIptables(serverId, { force });
      if (response.success && response.data) {
        setRebuildTask(response.data);
        setRebuildModalVisible(true);
        message.success('iptables 重建任务已启动');
      } else {
        message.error(response.message || '启动 iptables 重建任务失败');
      }
    } catch {
      message.error('启动 iptables 重建任务失败');
    }
  }, []);

  // 显示重建确认对话框
  const showRebuildConfirm = useCallback((serverId: string) => {
    Modal.confirm({
      title: '确认重建 iptables',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>您确定要重建选中服务器的 iptables 配置吗？</p>
          <p style={{ color: '#ff4d4f', marginBottom: 0 }}>
            <strong>警告：</strong>重建操作将会重新生成并应用所有 iptables 规则，可能会暂时影响网络连接。
          </p>
        </div>
      ),
      okText: '确认重建',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        handleRebuildIptables(serverId);
      },
    });
  }, [handleRebuildIptables]);

  // 查看配置详情
  const handleViewConfig = useCallback((config: IptablesConfig) => {
    setSelectedConfig(config);
    setConfigModalVisible(true);
  }, []);

  // 当选择的服务器变化时，重新加载配置
  React.useEffect(() => {
    if (selectedServer) {
      loadIptablesConfig(selectedServer);
    }
  }, [selectedServer, loadIptablesConfig]);

  // 监听 MSW 切换事件，自动刷新数据
  useApiRefresh((event) => {
    if (event.type === 'msw-toggled' && selectedServer) {
      loadIptablesConfig(selectedServer);
    }
  }, [selectedServer, loadIptablesConfig]);

  // 表格列定义
  const columns: ProColumns<IptablesConfig>[] = [
    {
      title: '配置名称',
      dataIndex: 'configName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '表/链',
      dataIndex: 'tableName',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tag color="blue">{record.tableName}</Tag>
          <Tag color="green">{record.chainName}</Tag>
        </Space>
      ),
    },
    {
      title: '规则动作',
      dataIndex: 'ruleAction',
      width: 100,
      render: (text) => (
        <Tag color={text === 'ACCEPT' ? 'success' : text === 'DROP' ? 'error' : 'default'}>
          {text}
        </Tag>
      ),
    },
    {
      title: '源地址',
      dataIndex: 'sourceIp',
      width: 120,
      render: (text, record) => (
        <div>
          <div>{text || '-'}</div>
          {record.sourcePort && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              端口: {record.sourcePort}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '目标地址',
      dataIndex: 'destIp',
      width: 120,
      render: (text, record) => (
        <div>
          <div>{text || '-'}</div>
          {record.destPort && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              端口: {record.destPort}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      width: 80,
      render: (text) => (
        <Tag color="cyan">{text || 'ALL'}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 80,
      render: (enabled) => (
        <Tag color={enabled ? 'success' : 'default'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'ruleComment',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewConfig(record)}
        >
          查看
        </Button>,
      ],
    },
  ];

  // 渲染重建状态图标
  const renderRebuildStatusIcon = (status: string) => {
    switch (status) {
      case 'IPTABLES_REBUILD_STATUS_PENDING':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'IPTABLES_REBUILD_STATUS_RUNNING':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'IPTABLES_REBUILD_STATUS_SUCCESS':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'IPTABLES_REBUILD_STATUS_FAILED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>iptables 配置管理</Title>
      <Text type="secondary">
        管理服务器的 iptables 配置规则，查看当前配置并执行重建操作。
      </Text>
      
      <Divider />
      
      {/* 服务器选择和操作区域 */}
      <ProCard style={{ marginBottom: '16px' }}>
        <Space size="middle">
          <Text strong>选择服务器：</Text>
          <Select
            value={selectedServer}
            onChange={(value: string) => setSelectedServer(value)}
            options={serverOptions}
            placeholder="选择服务器"
            style={{ width: 200 }}
            loading={serversLoading}
          />
          <Button 
            type="primary" 
            icon={<SyncOutlined />}
            onClick={() => loadIptablesConfig(selectedServer)}
            loading={loading}
            disabled={!selectedServer}
          >
            刷新配置
          </Button>
          <Button 
            type="primary" 
            danger
            icon={<SyncOutlined />}
            onClick={() => showRebuildConfirm(selectedServer)}
            disabled={!selectedServer}
          >
            重建 iptables
          </Button>
        </Space>
      </ProCard>

      {/* 配置表格 */}
      <ProTable<IptablesConfig>
        headerTitle="iptables 配置规则"
        actionRef={actionRef}
        rowKey="configName"
        search={false}
        options={{
          density: false,
          fullScreen: true,
          setting: true,
        }}
        dataSource={configs}
        loading={loading}
        columns={columns}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 'max-content' }}
      />

      {/* 重建任务状态弹窗 */}
      <Modal
        title="iptables 重建任务"
        open={rebuildModalVisible}
        onCancel={() => setRebuildModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setRebuildModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {rebuildTask && (
          <div>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>任务ID：</Text>
                <Text code>{rebuildTask.taskId}</Text>
              </div>
              
              <div>
                <Text strong>状态：</Text>
                <Space>
                  {renderRebuildStatusIcon(rebuildTask.status)}
                  <Tag color={getIptablesRebuildStatusColor(rebuildTask.status)}>
                    {getIptablesRebuildStatusText(rebuildTask.status)}
                  </Tag>
                </Space>
              </div>
              
              <div>
                <Text strong>进度：</Text>
                <Progress 
                  percent={rebuildTask.totalRules > 0 ? Math.round((rebuildTask.processedRules / rebuildTask.totalRules) * 100) : 0}
                  format={() => `${rebuildTask.processedRules}/${rebuildTask.totalRules}`}
                />
              </div>
              
              {rebuildTask.failedRules > 0 && (
                <div>
                  <Text strong>失败规则数：</Text>
                  <Text type="danger">{rebuildTask.failedRules}</Text>
                </div>
              )}
              
              {rebuildTask.errorMessage && (
                <div>
                  <Text strong>错误信息：</Text>
                  <Text type="danger">{rebuildTask.errorMessage}</Text>
                </div>
              )}
              
              <div>
                <Text strong>开始时间：</Text>
                <Text>{new Date(parseInt(rebuildTask.startedAt) * 1000).toLocaleString()}</Text>
              </div>
              
              {rebuildTask.completedAt && (
                <div>
                  <Text strong>完成时间：</Text>
                  <Text>{new Date(parseInt(rebuildTask.completedAt) * 1000).toLocaleString()}</Text>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>

      {/* 配置详情弹窗 */}
      <Modal
        title="iptables 配置详情"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setConfigModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedConfig && (
          <ProDescriptions
            column={2}
            dataSource={selectedConfig}
            columns={[
              {
                title: '配置名称',
                key: 'configName',
                dataIndex: 'configName',
              },
              {
                title: '服务器名称',
                key: 'serverName',
                dataIndex: 'serverName',
              },
              {
                title: '表名',
                key: 'tableName',
                dataIndex: 'tableName',
              },
              {
                title: '链名',
                key: 'chainName',
                dataIndex: 'chainName',
              },
              {
                title: '规则动作',
                key: 'ruleAction',
                dataIndex: 'ruleAction',
                render: (text) => (
                  <Tag color={text === 'ACCEPT' ? 'success' : text === 'DROP' ? 'error' : 'default'}>
                    {text}
                  </Tag>
                ),
              },
              {
                title: '源IP',
                key: 'sourceIp',
                dataIndex: 'sourceIp',
              },
              {
                title: '源端口',
                key: 'sourcePort',
                dataIndex: 'sourcePort',
              },
              {
                title: '目标IP',
                key: 'destIp',
                dataIndex: 'destIp',
              },
              {
                title: '目标端口',
                key: 'destPort',
                dataIndex: 'destPort',
              },
              {
                title: '协议',
                key: 'protocol',
                dataIndex: 'protocol',
              },
              {
                title: '优先级',
                key: 'priority',
                dataIndex: 'priority',
              },
              {
                title: '状态',
                key: 'isEnabled',
                dataIndex: 'isEnabled',
                render: (enabled) => (
                  <Tag color={enabled ? 'success' : 'default'}>
                    {enabled ? '启用' : '禁用'}
                  </Tag>
                ),
              },
              {
                title: '生成的规则',
                key: 'generatedRule',
                dataIndex: 'generatedRule',
                span: 2,
                render: (text) => (
                  <div style={{ 
                    backgroundColor: '#f6f8fa',
                    border: '1px solid #d0d7de',
                    borderRadius: '6px',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    overflowX: 'auto'
                  }}>
                    {text}
                  </div>
                ),
              },
              {
                title: '备注',
                key: 'ruleComment',
                dataIndex: 'ruleComment',
                span: 2,
              },
              {
                title: '创建时间',
                key: 'createdAt',
                dataIndex: 'createdAt',
                render: (text) => text ? new Date(parseInt(text as string) * 1000).toLocaleString() : '-',
              },
              {
                title: '更新时间',
                key: 'updatedAt',
                dataIndex: 'updatedAt',
                render: (text) => text ? new Date(parseInt(text as string) * 1000).toLocaleString() : '-',
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default IptablesManagement;
