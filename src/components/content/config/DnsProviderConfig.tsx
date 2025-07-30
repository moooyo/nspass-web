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
    ProFormText,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import {
    dnsProviderConfigService,
    DnsProviderConfigItem,
    CreateDnsProviderConfigData,
    DnsProviderConfigListParams,
    DnsProvider
} from '../../../services/dnsConfig';

// DNS Provider配置字段定义
interface ProviderFieldConfig {
    name: string;
    label: string;
    type: 'text' | 'password' | 'email' | 'url';
    required: boolean;
    placeholder?: string;
    description?: string;
}

// DNS Provider配置信息
interface ProviderConfig {
    name: string;
    description: string;
    fields: ProviderFieldConfig[];
}

// 不同DNS Provider的配置信息
const providerConfigs: Record<DnsProvider, ProviderConfig> = {
    [DnsProvider.DNS_PROVIDER_CLOUDFLARE]: {
        name: 'Cloudflare',
        description: 'Cloudflare DNS服务配置 - 全球领先的DNS服务提供商',
        fields: [
            {
                name: 'api_token',
                label: 'API Token',
                type: 'password',
                required: true,
                placeholder: '请输入Cloudflare API Token',
                description: '从Cloudflare控制台获取的API Token，用于API访问认证'
            }
        ]
    },
    [DnsProvider.DNS_PROVIDER_UNSPECIFIED]: {
        name: '未指定',
        description: '请选择一个DNS Provider',
        fields: []
    },
    [DnsProvider.UNRECOGNIZED]: {
        name: '未识别',
        description: '未识别的DNS Provider类型',
        fields: []
    }
};

// 为将来扩展准备的示例配置（注释掉，因为proto中还没有定义）
/*
// 示例：阿里云DNS配置
[DnsProvider.DNS_PROVIDER_ALIYUN]: {
    name: '阿里云DNS',
    description: '阿里云DNS服务配置',
    fields: [
        {
            name: 'access_key_id',
            label: 'Access Key ID',
            type: 'text',
            required: true,
            placeholder: '请输入阿里云Access Key ID',
            description: '阿里云账户的Access Key ID'
        },
        {
            name: 'access_key_secret',
            label: 'Access Key Secret',
            type: 'password',
            required: true,
            placeholder: '请输入阿里云Access Key Secret',
            description: '阿里云账户的Access Key Secret'
        },
        {
            name: 'region',
            label: '地域',
            type: 'text',
            required: true,
            placeholder: '请输入地域，如：cn-hangzhou',
            description: '阿里云服务地域'
        }
    ]
}
*/



