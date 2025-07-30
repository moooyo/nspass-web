import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Modal } from 'antd';
import { message } from '@/utils/message';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    QueryFilter,
    ModalForm,
    ProFormTextArea,
    ProFormDependency,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import {
    dnsProviderConfigService,
    DnsProviderConfigItem,
    CreateDnsProviderConfigData,
    DnsProviderConfigListParams,
    DnsProvider
} from '../../../services/dnsConfig';

const DnsProviderConfig: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<DnsProviderConfigItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [viewJsonModalVisible, setViewJsonModalVisible] = useState<boolean>(false);
    const [currentJsonData, setCurrentJsonData] = useState<string>('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 加载DNS Provider配置列表
    const loadDnsProviderConfigs = useCallback(async (params?: DnsProviderConfigListParams) => {
        try {
            setLoading(true);
            const requestParams = {
                page: params?.page || pagination.current,
                pageSize: params?.pageSize || pagination.pageSize,
                ...params,
            };
            
            const response = await dnsProviderConfigService.getDnsProviderConfigs(requestParams);
            
            if (response.success && response.data) {
                setDataSource(response.data);
                if (response.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        current: response.pagination?.current || 1,
                        total: response.pagination?.total || 0,
                    }));
                }
            } else {
                message.error(response.message || '获取DNS Provider配置列表失败');
            }
        } catch (error) {
            console.error('加载DNS Provider配置列表失败:', error);
            message.error('加载DNS Provider配置列表失败');
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize]);

    // 初始化加载数据
    useEffect(() => {
        loadDnsProviderConfigs();
    }, []);

    // 处理创建DNS Provider配置
    const handleCreateDnsProviderConfig = async (values: any) => {
        try {
            const data: CreateDnsProviderConfigData = {
                provider: values.provider,
                config: values.config,
            };

            const response = await dnsProviderConfigService.createDnsProviderConfig(data);
            
            if (response.success) {
                message.success('DNS Provider配置创建成功');
                setCreateModalVisible(false);
                loadDnsProviderConfigs();
                return true;
            } else {
                message.error(response.message || 'DNS Provider配置创建失败');
                return false;
            }
        } catch (error) {
            console.error('创建DNS Provider配置失败:', error);
            message.error('创建DNS Provider配置失败');
            return false;
        }
    };

    // 查看JSON配置
    const handleViewJson = (record: DnsProviderConfigItem) => {
        setCurrentJsonData(record.config || '{}');
        setViewJsonModalVisible(true);
    };

    // 使用 useMemo 缓存DNS Provider选项
    const dnsProviderOptions = useMemo(() => [
        { label: 'Cloudflare', value: DnsProvider.DNS_PROVIDER_CLOUDFLARE },
    ], []);

    // 使用 useMemo 缓存表格列配置，避免每次渲染重新创建
    const columns: ProColumns<DnsProviderConfigItem>[] = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '8%',
            editable: false,
        },
        {
            title: 'DNS Provider',
            dataIndex: 'provider',
            width: '20%',
            valueType: 'select',
            valueEnum: {
                [DnsProvider.DNS_PROVIDER_CLOUDFLARE]: { text: 'Cloudflare' },
            },
            editable: false,
        },
        {
            title: '配置参数',
            dataIndex: 'config',
            width: '30%',
            editable: false,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewJson(record)}
                >
                    查看配置
                </Button>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: '15%',
            valueType: 'dateTime',
            editable: false,
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            width: '15%',
            valueType: 'dateTime',
            editable: false,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '12%',
            render: (_, record, __, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.id!);
                    }}
                >
                    编辑
                </a>,
            ],
        },
    ], []);

    return (
        <div>
            {/* 查看JSON配置的Modal */}
            <Modal
                title="配置参数详情"
                open={viewJsonModalVisible}
                onCancel={() => setViewJsonModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewJsonModalVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={600}
            >
                <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    maxHeight: '400px',
                    overflow: 'auto'
                }}>
                    {JSON.stringify(JSON.parse(currentJsonData || '{}'), null, 2)}
                </pre>
            </Modal>

            {/* 创建DNS Provider配置的Modal */}
            <ModalForm
                title="新增DNS Provider配置"
                width="600px"
                open={createModalVisible}
                onOpenChange={setCreateModalVisible}
                onFinish={handleCreateDnsProviderConfig}
                modalProps={{
                    destroyOnClose: true,
                }}
            >
                <ProFormSelect
                    name="provider"
                    label="DNS Provider"
                    options={dnsProviderOptions}
                    rules={[{ required: true, message: '请选择DNS Provider' }]}
                    placeholder="请选择DNS Provider"
                />
                
                <ProFormDependency name={['provider']}>
                    {({ provider }) => {
                        if (provider === DnsProvider.DNS_PROVIDER_CLOUDFLARE) {
                            return (
                                <ProFormTextArea
                                    name="config"
                                    label="Cloudflare配置"
                                    placeholder='请输入Cloudflare配置，例如：{"email": "your-email@example.com", "api_key": "your-api-key"}'
                                    rules={[
                                        { required: true, message: '请输入配置参数' },
                                        {
                                            validator: (_: any, value: string) => {
                                                if (!value) return Promise.resolve();
                                                try {
                                                    const config = JSON.parse(value);
                                                    if (!config.email || !config.api_key) {
                                                        return Promise.reject(new Error('Cloudflare配置必须包含email和api_key字段'));
                                                    }
                                                    return Promise.resolve();
                                                } catch {
                                                    return Promise.reject(new Error('请输入有效的JSON格式'));
                                                }
                                            }
                                        }
                                    ]}
                                    fieldProps={{
                                        rows: 6,
                                    }}
                                />
                            );
                        } else {
                            return (
                                <ProFormTextArea
                                    name="config"
                                    label="配置参数"
                                    placeholder="请输入JSON格式的配置参数"
                                    rules={[
                                        {
                                            validator: (_: any, value: string) => {
                                                if (!value) return Promise.resolve();
                                                try {
                                                    JSON.parse(value);
                                                    return Promise.resolve();
                                                } catch {
                                                    return Promise.reject(new Error('请输入有效的JSON格式'));
                                                }
                                            }
                                        }
                                    ]}
                                    fieldProps={{
                                        rows: 6,
                                    }}
                                />
                            );
                        }
                    }}
                </ProFormDependency>
            </ModalForm>

            <QueryFilter
                defaultCollapsed
                split
                defaultColsNumber={3}
                onFinish={async (values) => {
                    console.log(values);
                    await loadDnsProviderConfigs(values);
                    message.success('查询成功');
                }}
            >
                <ProFormSelect
                    name="provider"
                    label="DNS Provider"
                    colProps={{ span: 8 }}
                    options={dnsProviderOptions}
                    placeholder="请选择DNS Provider"
                />
            </QueryFilter>

            <EditableProTable<DnsProviderConfigItem>
                rowKey="id"
                headerTitle="DNS Provider配置列表"
                maxLength={20}
                scroll={{ x: 1200 }}
                recordCreatorProps={false}
                loading={loading}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setCreateModalVisible(true);
                        }}
                        type="primary"
                    >
                        新增配置
                    </Button>,
                    <Button
                        key="refresh"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            loadDnsProviderConfigs();
                        }}
                    >
                        刷新
                    </Button>
                ]}
                columns={columns}
                request={async () => {
                    return {
                        data: dataSource,
                        total: pagination.total,
                        success: true,
                    };
                }}
                value={dataSource}
                onChange={(value) => {
                    setDataSource([...value]);
                }}
                editable={{
                    type: 'single',
                    editableKeys,
                    onSave: async (_, data) => {
                        try {
                            if (!data.id) {
                                message.error('无法更新：缺少配置ID');
                                return false;
                            }
                            const response = await dnsProviderConfigService.updateDnsProviderConfig(data.id, {
                                provider: data.provider,
                                config: data.config,
                            });
                            if (response.success) {
                                message.success('DNS Provider配置更新成功');
                                loadDnsProviderConfigs();
                            } else {
                                message.error(response.message || 'DNS Provider配置更新失败');
                            }
                        } catch (error) {
                            console.error('更新失败:', error);
                        }
                    },
                    onDelete: async (_, record) => {
                        try {
                            if (!record.id) {
                                message.error('无法删除：缺少配置ID');
                                return false;
                            }
                            const response = await dnsProviderConfigService.deleteDnsProviderConfig(record.id);
                            if (response.success) {
                                message.success('DNS Provider配置删除成功');
                                loadDnsProviderConfigs();
                            } else {
                                message.error(response.message || 'DNS Provider配置删除失败');
                            }
                        } catch (error) {
                            console.error('删除失败:', error);
                        }
                    },
                    onValuesChange: (_, recordList) => {
                        setDataSource(recordList);
                    },
                    deleteText: '删除',
                    deletePopconfirmMessage: '确定删除这条记录吗？',
                    onlyOneLineEditorAlertMessage: '只能同时编辑一行记录',
                    onlyAddOneLineAlertMessage: '只能同时新增一行记录',
                    actionRender: (_, __, dom) => [dom.save, dom.cancel, dom.delete],
                    onChange: setEditableKeys,
                }}
                pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => {
                        setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
                        loadDnsProviderConfigs({ page, pageSize });
                    },
                }}
            />
        </div>
    );
};

export default DnsProviderConfig;
