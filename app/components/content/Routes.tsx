/**
 * 优化后的路由管理组件
 * 集成了原版本的完整功能和优化版本的最佳实践
 */

import React, { useState, useMemo } from 'react';
import { Button, Tag, Popconfirm, Tooltip, Space, Card, Typography, Collapse, Input, Modal } from 'antd';
import { handleApiResponse, message } from '@/utils/message';
import { routeService, RouteItem, CreateRouteData, UpdateRouteData } from '@/services/routes';
import { 
  RouteType, 
  Protocol, 
  ShadowsocksMethod, 
  SnellVersion,
  ProtocolParams,
} from '@/types/generated/model/route';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    ProFormDependency,
    ProFormGroup,
    ProFormCheckbox,
    ModalForm,
    ProFormDigit,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { 
    PlusOutlined, 
    EditOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
    CopyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    EyeOutlined,
} from '@ant-design/icons';
import { useApi } from '@/shared/hooks';
import { securityUtils } from '@/shared/utils';

const { Title } = Typography;

// 协议配置常量
const PROTOCOL_OPTIONS = [
    { label: 'Shadowsocks', value: Protocol.PROTOCOL_SHADOWSOCKS },
    { label: 'Snell', value: Protocol.PROTOCOL_SNELL },
];

const SHADOWSOCKS_METHOD_OPTIONS = [
    { label: 'AES-128-GCM', value: ShadowsocksMethod.SHADOWSOCKS_METHOD_AES_128_GCM },
    { label: 'AES-256-GCM', value: ShadowsocksMethod.SHADOWSOCKS_METHOD_AES_256_GCM },
    { label: 'ChaCha20-IETF-Poly1305', value: ShadowsocksMethod.SHADOWSOCKS_METHOD_CHACHA20_IETF_POLY1305 },
];

const SNELL_VERSION_OPTIONS = [
    { label: 'v4 (稳定版)', value: SnellVersion.SNELL_VERSION_V4 },
    { label: 'v5 (最新版)', value: SnellVersion.SNELL_VERSION_V5 }
];

// 工具函数
const getProtocolDisplayName = (protocol?: Protocol): string => {
    switch (protocol) {
        case Protocol.PROTOCOL_SHADOWSOCKS:
            return 'Shadowsocks';
        case Protocol.PROTOCOL_SNELL:
            return 'Snell';
        default:
            return '未知';
    }
};

const getProtocolPassword = (protocolParams?: ProtocolParams): string => {
    return protocolParams?.shadowsocks?.password || protocolParams?.snell?.psk || '';
};

const getUdpSupport = (protocolParams?: ProtocolParams): boolean => {
    return protocolParams?.shadowsocks?.udpSupport || protocolParams?.snell?.udpSupport || false;
};

const getTcpFastOpen = (protocolParams?: ProtocolParams): boolean => {
    return protocolParams?.shadowsocks?.tcpFastOpen || protocolParams?.snell?.tcpFastOpen || false;
};

const getOtherParams = (protocolParams?: ProtocolParams): string => {
    if (protocolParams?.shadowsocks?.otherParams) {
        return protocolParams.shadowsocks.otherParams;
    }
    if (protocolParams?.snell?.otherParams) {
        return protocolParams.snell.otherParams;
    }
    return '{}';
};

