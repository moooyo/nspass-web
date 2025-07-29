import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Button, Tag, Modal, Space, Typography, Divider, Select, Row, Col } from 'antd';
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
    CheckCircleOutlined,
    CloseCircleOutlined,
    DatabaseOutlined,
    ExportOutlined,
} from '@ant-design/icons';
import { message, handleApiResponse } from '@/utils/message';
import { 
  getServerIptablesConfigs,
  type IptablesConfig
} from '@/services/iptables';
import { serverService } from '@/services/server';
import { ServerItem } from '@/types/generated/api/servers/server_management';
import { egressService } from '@/services/egress';
import { useApiRefresh } from '@/utils/api-refresh-bus';

const { Title, Text } = Typography;

const IptablesManagement: React.FC = () => {
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<IptablesConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<IptablesConfig[]>([]);
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [serverMap, setServerMap] = useState<Record<string, string>>({});
  const [egressMap, setEgressMap] = useState<Record<string, string>>({});
  
  const actionRef = useRef<ActionType>(null);

  // 获取服务器列表
  const loadServers = useCallback(async () => {
    setServersLoading(true);
    try {
      const result = await serverService.getServers();
      if (result.success && result.data) {
        setServers(result.data as ServerItem[]);
        // 自动选择第一个服务器
        if (result.data.length > 0 && (result.data as ServerItem[])[0].id) {
          setSelectedServer((result.data as ServerItem[])[0].id!);
        }
      }
    } catch {
      message.error('获取服务器列表失败');
    } finally {
      setServersLoading(false);
    }
  }, []);

  // 加载服务器和出口映射
  const loadMappings = useCallback(async () => {
    try {
      // 加载所有服务器
      const serverResult = await serverService.getServers();
      if (serverResult.success && serverResult.data) {
        const sMap: Record<string, string> = {};
        (serverResult.data as ServerItem[]).forEach(server => {
          if (server.id) {
            sMap[server.id.toString()] = server.name || `服务器 ${server.id}`;
          }
        });
        setServerMap(sMap);
      }

      // 加载所有出口
      const egressResult = await egressService.getEgressList();
      if (egressResult.success && egressResult.data) {
        const eMap: Record<string, string> = {};
        egressResult.data.forEach(egress => {
          if (egress.id) {
            eMap[egress.id.toString()] = egress.egressName || `出口 ${egress.id}`;
          }
        });
        setEgressMap(eMap);
      }
    } catch (error) {
      console.error('加载映射失败:', error);
    }
  }, []);

  // 组件初始化时加载服务器列表和映射
  useEffect(() => {
    loadServers();
    loadMappings();
  }, [loadServers, loadMappings]);

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
      
      // 使用响应处理器，获取操作不显示成功消息
      const handledResponse = handleApiResponse.fetch(response, '获取iptables配置');
      
      if (handledResponse.success && handledResponse.data) {
        setConfigs(handledResponse.data);
      }
    } catch {
      message.error('获取 iptables 配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

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
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
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
        <Tag color={text === 'ACCEPT' ? 'success' : text === 'DROP' ? 'error' : text === 'DNAT' ? 'processing' : 'default'}>
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
      width: 220,
      render: (text, record) => {
        const serverName = record.destServerId ? serverMap[record.destServerId.toString()] : undefined;
        const egressName = record.destEgressId ? egressMap[record.destEgressId.toString()] : undefined;
        
        return (
          <div>
            {/* 优先显示服务器或出口信息 */}
            {record.destServerId && (
              <div style={{ marginBottom: 4 }}>
                <Tag color="blue" icon={<DatabaseOutlined />} style={{ fontSize: '11px', padding: '1px 4px' }}>
                  服务器 {record.destServerId}: {serverName || '未知'}
                </Tag>
              </div>
            )}
            {record.destEgressId && (
              <div style={{ marginBottom: 4 }}>
                <Tag color="orange" icon={<ExportOutlined />} style={{ fontSize: '11px', padding: '1px 4px' }}>
                  出口 {record.destEgressId}: {egressName || '未知'}
                </Tag>
              </div>
            )}
            
            {/* IP 地址 */}
            <div>{text || '-'}</div>
            
            {/* 端口信息 */}
            {record.destPort && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                端口: {record.destPort}
              </Text>
            )}
          </div>
        );
      },
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
      title: '接口',
      dataIndex: 'interface',
      width: 80,
      render: (text) => text ? <Tag color="purple">{text}</Tag> : '-',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 80,
      render: (enabled) => (
        <Tag color={enabled ? 'success' : 'default'} icon={enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
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

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>iptables 配置管理</Title>
      <Text type="secondary">
        管理服务器的 iptables 配置规则，查看当前配置、生成的规则和脚本。
      </Text>
      
      <Divider />
      
      {/* 服务器选择和操作区域 */}
      <ProCard style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>选择服务器：</Text>
          </Col>
          <Col>
            <Select
              value={selectedServer}
              onChange={(value: string) => setSelectedServer(value)}
              options={serverOptions}
              placeholder="选择服务器"
              style={{ width: 200 }}
              loading={serversLoading}
            />
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<SyncOutlined />}
              onClick={() => loadIptablesConfig(selectedServer)}
              loading={loading}
              disabled={!selectedServer}
            >
              刷新配置
            </Button>
          </Col>
        </Row>
      </ProCard>

      {/* 配置表格 */}
      <ProTable<IptablesConfig>
        headerTitle="iptables 配置规则"
        actionRef={actionRef}
        rowKey="id"
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
                title: '配置ID',
                key: 'id',
                dataIndex: 'id',
              },
              {
                title: '服务器ID',
                key: 'serverId',
                dataIndex: 'serverId',
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
                  <Tag color={text === 'ACCEPT' ? 'success' : text === 'DROP' ? 'error' : text === 'DNAT' ? 'processing' : 'default'}>
                    {text}
                  </Tag>
                ),
              },
              {
                title: '源IP',
                key: 'sourceIp',
                dataIndex: 'sourceIp',
                render: (text) => text || '-',
              },
              {
                title: '源端口',
                key: 'sourcePort',
                dataIndex: 'sourcePort',
                render: (text) => text || '-',
              },
              {
                title: '目标IP',
                key: 'destIp',
                dataIndex: 'destIp',
                render: (text) => text || '-',
              },
              {
                title: '目标端口',
                key: 'destPort',
                dataIndex: 'destPort',
                render: (text) => text || '-',
              },
              {
                title: '目标服务器',
                key: 'destServerId',
                dataIndex: 'destServerId',
                render: (id) => {
                  if (!id) return '-';
                  const serverName = serverMap[id.toString()] || '未知';
                  return (
                    <Tag color="blue" icon={<DatabaseOutlined />}>
                      服务器 {id}: {serverName}
                    </Tag>
                  );
                },
              },
              {
                title: '目标出口',
                key: 'destEgressId',
                dataIndex: 'destEgressId',
                render: (id) => {
                  if (!id) return '-';
                  const egressName = egressMap[id.toString()] || '未知';
                  return (
                    <Tag color="orange" icon={<ExportOutlined />}>
                      出口 {id}: {egressName}
                    </Tag>
                  );
                },
              },
              {
                title: '协议',
                key: 'protocol',
                dataIndex: 'protocol',
                render: (text) => text || 'all',
              },
              {
                title: '网络接口',
                key: 'interface',
                dataIndex: 'interface',
                render: (text) => text || '-',
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
                  <Tag color={enabled ? 'success' : 'default'} icon={enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                    {enabled ? '启用' : '禁用'}
                  </Tag>
                ),
              },
              {
                title: '备注',
                key: 'ruleComment',
                dataIndex: 'ruleComment',
                span: 2,
                render: (text) => text || '-',
              },
              {
                title: '创建时间',
                key: 'createdAt',
                dataIndex: 'createdAt',
                render: (text) => text ? new Date((text as number) * 1000).toLocaleString() : '-',
              },
              {
                title: '更新时间',
                key: 'updatedAt',
                dataIndex: 'updatedAt',
                render: (text) => text ? new Date((text as number) * 1000).toLocaleString() : '-',
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default IptablesManagement;
