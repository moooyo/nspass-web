import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Modal } from 'antd';
import { message } from '@/utils/message';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
    ModalForm,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import {
    dnsConfigService,
    DnsConfigItem,
    CreateDnsConfigData,
    DnsConfigListParams,
    dnsProviderConfigService,
    DnsProviderConfigItem
} from '../../../services/dnsConfig';

const DnsConfigTab: React.FC = () => {
    const [dataSource, setDataSource] = useState<DnsConfigItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<DnsConfigItem | null>(null);
    const [viewJsonModalVisible, setViewJsonModalVisible] = useState<boolean>(false);
    const [currentJsonData, setCurrentJsonData] = useState<string>('');
    const [providerConfigs, setProviderConfigs] = useState<DnsProviderConfigItem[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 加载DNS Provider配置列表（用于下拉选择）
    const loadProviderConfigs = useCallback(async () => {
        try {
            const response = await dnsProviderConfigService.getDnsProviderConfigs();
            if (response.success && response.data) {
                setProviderConfigs(response.data);
            }
        } catch (error) {
            console.error('加载DNS Provider配置失败:', error);
        }
    }, []);

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
                    setPagination(prev => ({
                        ...prev,
                        current: response.pagination?.current || 1,
                        total: response.pagination?.total || 0,
                    }));
                }
            } else {
                message.error(response.message || '获取DNS配置列表失败');
            }
        } catch (error) {
            console.error('加载DNS配置列表失败:', error);
            message.error('加载DNS配置列表失败');
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize]);

    // 初始化加载数据
    useEffect(() => {
        loadDnsConfigs();
        loadProviderConfigs();
    }, []);

    // 处理创建DNS配置
    const handleCreateDnsConfig = async (values: any) => {
        try {
            const data: CreateDnsConfigData = {
                configName: values.configName,
                providerId: values.providerId,
                domain: values.domain,
            };

            const response = await dnsConfigService.createDnsConfig(data);

            if (response.success) {
                message.success('DNS配置创建成功');
                setCreateModalVisible(false);
                loadDnsConfigs();
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

    // 打开编辑Modal
    const openEditModal = (record: DnsConfigItem) => {
        // 打开Modal前先刷新Provider配置列表
        loadProviderConfigs();
        setEditingRecord(record);
        setEditModalVisible(true);
    };

    // 处理编辑DNS配置
    const handleEditDnsConfig = async (values: any) => {
        try {
            if (!editingRecord?.id) {
                message.error('无法更新：缺少配置ID');
                return false;
            }

            const response = await dnsConfigService.updateDnsConfig(editingRecord.id, {
                providerId: values.providerId,
                domain: values.domain,
            });

            if (response.success) {
                message.success('DNS配置更新成功');
                setEditModalVisible(false);
                setEditingRecord(null);
                loadDnsConfigs();
                return true;
            } else {
                message.error(response.message || 'DNS配置更新失败');
                return false;
            }
        } catch (error) {
            console.error('更新DNS配置失败:', error);
            message.error('更新DNS配置失败');
            return false;
        }
    };

    // 查看JSON配置
    const handleViewJson = (record: DnsConfigItem) => {
        // 这里可以显示DNS配置的详细信息
        const configData = {
            id: record.id,
            domain: record.domain,
            providerId: record.providerId,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
        setCurrentJsonData(JSON.stringify(configData, null, 2));
        setViewJsonModalVisible(true);
    };

    // 获取Provider配置选项
    const providerConfigOptions = useMemo(() => {
        return providerConfigs.map(config => ({
            label: `${config.provider} (ID: ${config.id})`,
            value: config.id,
        }));
    }, [providerConfigs]);

    // 使用 useMemo 缓存表格列配置，避免每次渲染重新创建
    const columns: ProColumns<DnsConfigItem>[] = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '8%',
            editable: false,
        },
        {
            title: '域名',
            dataIndex: 'domain',
            width: '25%',
            editable: false,
        },
        {
            title: 'Provider ID',
            dataIndex: 'providerId',
            width: '15%',
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
            title: '更新时间',
            dataIndex: 'updatedAt',
            width: '15%',
            valueType: 'dateTime',
            editable: false,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '22%',
            render: (_, record) => [
                <a
                    key="editable"
                    onClick={() => openEditModal(record)}
                >
                    编辑
                </a>,
                <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewJson(record)}
                >
                    查看详情
                </Button>,
            ],
        },
    ], []);

    return (
        <div>
            {/* 查看配置详情的Modal */}
            <Modal
                title="DNS配置详情"
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
                    {currentJsonData}
                </pre>
            </Modal>

            {/* 创建DNS配置的Modal */}
            <ModalForm
                title="新增DNS配置"
                width="600px"
                open={createModalVisible}
                onOpenChange={setCreateModalVisible}
                onFinish={handleCreateDnsConfig}
                modalProps={{
                    destroyOnClose: true,
                }}
            >
                <ProFormText
                    name="configName"
                    label="配置名称"
                    rules={[{ required: true, message: '请输入配置名称' }]}
                    placeholder="请输入配置名称"
                />

                <ProFormSelect
                    name="providerId"
                    label={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>DNS Provider</span>
                            <Button
                                size="small"
                                icon={<ReloadOutlined />}
                                onClick={loadProviderConfigs}
                                title="刷新Provider列表"
                                style={{ border: 'none', padding: '0 4px' }}
                            />
                        </div>
                    }
                    options={providerConfigOptions}
                    rules={[{ required: true, message: '请选择DNS Provider' }]}
                    placeholder="请选择DNS Provider"
                />

                <ProFormText
                    name="domain"
                    label="域名"
                    rules={[{ required: true, message: '请输入域名' }]}
                    placeholder="请输入域名"
                />
            </ModalForm>

            {/* 编辑DNS配置的Modal */}
            <ModalForm
                title="编辑DNS配置"
                width="600px"
                open={editModalVisible}
                onOpenChange={setEditModalVisible}
                onFinish={handleEditDnsConfig}
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => {
                        setEditModalVisible(false);
                        setEditingRecord(null);
                    },
                }}
                initialValues={{
                    providerId: editingRecord?.providerId,
                    domain: editingRecord?.domain,
                }}
            >
                <ProFormSelect
                    name="providerId"
                    label={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>DNS Provider</span>
                            <Button
                                size="small"
                                icon={<ReloadOutlined />}
                                onClick={loadProviderConfigs}
                                title="刷新Provider列表"
                                style={{ border: 'none', padding: '0 4px' }}
                            />
                        </div>
                    }
                    options={providerConfigOptions}
                    rules={[{ required: true, message: '请选择DNS Provider' }]}
                    placeholder="请选择DNS Provider"
                />

                <ProFormText
                    name="domain"
                    label="域名"
                    rules={[{ required: true, message: '请输入域名' }]}
                    placeholder="请输入域名"
                />
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
                            // 打开Modal前先刷新Provider配置列表
                            loadProviderConfigs();
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
                    editableKeys: [],
                    onSave: async () => false,
                    onChange: () => {},
                    actionRender: () => [],
                }}
                pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => {
                        setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
                        loadDnsConfigs({ page, pageSize });
                    },
                }}
            />
        </div>
    );
};

export default DnsConfigTab;
