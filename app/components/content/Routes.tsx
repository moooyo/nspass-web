import React, { useState, useEffect } from 'react';
import { Button, Tag, Popconfirm, Tooltip, Space, Card, Typography, Collapse, Input, Modal } from 'antd';
import { message } from '@/utils/message';
import { routeService, RouteItem, CreateRouteData } from '@/services/routes';
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
    QueryFilter,
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

const { Title } = Typography;
const { Panel } = Collapse;

// 协议选项 - 只支持shadowsocks和snell
const protocolOptions = [
    { label: 'Shadowsocks', value: 'shadowsocks' },
    { label: 'Snell', value: 'snell' },
];

// RouteItem类型已从 @/services/routes 导入

// 默认自定义线路数据
const defaultCustomRoutes: RouteItem[] = [
    {
        id: 1,
        routeId: 'route001',
        routeName: '自定义线路01',
        entryPoint: '203.0.113.1',
        protocol: 'shadowsocks',
        udpSupport: true,
        tcpFastOpen: false,
        password: 'password123456',
        port: '8388',
        method: 'aes-256-gcm',
        otherParams: '{"timeout": 300, "fast_open": false}',
    },
    {
        id: 2,
        routeId: 'route002',
        routeName: '自定义线路02',
        entryPoint: 'example.com',
        protocol: 'snell',
        udpSupport: true,
        tcpFastOpen: true,
        password: 'snellpsk12345678',
        port: '6333',
        snellVersion: '4',
        otherParams: '{"obfs": "tls", "obfs_host": "bing.com"}',
    },
];

// 默认系统生成线路数据
const defaultSystemRoutes: RouteItem[] = [
    {
        id: 101,
        routeId: 'sys_route001',
        routeName: '系统线路01',
        entryPoint: '198.51.100.1',
        protocol: 'shadowsocks',
        udpSupport: true,
        tcpFastOpen: false,
        password: 'sys_password_001',
        port: '443',
        method: 'aes-256-gcm',
        otherParams: '{"timeout": 600, "fast_open": false}',
    },
    {
        id: 102,
        routeId: 'sys_route002',
        routeName: '系统线路02',
        entryPoint: '192.0.2.1',
        protocol: 'snell',
        udpSupport: false,
        tcpFastOpen: true,
        password: 'sys_snell_psk_002',
        port: '8443',
        snellVersion: '5',
        otherParams: '{"obfs": "http", "obfs_host": "microsoft.com"}',
    },
];