// DNS Provider配置表单组件
const DnsProviderConfigForm: React.FC<{ provider: DnsProvider }> = ({ provider }) => {
    const config = providerConfigs[provider];
    const fields = config?.fields || [];

    if (fields.length === 0) {
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

    return (
        <>
            {config.description && (
                <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
                    {config.description}
                </div>
            )}
            {fields.map((field: ProviderFieldConfig) => (
                <ProFormText
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={[
                        { required: field.required, message: `请输入${field.label}` },
                        ...(field.type === 'email' ? [{ type: 'email' as const, message: '请输入有效的邮箱地址' }] : [])
                    ]}
                    placeholder={field.placeholder}
                    tooltip={field.description}
                    fieldProps={{
                        type: field.type === 'password' ? 'password' : 'text'
                    }}
                />
            ))}
        </>
    );
};

const DnsProviderConfig: React.FC = () => {
    const [dataSource, setDataSource] = useState<DnsProviderConfigItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<DnsProviderConfigItem | null>(null);
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
            let configString: string;

            // 根据provider类型处理配置数据
            if (values.provider === DnsProvider.DNS_PROVIDER_CLOUDFLARE) {
                // 对于Cloudflare，从结构化字段构建JSON
                const config = {
                    api_token: values.api_token
                };
                configString = JSON.stringify(config);
            } else {
                // 对于其他provider，直接使用config字段
                configString = values.config || '{}';
            }

            const data: CreateDnsProviderConfigData = {
                provider: values.provider,
                config: configString,
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

    // 解析配置获取初始值
    const getEditInitialValues = (record: DnsProviderConfigItem) => {
        const initialValues: any = {
            provider: record.provider,
        };

        try {
            const config = JSON.parse(record.config || '{}');
            if (record.provider === DnsProvider.DNS_PROVIDER_CLOUDFLARE) {
                initialValues.api_token = config.api_token || '';
            } else {
                initialValues.config = record.config || '{}';
            }
        } catch (error) {
            console.warn('Failed to parse config:', error);
            initialValues.config = record.config || '{}';
        }

        return initialValues;
    };

    // 打开编辑Modal
    const openEditModal = (record: DnsProviderConfigItem) => {
        setEditingRecord(record);
        setEditModalVisible(true);
    };

    // 处理编辑DNS Provider配置
    const handleEditDnsProviderConfig = async (values: any) => {
        try {
            if (!editingRecord?.id) {
                message.error('无法更新：缺少配置ID');
                return false;
            }

            let configString: string;

            // 根据provider类型处理配置数据
            if (values.provider === DnsProvider.DNS_PROVIDER_CLOUDFLARE) {
                // 对于Cloudflare，从结构化字段构建JSON
                const config = {
                    api_token: values.api_token
                };
                configString = JSON.stringify(config);
            } else {
                // 对于其他provider，直接使用config字段
                configString = values.config || '{}';
            }

            const response = await dnsProviderConfigService.updateDnsProviderConfig(editingRecord.id, {
                provider: values.provider,
                config: configString,
            });

            if (response.success) {
                message.success('DNS Provider配置更新成功');
                setEditModalVisible(false);
                setEditingRecord(null);
                loadDnsProviderConfigs();
                return true;
            } else {
                message.error(response.message || 'DNS Provider配置更新失败');
                return false;
            }
        } catch (error) {
            console.error('更新DNS Provider配置失败:', error);
            message.error('更新DNS Provider配置失败');
            return false;
        }
    };

    // 查看JSON配置
    const handleViewJson = (record: DnsProviderConfigItem) => {
        setCurrentJsonData(record.config || '{}');
        setViewJsonModalVisible(true);
    };

    // 使用 useMemo 缓存DNS Provider选项
    const dnsProviderOptions = useMemo(() =>
        Object.entries(providerConfigs)
            .filter(([provider]) => provider !== DnsProvider.DNS_PROVIDER_UNSPECIFIED && provider !== DnsProvider.UNRECOGNIZED)
            .map(([provider, config]) => ({
                label: config.name,
                value: provider as DnsProvider,
            }))
    , []);

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
            valueEnum: Object.fromEntries(
                Object.entries(providerConfigs).map(([provider, config]) => [
                    provider,
                    { text: config.name }
                ])
            ),
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
            render: (_, record) => [
                <a
                    key="editable"
                    onClick={() => openEditModal(record)}
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
                    {({ provider }) => (
                        <DnsProviderConfigForm provider={provider} />
                    )}
                </ProFormDependency>
            </ModalForm>

            {/* 编辑DNS Provider配置的Modal */}
            <ModalForm
                title="编辑DNS Provider配置"
                width="600px"
                open={editModalVisible}
                onOpenChange={setEditModalVisible}
                onFinish={handleEditDnsProviderConfig}
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => {
                        setEditModalVisible(false);
                        setEditingRecord(null);
                    },
                }}
                initialValues={editingRecord ? getEditInitialValues(editingRecord) : {}}
            >
                <ProFormSelect
                    name="provider"
                    label="DNS Provider"
                    options={dnsProviderOptions}
                    rules={[{ required: true, message: '请选择DNS Provider' }]}
                    placeholder="请选择DNS Provider"
                />

                <ProFormDependency name={['provider']}>
                    {({ provider }) => (
                        <DnsProviderConfigForm provider={provider} />
                    )}
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
                    type: 'multiple',
                    editableKeys: [],
                    onSave: async () => false,
                    onChange: () => {},
                    actionRender: () => [],
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