const Routes: React.FC = () => {
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<RouteItem | null>(null);
    const [jsonViewVisible, setJsonViewVisible] = useState(false);
    const [currentJsonData, setCurrentJsonData] = useState<string>('');

    // 懒加载 Form 实例
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // 使用优化后的API Hook
    const {
        data: routesData,
        loading,
        refetch
    } = useApi(async () => {
        const [customResponse, systemResponse] = await Promise.all([
            routeService.getRouteList({ type: RouteType.ROUTE_TYPE_CUSTOM }),
            routeService.getRouteList({ type: RouteType.ROUTE_TYPE_SYSTEM })
        ]);

        return {
            success: true,
            data: {
                custom: customResponse.success ? customResponse.data || [] : [],
                system: systemResponse.success ? systemResponse.data || [] : []
            },
            message: 'success'
        };
    }, [], {
        immediate: true,
        // onError: (error) => // handleDataResponse.error('加载线路数据', error)
    });

    // 处理数据，分离自定义和系统路由
    const { customDataSource, systemDataSource } = useMemo(() => {
        const data = routesData || { custom: [], system: [] };
        return {
            customDataSource: data.custom,
            systemDataSource: data.system
        };
    }, [routesData]);

    // 生成并设置随机密码
    const generateAndSetPassword = (fieldName: string, minLength: number, maxLength: number, successMessage: string, targetForm?: any) => {
        const currentForm = targetForm || form;
        return securityUtils.generateAndSetFormPassword(currentForm, fieldName, minLength, maxLength, successMessage);
    };

    // 复制整行数据
    const copyRouteData = (record: RouteItem) => {
        const textToCopy = `${record.routeId} - ${record.routeName} (${record.entryPoint}:${record.port})`;
        navigator.clipboard.writeText(textToCopy);
        message.success('线路信息已复制到剪贴板');
    };

    // 查看JSON数据
    const viewJsonData = (jsonString: string) => {
        setCurrentJsonData(jsonString);
        setJsonViewVisible(true);
    };

    // 删除线路
    const deleteRoute = async (record: RouteItem) => {
        try {
            const response = await routeService.deleteRoute(record.id);
            if (response.success) {
                message.success(`已删除线路: ${record.routeName}`);
                refetch();
            } else {
                // handleDataResponse.userAction('删除线路', false, response);
            }
        } catch (error) {
            // handleDataResponse.userAction('删除线路', false, undefined, error);
        }
    };

    // 打开编辑模态框
    const openEditModal = (record: RouteItem) => {
        setEditingRecord(record);
        
        // 根据协议设置表单初始值
        const formValues: any = {
            routeId: record.routeId,
            routeName: record.routeName,
            entryPoint: record.entryPoint,
            port: record.port,
            protocol: record.protocol,
            description: record.description,
        };

        // 设置协议特定参数
        if (record.protocol === Protocol.PROTOCOL_SHADOWSOCKS && record.protocolParams?.shadowsocks) {
            const shadowsocks = record.protocolParams.shadowsocks;
            formValues.method = shadowsocks.method;
            formValues.password = shadowsocks.password;
            formValues.udpSupport = shadowsocks.udpSupport;
            formValues.tcpFastOpen = shadowsocks.tcpFastOpen;
            formValues.otherParams = shadowsocks.otherParams;
        }

        if (record.protocol === Protocol.PROTOCOL_SNELL && record.protocolParams?.snell) {
            const snell = record.protocolParams.snell;
            formValues.snellVersion = snell.version;
            formValues.psk = snell.psk;
            formValues.udpSupport = snell.udpSupport;
            formValues.tcpFastOpen = snell.tcpFastOpen;
            formValues.otherParams = snell.otherParams;
        }

        editForm.setFieldsValue(formValues);
        setEditModalVisible(true);
    };

    // 处理编辑线路提交
    const handleEditRoute = async (values: any) => {
        if (!editingRecord) return false;
        
        try {
            // 构建协议参数
            const protocolParams: ProtocolParams = {};
            
            if (values.protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                protocolParams.shadowsocks = {
                    method: values.method,
                    password: values.password,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            } else if (values.protocol === Protocol.PROTOCOL_SNELL) {
                protocolParams.snell = {
                    version: values.snellVersion,
                    psk: values.password || values.psk,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            }
            
            const updateData: UpdateRouteData = {
                routeId: values.routeId,
                routeName: values.routeName,
                entryPoint: values.entryPoint,
                port: values.port,
                protocol: values.protocol,
                protocolParams: protocolParams,
                description: values.description,
            };

            const response = await routeService.updateRoute(editingRecord.id, updateData);
            if (response.success) {
                // handleDataResponse.userAction('线路更新', true);
                setEditingRecord(null);
                refetch();
                return true;
            } else {
                // handleDataResponse.error('线路更新失败', response.message);
                return false;
            }
        } catch (error) {
            // handleDataResponse.error('线路更新', error);
            return false;
        }
    };

    // 处理创建线路提交
    const handleCreateRoute = async (values: any) => {
        try {
            // 构建协议参数
            const protocolParams: ProtocolParams = {};
            
            if (values.protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                protocolParams.shadowsocks = {
                    method: values.method,
                    password: values.password,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            } else if (values.protocol === Protocol.PROTOCOL_SNELL) {
                protocolParams.snell = {
                    version: values.snellVersion,
                    psk: values.password,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            }

            const createData: CreateRouteData = {
                routeId: values.routeId,
                routeName: values.routeName,
                entryPoint: values.entryPoint,
                port: values.port || (values.protocol === Protocol.PROTOCOL_SHADOWSOCKS ? 8388 : 6333),
                protocol: values.protocol,
                protocolParams: protocolParams,
                description: values.description,
            };

            const response = await routeService.createRoute(createData);
            if (response.success) {
                message.success('线路创建成功');
                refetch();
                return true;
            } else {
                // handleDataResponse.error('线路创建失败', response.message);
                return false;
            }
        } catch (error) {
            // handleDataResponse.error('线路创建', error);
            return false;
        }
    };

    // 生成表格列配置
    const generateColumns = (isEditable: boolean): ProColumns<RouteItem>[] => [
        {
            title: '线路ID',
            dataIndex: 'routeId',
            width: '12%',
        },
        {
            title: '线路名',
            dataIndex: 'routeName',
            width: '15%',
        },
        {
            title: '入口(IP或域名)',
            dataIndex: 'entryPoint',
            width: '20%',
        },
        {
            title: '协议',
            dataIndex: 'protocol',
            width: '12%',
            render: (_, record: RouteItem) => (
                <Tag color={record.protocol === Protocol.PROTOCOL_SHADOWSOCKS ? 'blue' : 'purple'}>
                    {getProtocolDisplayName(record.protocol)}
                </Tag>
            ),
        },
        {
            title: 'UDP支持',
            dataIndex: 'protocolParams',
            width: '10%',
            render: (_, record: RouteItem) => (
                <Tag color={getUdpSupport(record.protocolParams) ? 'success' : 'default'}>
                    {getUdpSupport(record.protocolParams) ? '是' : '否'}
                </Tag>
            ),
        },
        {
            title: 'TCP Fast Open支持',
            dataIndex: 'protocolParams',
            width: '15%',
            render: (_, record: RouteItem) => (
                <Tag color={getTcpFastOpen(record.protocolParams) ? 'success' : 'default'}>
                    {getTcpFastOpen(record.protocolParams) ? '是' : '否'}
                </Tag>
            ),
        },
        {
            title: '密码',
            dataIndex: 'protocolParams',
            width: '15%',
            render: (_, record: RouteItem) => (
                <Input.Password 
                    value={getProtocolPassword(record.protocolParams)} 
                    readOnly 
                    size="small"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{ width: '120px' }}
                />
            ) as any,
        },
        {
            title: '其他协议参数',
            dataIndex: 'protocolParams',
            width: '20%',
            render: (_, record: RouteItem) => {
                const params = getOtherParams(record.protocolParams);
                return (
                    <Space>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {params && params.length > 30 ? `${params.substring(0, 30)}...` : params}
                        </span>
                        <Tooltip title="查看JSON">
                            <Button 
                                type="text" 
                                size="small" 
                                icon={<EyeOutlined />}
                                onClick={() => viewJsonData(params)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
        {
            title: '操作',
            valueType: 'option' as const,
            width: '15%',
            render: (_: any, record: RouteItem) => [
                <Tooltip key="copy" title="复制">
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyRouteData(record)}
                    >
                        复制
                    </Button>
                </Tooltip>,
                ...(isEditable ? [
                    <Tooltip key="edit" title="编辑">
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                        >
                            编辑
                        </Button>
                    </Tooltip>,
                    <Popconfirm
                        key="delete"
                        title="确定要删除此线路吗？"
                        onConfirm={() => deleteRoute(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <Button 
                                type="text" 
                                size="small" 
                                danger
                                icon={<DeleteOutlined />}
                            >
                                删除
                            </Button>
                        </Tooltip>
                    </Popconfirm>,
                ] : []),
            ],
        },
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            {/* 自定义线路配置 */}
            <Card 
                title={<Title level={4} style={{ margin: 0 }}>自定义线路配置</Title>} 
                style={{ marginBottom: '24px' }}
            >
                <EditableProTable<RouteItem>
                    rowKey="id"
                    headerTitle="自定义线路列表"
                    maxLength={50}
                    scroll={{ x: 'max-content' }}
                    recordCreatorProps={false}
                    loading={loading}
                    toolBarRender={() => [
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalVisible(true)}
                            type="primary"
                        >
                            新增线路
                        </Button>,
                    ]}
                    columns={generateColumns(true)}
                    request={async () => ({
                        data: customDataSource,
                        total: customDataSource.length,
                        success: true,
                    })}
                    value={customDataSource}
                    onChange={(value) => {
                        // This is for local editing, actual changes go through API
                        console.log('Table data changed:', value);
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys: [],
                        onSave: async () => false,
                        onChange: () => {},
                        actionRender: () => [],
                    }}
                />
            </Card>

            {/* 系统生成线路 */}
            <Card>
                <Collapse 
                    defaultActiveKey={[]}
                    style={{ backgroundColor: 'transparent' }}
                    items={[
                        {
                            key: '1',
                            label: <Title level={4} style={{ margin: 0 }}>系统生成线路 ({systemDataSource.length}条)</Title>,
                            style: { padding: 0 },
                            children: (
                                <div style={{ paddingTop: '16px' }}>
                                    <EditableProTable<RouteItem>
                                        rowKey="id"
                                        maxLength={50}
                                        scroll={{ x: 'max-content' }}
                                        recordCreatorProps={false}
                                        loading={loading}
                                        search={false}
                                        options={false}
                                        columns={generateColumns(false)}
                                        request={async () => ({
                                            data: systemDataSource,
                                            total: systemDataSource.length,
                                            success: true,
                                        })}
                                        value={systemDataSource}
                                        editable={{
                                            type: 'multiple',
                                            editableKeys: [],
                                            onSave: async () => false,
                                            onChange: () => {},
                                            actionRender: () => [],
                                        }}
                                    />
                                </div>
                            )
                        }
                    ]}
                />
            </Card>

            {/* 创建线路的模态表单 */}
            <ModalForm
                title="新增线路"
                width={600}
                open={createModalVisible}
                onOpenChange={setCreateModalVisible}
                onFinish={handleCreateRoute}
                modalProps={{
                    destroyOnHidden: true,
                    onCancel: () => setCreateModalVisible(false),
                }}
                form={form}
            >
                <ProFormText
                    name="routeId"
                    label="线路ID"
                    placeholder="请输入线路ID，不填将自动生成"
                />
                
                <ProFormText
                    name="routeName"
                    label="线路名"
                    placeholder="请输入线路名称"
                    rules={[{ required: true, message: '请输入线路名称' }]}
                />
                
                <ProFormText
                    name="entryPoint"
                    label="入口(IP或域名)"
                    placeholder="请输入服务器IP地址或域名"
                    rules={[{ required: true, message: '请输入服务器IP地址或域名' }]}
                />

                <ProFormDigit
                    name="port"
                    label="端口"
                    placeholder="请输入端口号"
                    min={1}
                    max={65535}
                    rules={[
                        { required: true, message: '请输入端口号' },
                        { 
                            validator: (_: any, value: any) => {
                                if (value && (value < 1 || value > 65535)) {
                                    return Promise.reject(new Error('端口范围必须在 1-65535 之间'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                />
                
                <ProFormSelect
                    name="protocol"
                    label="协议"
                    options={PROTOCOL_OPTIONS}
                    rules={[{ required: true, message: '请选择协议' }]}
                />
                
                <ProFormDependency name={['protocol']}>
                    {({ protocol }) => {
                        if (protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="method"
                                        label="加密方法"
                                        options={SHADOWSOCKS_METHOD_OPTIONS}
                                        rules={[{ required: true, message: '请选择加密方法' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        if (protocol === Protocol.PROTOCOL_SNELL) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={SNELL_VERSION_OPTIONS}
                                        initialValue={SnellVersion.SNELL_VERSION_V4}
                                        rules={[{ required: true, message: '请选择协议版本' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        return null;
                    }}
                </ProFormDependency>

                <ProFormCheckbox name="udpSupport" label="UDP支持">
                    启用UDP支持
                </ProFormCheckbox>

                <ProFormCheckbox name="tcpFastOpen" label="TCP Fast Open支持">
                    启用TCP Fast Open
                </ProFormCheckbox>
                
                <ProFormText.Password
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                    fieldProps={{
                        addonAfter: (
                            <Tooltip title="生成64-128位随机密码">
                                <Button 
                                    type="text" 
                                    icon={<ThunderboltOutlined />}
                                    onClick={() => generateAndSetPassword('password', 64, 128, '已生成随机密码')}
                                    size="small"
                                />
                            </Tooltip>
                        )
                    }}
                    extra="建议使用生成的随机密码以确保安全性"
                />

                <ProFormTextArea
                    name="otherParams"
                    label="其他协议参数"
                    placeholder='请输入JSON格式的其他参数，例如: {"timeout": 300}'
                    rules={[
                        {
                            validator: (_: any, value: any) => {
                                if (value) {
                                    try {
                                        JSON.parse(value);
                                        return Promise.resolve();
                                    } catch {
                                        return Promise.reject(new Error('请输入有效的JSON格式'));
                                    }
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    fieldProps={{
                        rows: 3,
                    }}
                />

                <ProFormTextArea
                    name="description"
                    label="线路描述"
                    placeholder="请输入线路描述（可选）"
                    fieldProps={{
                        rows: 2,
                    }}
                />
            </ModalForm>

            {/* 编辑线路的模态表单 */}
            <ModalForm
                title="编辑线路"
                width={600}
                open={editModalVisible}
                onOpenChange={setEditModalVisible}
                onFinish={handleEditRoute}
                modalProps={{
                    destroyOnHidden: true,
                    onCancel: () => {
                        setEditModalVisible(false);
                        setEditingRecord(null);
                        editForm.resetFields();
                    },
                }}
                form={editForm}
            >
                <ProFormText
                    name="routeId"
                    label="线路ID"
                    placeholder="请输入线路ID"
                    rules={[{ required: true, message: '请输入线路ID' }]}
                />
                
                <ProFormText
                    name="routeName"
                    label="线路名"
                    placeholder="请输入线路名称"
                    rules={[{ required: true, message: '请输入线路名称' }]}
                />
                
                <ProFormText
                    name="entryPoint"
                    label="入口(IP或域名)"
                    placeholder="请输入服务器IP地址或域名"
                    rules={[{ required: true, message: '请输入服务器IP地址或域名' }]}
                />

                <ProFormDigit
                    name="port"
                    label="端口"
                    placeholder="请输入端口号"
                    min={1}
                    max={65535}
                    rules={[
                        { required: true, message: '请输入端口号' },
                        { 
                            validator: (_: any, value: any) => {
                                if (value && (value < 1 || value > 65535)) {
                                    return Promise.reject(new Error('端口范围必须在 1-65535 之间'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                />
                
                <ProFormSelect
                    name="protocol"
                    label="协议"
                    options={PROTOCOL_OPTIONS}
                    rules={[{ required: true, message: '请选择协议' }]}
                />
                
                <ProFormDependency name={['protocol']}>
                    {({ protocol }) => {
                        if (protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="method"
                                        label="加密方法"
                                        options={SHADOWSOCKS_METHOD_OPTIONS}
                                        rules={[{ required: true, message: '请选择加密方法' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        if (protocol === Protocol.PROTOCOL_SNELL) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={SNELL_VERSION_OPTIONS}
                                        rules={[{ required: true, message: '请选择协议版本' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        return null;
                    }}
                </ProFormDependency>

                <ProFormCheckbox name="udpSupport" label="UDP支持">
                    启用UDP支持
                </ProFormCheckbox>

                <ProFormCheckbox name="tcpFastOpen" label="TCP Fast Open支持">
                    启用TCP Fast Open
                </ProFormCheckbox>
                
                <ProFormText.Password
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                    fieldProps={{
                        addonAfter: (
                            <Tooltip title="生成64-128位随机密码">
                                <Button 
                                    type="text" 
                                    icon={<ThunderboltOutlined />}
                                    onClick={() => generateAndSetPassword('password', 64, 128, '已生成随机密码', editForm)}
                                    size="small"
                                />
                            </Tooltip>
                        )
                    }}
                    extra="建议使用生成的随机密码以确保安全性"
                />

                <ProFormTextArea
                    name="otherParams"
                    label="其他协议参数"
                    placeholder='请输入JSON格式的其他参数，例如: {"timeout": 300}'
                    rules={[
                        {
                            validator: (_: any, value: any) => {
                                if (value) {
                                    try {
                                        JSON.parse(value);
                                        return Promise.resolve();
                                    } catch {
                                        return Promise.reject(new Error('请输入有效的JSON格式'));
                                    }
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    fieldProps={{
                        rows: 3,
                    }}
                />

                <ProFormTextArea
                    name="description"
                    label="线路描述"
                    placeholder="请输入线路描述（可选）"
                    fieldProps={{
                        rows: 2,
                    }}
                />
            </ModalForm>

            {/* 查看JSON的模态框 */}
            <Modal
                title="查看协议参数"
                open={jsonViewVisible}
                onCancel={() => setJsonViewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setJsonViewVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={600}
            >
                <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    maxHeight: '400px',
                    overflow: 'auto'
                }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {(() => {
                            try {
                                return JSON.stringify(JSON.parse(currentJsonData || '{}'), null, 2);
                            } catch {
                                return currentJsonData || '{}';
                            }
                        })()}
                    </pre>
                </div>
            </Modal>
        </div>
    );
};

export default React.memo(Routes);