const Routes: React.FC = () => {
    const [customDataSource, setCustomDataSource] = useState<RouteItem[]>([]);
    const [systemDataSource, setSystemDataSource] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<RouteItem | null>(null);
    const [jsonViewVisible, setJsonViewVisible] = useState<boolean>(false);
    const [currentJsonData, setCurrentJsonData] = useState<string>('');
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // 加载线路数据
    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        setLoading(true);
        try {
            // 加载自定义线路
            const customResponse = await routeService.getRouteList({ type: 'custom' });
            if (customResponse.success && customResponse.data) {
                setCustomDataSource(customResponse.data);
            }

            // 加载系统线路
            const systemResponse = await routeService.getRouteList({ type: 'system' });
            if (systemResponse.success && systemResponse.data) {
                setSystemDataSource(systemResponse.data);
            }
        } catch (error) {
            console.error('加载线路数据失败:', error);
            message.error('加载线路数据失败');
        } finally {
            setLoading(false);
        }
    };

    // 生成随机密码函数
    const generateRandomPassword = (minLength: number = 64, maxLength: number = 128): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // 生成并设置随机密码
    const generateAndSetPassword = (fieldName: string, minLength: number, maxLength: number, successMessage: string, targetForm?: any) => {
        const randomPassword = generateRandomPassword(minLength, maxLength);
        const currentForm = targetForm || form;
        if (currentForm) {
            currentForm.setFieldsValue({ [fieldName]: randomPassword });
            message.success(`${successMessage} (${randomPassword.length}位)`);
        }
    };

    // 复制整行数据
    const copyRouteData = (record: RouteItem) => {
        // 这里后续会实现具体的复制逻辑
        message.success('复制成功');
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
                setCustomDataSource(customDataSource.filter(item => item.id !== record.id));
                message.success(`已删除线路: ${record.routeName}`);
            } else {
                message.error(response.message || '删除线路失败');
            }
        } catch (error) {
            console.error('删除线路失败:', error);
            message.error('删除线路失败');
        }
    };

    // 打开编辑模态框
    const openEditModal = (record: RouteItem) => {
        setEditingRecord(record);
        editForm.setFieldsValue({
            routeId: record.routeId,
            routeName: record.routeName,
            entryPoint: record.entryPoint,
            protocol: record.protocol,
            udpSupport: record.udpSupport,
            tcpFastOpen: record.tcpFastOpen,
            password: record.password,
            port: record.port,
            method: record.method,
            snellVersion: record.snellVersion,
            otherParams: record.otherParams,
        });
        setEditModalVisible(true);
    };

    // 处理编辑线路提交
    const handleEditRoute = async (values: RouteItem) => {
        console.log('编辑线路表单提交:', values);
        
        if (!editingRecord) return false;
        
        const updatedRoute: RouteItem = {
            ...editingRecord,
            routeId: values.routeId,
            routeName: values.routeName,
            entryPoint: values.entryPoint,
            protocol: values.protocol,
            udpSupport: values.udpSupport || false,
            tcpFastOpen: values.tcpFastOpen || false,
            password: values.password,
            port: values.port,
            method: values.method,
            snellVersion: values.snellVersion,
            otherParams: values.otherParams || '{}',
        };

        setCustomDataSource(customDataSource.map(item => 
            item.id === editingRecord.id ? updatedRoute : item
        ));
        
        message.success('线路更新成功');
        setEditingRecord(null);
        return true;
    };

    // 处理新建线路提交
    const handleCreateRoute = async (values: any) => {
        console.log('创建线路表单提交:', values);
        
        try {
            const createData: CreateRouteData = {
                routeId: values.routeId || `route${Date.now().toString().substr(-6)}`,
                routeName: values.routeName,
                entryPoint: values.entryPoint,
                protocol: values.protocol,
                udpSupport: values.udpSupport || false,
                tcpFastOpen: values.tcpFastOpen || false,
                password: values.password,
                port: values.port,
                method: values.method,
                snellVersion: values.snellVersion,
                otherParams: values.otherParams || '{}',
            };

            const response = await routeService.createRoute(createData);
            if (response.success && response.data) {
                setCustomDataSource([...customDataSource, response.data]);
                message.success('线路创建成功');
                return true;
            } else {
                message.error(response.message || '线路创建失败');
                return false;
            }
        } catch (error) {
            console.error('创建线路失败:', error);
            message.error('线路创建失败');
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
            render: (protocol) => (
                <Tag color={protocol === 'shadowsocks' ? 'blue' : 'purple'}>
                    {protocol === 'shadowsocks' ? 'Shadowsocks' : 'Snell'}
                </Tag>
            ),
        },
        {
            title: 'UDP支持',
            dataIndex: 'udpSupport',
            width: '10%',
            render: (udpSupport) => (
                <Tag color={udpSupport ? 'success' : 'default'}>
                    {udpSupport ? '是' : '否'}
                </Tag>
            ),
        },
        {
            title: 'TCP Fast Open支持',
            dataIndex: 'tcpFastOpen',
            width: '15%',
            render: (tcpFastOpen) => (
                <Tag color={tcpFastOpen ? 'success' : 'default'}>
                    {tcpFastOpen ? '是' : '否'}
                </Tag>
            ),
        },
        {
            title: '密码',
            dataIndex: 'password',
            width: '15%',
            render: (password) => (
                <Input.Password 
                    value={password as string} 
                    readOnly 
                    size="small"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{ width: '120px' }}
                />
            ) as any,
        },
        {
            title: '其他协议参数',
            dataIndex: 'otherParams',
            width: '20%',
            render: (params) => (
                <Space>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {params && typeof params === 'string' && params.length > 30 ? `${params.substring(0, 30)}...` : params}
                    </span>
                    <Tooltip title="查看JSON">
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => viewJsonData(params as string)}
                        />
                    </Tooltip>
                </Space>
            ),
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
                        setCustomDataSource([...value]);
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
                >
                    <Panel 
                        header={<Title level={4} style={{ margin: 0 }}>系统生成线路 ({systemDataSource.length}条)</Title>}
                        key="1"
                        style={{ padding: 0 }}
                    >
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
                    </Panel>
                </Collapse>
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

                <ProFormText
                    name="port"
                    label="端口"
                    placeholder="请输入端口号"
                    rules={[
                        { required: true, message: '请输入端口号' },
                        { pattern: /^\d+$/, message: '端口必须是数字' },
                        { 
                            validator: (_, value) => {
                                if (value && (parseInt(value) < 1 || parseInt(value) > 65535)) {
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
                    options={protocolOptions}
                    rules={[{ required: true, message: '请选择协议' }]}
                />
                
                <ProFormDependency name={['protocol']}>
                    {({ protocol }) => {
                        if (protocol === 'shadowsocks') {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="method"
                                        label="加密方法"
                                        options={[
                                            { label: 'aes-128-gcm', value: 'aes-128-gcm' },
                                            { label: 'aes-256-gcm', value: 'aes-256-gcm' },
                                            { label: 'chacha20-ietf-poly1305', value: 'chacha20-ietf-poly1305' },
                                        ]}
                                        rules={[{ required: true, message: '请选择加密方法' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        if (protocol === 'snell') {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={[
                                            { label: 'v4 (稳定版)', value: '4' },
                                            { label: 'v5 (最新版)', value: '5' }
                                        ]}
                                        initialValue="4"
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

                <ProFormText
                    name="port"
                    label="端口"
                    placeholder="请输入端口号"
                    rules={[
                        { required: true, message: '请输入端口号' },
                        { pattern: /^\d+$/, message: '端口必须是数字' },
                        { 
                            validator: (_, value) => {
                                if (value && (parseInt(value) < 1 || parseInt(value) > 65535)) {
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
                    options={protocolOptions}
                    rules={[{ required: true, message: '请选择协议' }]}
                />
                
                <ProFormDependency name={['protocol']}>
                    {({ protocol }) => {
                        if (protocol === 'shadowsocks') {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="method"
                                        label="加密方法"
                                        options={[
                                            { label: 'aes-128-gcm', value: 'aes-128-gcm' },
                                            { label: 'aes-256-gcm', value: 'aes-256-gcm' },
                                            { label: 'chacha20-ietf-poly1305', value: 'chacha20-ietf-poly1305' },
                                        ]}
                                        rules={[{ required: true, message: '请选择加密方法' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        if (protocol === 'snell') {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={[
                                            { label: 'v4 (稳定版)', value: '4' },
                                            { label: 'v5 (最新版)', value: '5' }
                                        ]}
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

export default Routes; 