import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Modal, Typography } from 'antd';
import { message } from '@/utils/message';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
    ModalForm,
    ProFormTextArea,
    ProFormDependency,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { 
    dnsConfigService, 
    DnsConfigItem, 
    CreateDnsConfigData, 
    DnsConfigListParams 
} from '../../../services/dnsConfig';

const { Title, Text } = Typography;

// DNS提供商枚举
const dnsProviders = {
    CLOUDFLARE: { text: 'Cloudflare', value: 'CLOUDFLARE' },
};

const DnsConfig: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<DnsConfigItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [viewJsonModalVisible, setViewJsonModalVisible] = useState<boolean>(false);
    const [currentJsonData, setCurrentJsonData] = useState<string>('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 加载DNS配置列表
    const loadDnsConfigs = useCallback(async (params?: DnsConfigListParams) => {
        try {
            setLoading(true);
            const requestParams = {
                page: params?.page || pagination.current,
                pageSize: params?.pageSize || pagination.pageSize,
                ...params,
            };
            
            const response = await dnsConfigService.getDnsConfigs(requestParams);
            
            if (response.success && response.data) {
                setDataSource(response.data);
                if (response.pagination) {
                    setPagination({
                        current: response.pagination.current,
                        pageSize: response.pagination.pageSize,
                        total: response.pagination.total,
                    });
                }
            } else {
                message.error(response.message || '加载DNS配置失败');
            }
        } catch (error) {
            console.error('加载DNS配置失败:', error);
            message.error('加载DNS配置失败');
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize]);

    // 初始化加载数据
    useEffect(() => {
        loadDnsConfigs();
    }, []);

    // 优化：缓存删除操作函数
    const handleDelete = useCallback(async (id: React.Key) => {
        try {
            const response = await dnsConfigService.deleteDnsConfig(id as number);
            if (response.success) {
                message.success('删除成功');
                loadDnsConfigs();
            } else {
                message.error(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            message.error('删除失败');
        }
    }, [loadDnsConfigs]);

    // 优化：缓存查看JSON操作函数
    const viewJsonConfig = useCallback((record: DnsConfigItem) => {
        const jsonConfig = JSON.stringify(record, null, 2);
        setCurrentJsonData(jsonConfig);
        setViewJsonModalVisible(true);
    }, []);

    // 使用 useMemo 缓存DNS Provider选项
    const dnsProviderOptions = useMemo(() => [
        { label: 'Cloudflare', value: 'CLOUDFLARE' },
        { label: 'Aliyun', value: 'ALIYUN' },
        { label: 'Tencent Cloud', value: 'TENCENT' },
        { label: 'Amazon Route 53', value: 'ROUTE53' },
        { label: 'Google Cloud DNS', value: 'GOOGLE' },
    ], []);

    // 使用 useMemo 缓存表格列配置，避免每次渲染重新创建
    const columns: ProColumns<DnsConfigItem>[] = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '8%',
            editable: false,
        },
        {
            title: '配置名',
            dataIndex: 'configName',
            width: '20%',
            editable: false,
        },
        {
            title: 'DNS Provider',
            dataIndex: 'provider',
            width: '15%',
            valueType: 'select',
            valueEnum: {
                CLOUDFLARE: { text: 'Cloudflare' },
                ALIYUN: { text: 'Aliyun' },
                TENCENT: { text: 'Tencent Cloud' },
                ROUTE53: { text: 'Amazon Route 53' },
                GOOGLE: { text: 'Google Cloud DNS' },
            },
            editable: false,
        },
        {
            title: '域名',
            dataIndex: 'domain',
            width: '20%',
            editable: false,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: '15%',
            valueType: 'dateTime',
            editable: false,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '22%',
            render: (_, record) => [
                <Button
                    key="viewJson"
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => viewJsonConfig(record)}
                >
                    查看JSON
                </Button>,
            ],
        },
    ], [viewJsonConfig]);

    // 测试DNS配置
    const testDnsConfig = async (record: DnsConfigItem) => {
        try {
            const response = await dnsConfigService.testDnsConfig(record.id);
            if (response.success) {
                message.success(`DNS配置 ${record.configName} 测试成功`);
            } else {
                message.error(response.message || 'DNS配置测试失败');
            }
        } catch (error) {
            console.error('DNS配置测试失败:', error);
            message.error('DNS配置测试失败');
        }
    };

    // 处理新增配置
    const handleCreateConfig = async (values: any) => {
        try {
            let configParams = '';
            
            // 根据provider类型组装配置参数
            if (values.provider === 'CLOUDFLARE') {
                if (values.email || values.zoneId || values.apiToken) {
                    configParams = JSON.stringify({
                        email: values.email || '',
                        zoneId: values.zoneId || '',
                        apiToken: values.apiToken || ''
                    });
                }
            } else {
                configParams = values.configParams || '';
            }

            const configData: CreateDnsConfigData = {
                configName: values.configName,
                provider: values.provider,
                domain: values.domain,
                configParams: configParams,
            };

            const response = await dnsConfigService.createDnsConfig(configData);
            if (response.success) {
                message.success('DNS配置创建成功');
                setCreateModalVisible(false);
                loadDnsConfigs(); // 重新加载数据
                return true;
            } else {
                message.error(response.message || 'DNS配置创建失败');
                return false;
            }
        } catch (error) {
            console.error('创建DNS配置失败:', error);
            message.error('创建DNS配置失败');
            return false;
        }
    };

    return (
        <div>
            {/* 查看JSON配置Modal */}
            <Modal
                title="查看配置参数"
                width={600}
                open={viewJsonModalVisible}
                onCancel={() => setViewJsonModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewJsonModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    overflow: 'auto',
                    maxHeight: '400px'
                }}>
                    {currentJsonData}
                </pre>
            </Modal>

            {/* 新增配置Modal */}
            <ModalForm
                title="新增DNS配置"
                width={600}
                open={createModalVisible}
                onOpenChange={setCreateModalVisible}
                onFinish={handleCreateConfig}
                modalProps={{
                    destroyOnHidden: true,
                }}
            >
                <ProFormText
                    name="configName"
                    label="配置名"
                    placeholder="请输入配置名"
                    rules={[{ required: true, message: '配置名为必填项' }]}
                />
                <ProFormSelect
                    name="provider"
                    label="DNS Provider"
                    placeholder="请选择DNS Provider"
                    options={dnsProviderOptions}
                    rules={[{ required: true, message: 'DNS Provider为必填项' }]}
                    initialValue="CLOUDFLARE"
                />
                <ProFormText
                    name="domain"
                    label="Domain"
                    placeholder="请输入域名"
                    rules={[{ required: true, message: 'Domain为必填项' }]}
                />
                
                {/* 动态配置字段 */}
                <ProFormDependency name={['provider']}>
                    {({ provider }) => {
                        if (provider === 'CLOUDFLARE') {
                            return (
                                <>
                                    <ProFormText
                                        name="email"
                                        label="Email"
                                        placeholder="请输入Cloudflare账户邮箱"
                                        rules={[{ required: true, message: 'Email为必填项' }]}
                                    />
                                    <ProFormText
                                        name="zoneId"
                                        label="Zone ID"
                                        placeholder="请输入Zone ID"
                                        rules={[{ required: true, message: 'Zone ID为必填项' }]}
                                    />
                                    <ProFormText
                                        name="apiToken"
                                        label="API Token"
                                        placeholder="请输入API Token"
                                        rules={[{ required: true, message: 'API Token为必填项' }]}
                                        fieldProps={{
                                            type: 'password'
                                        }}
                                    />
                                </>
                            );
                        } else {
                            return (
                                <ProFormTextArea
                                    name="configParams"
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
                    await loadDnsConfigs(values);
                    message.success('查询成功');
                }}
            >
                <ProFormText name="configName" label="配置名" colProps={{ span: 8 }} />
                <ProFormSelect 
                    name="provider" 
                    label="DNS Provider" 
                    colProps={{ span: 8 }}
                    options={dnsProviderOptions}
                    placeholder="请选择DNS Provider"
                />
            </QueryFilter>

            <EditableProTable<DnsConfigItem>
                rowKey="id"
                headerTitle="DNS配置列表"
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
                            loadDnsConfigs();
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
                    editableKeys,
                    onSave: async (key, record) => {
                        try {
                            // 现在都是更新记录，因为新建记录通过Modal处理
                            const response = await dnsConfigService.updateDnsConfig(record.id, record);
                            if (response.success) {
                                message.success('DNS配置更新成功');
                                loadDnsConfigs();
                            } else {
                                message.error(response.message || 'DNS配置更新失败');
                            }
                        } catch (error) {
                            console.error('保存失败:', error);
                            message.error('保存失败');
                        }
                    },
                    onDelete: async (key, record) => {
                        try {
                            const response = await dnsConfigService.deleteDnsConfig(record.id);
                            if (response.success) {
                                message.success('DNS配置删除成功');
                                loadDnsConfigs();
                            } else {
                                message.error(response.message || 'DNS配置删除失败');
                            }
                        } catch (error) {
                            console.error('删除失败:', error);
                        }
                    },
                    onValuesChange: (record, recordList) => {
                        setDataSource(recordList);
                    },
                    deleteText: '删除',
                    deletePopconfirmMessage: '确定删除这条记录吗？',
                    onlyOneLineEditorAlertMessage: '只能同时编辑一行记录',
                    onlyAddOneLineAlertMessage: '只能同时新增一行记录',
                    actionRender: (row, config, dom) => [dom.save, dom.cancel, dom.delete],
                    onChange: setEditableKeys,
                }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
                    onChange: (page, pageSize) => {
                        loadDnsConfigs({ page, pageSize });
                    },
                }}
            />
        </div>
    );
};

export default DnsConfig; 