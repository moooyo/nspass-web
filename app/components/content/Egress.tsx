import React, { useState } from 'react';
import { Button, Tag, Popconfirm, Tooltip, Space } from 'antd';
import { message } from '@/utils/message';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    ProFormDependency,
    ProFormGroup,
    ProFormCheckbox,
    ModalForm,
    QueryFilter,
} from '@ant-design/pro-components';
import { Form, FormInstance } from 'antd';
import { 
    PlusOutlined, 
    EditOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';

// 服务器选项
const serverOptions = [
    { label: '服务器01', value: 'server01' },
    { label: '服务器02', value: 'server02' },
    { label: '服务器03', value: 'server03' },
];

// 出口模式选项
const egressModeOptions = [
    { label: '直出', value: 'direct' },
    { label: 'iptables', value: 'iptables' },
    { label: 'shadowsocks-2022', value: 'ss2022' },
    { label: 'Snell Surge', value: 'snell' },
];

// 转发类型选项
const forwardTypeOptions = [
    { label: 'TCP', value: 'tcp' },
    { label: 'UDP', value: 'udp' },
    { label: '全部', value: 'all' },
];

type EgressItem = {
    id: React.Key;
    egressId: string;
    serverId: string;
    egressMode: 'direct' | 'iptables' | 'ss2022' | 'snell';
    egressConfig: string;
    
    // 直出模式字段
    targetAddress?: string;
    
    // iptables模式字段
    forwardType?: 'tcp' | 'udp' | 'all';
    destAddress?: string;
    destPort?: string;
    
    // shadowsocks-2022模式字段
    password?: string;
    supportUdp?: boolean;
    
    // Snell模式字段
    snellAddress?: string;
    snellPort?: string;
    snellPsk?: string;
    snellVersion?: '4' | '5';
};

const defaultData: EgressItem[] = [
    {
        id: 1,
        egressId: 'egress001',
        serverId: 'server01',
        egressMode: 'direct',
        egressConfig: '目的地址: 203.0.113.1',
        targetAddress: '203.0.113.1',
    },
    {
        id: 2,
        egressId: 'egress002',
        serverId: 'server01',
        egressMode: 'iptables',
        egressConfig: 'TCP转发至 192.168.1.1:8080',
        forwardType: 'tcp',
        destAddress: '192.168.1.1',
        destPort: '8080',
    },
    {
        id: 3,
        egressId: 'egress003',
        serverId: 'server02',
        egressMode: 'iptables',
        egressConfig: '全部转发至 10.0.0.1:443',
        forwardType: 'all',
        destAddress: '10.0.0.1',
        destPort: '443',
    },
    {
        id: 4,
        egressId: 'egress004',
        serverId: 'server03',
        egressMode: 'ss2022',
        egressConfig: 'Shadowsocks-2022，支持UDP',
        password: 'password123',
        supportUdp: true,
    },
    {
        id: 5,
        egressId: 'egress005',
        serverId: 'server02',
        egressMode: 'snell',
        egressConfig: 'Snell v4: 1.2.3.4:6333',
        snellAddress: '1.2.3.4',
        snellPort: '6333',
        snellPsk: 'UzJr9mX8qN5vL1pAe3tK7wC6hF2dY4nB9sM1xQ8vR6uJ3lO5pT',
        snellVersion: '4',
    },
    {
        id: 6,
        egressId: 'egress006',
        serverId: 'server03',
        egressMode: 'snell',
        egressConfig: 'Snell v5: 2.3.4.5:8443',
        snellAddress: '2.3.4.5',
        snellPort: '8443',
        snellPsk: 'Xt9mQ2vL7cF5nA8pK1eH4wD6sJ3gR9uY5tM2xV8zN1qB7lO3pI',
        snellVersion: '5',
    },
];

const Egress: React.FC = () => {
    const [dataSource, setDataSource] = useState<EgressItem[]>(defaultData);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<EgressItem | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // 生成随机密码函数
    const generateRandomPassword = (minLength: number = 100, maxLength: number = 128): string => {
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

    // 删除出口
    const deleteEgress = (record: EgressItem) => {
        setDataSource(dataSource.filter(item => item.id !== record.id));
        message.success(`已删除出口: ${record.egressId}`);
    };

    // 打开编辑模态框
    const openEditModal = (record: EgressItem) => {
        setEditingRecord(record);
        // 设置表单值
        editForm.setFieldsValue({
            egressId: record.egressId,
            serverId: record.serverId,
            egressMode: record.egressMode,
            // 根据模式设置对应字段
            ...(record.egressMode === 'direct' && { targetAddress: record.targetAddress }),
            ...(record.egressMode === 'iptables' && { 
                forwardType: record.forwardType,
                destAddress: record.destAddress,
                destPort: record.destPort,
            }),
            ...(record.egressMode === 'ss2022' && { 
                password: record.password,
                supportUdp: record.supportUdp,
            }),
            ...(record.egressMode === 'snell' && { 
                snellAddress: record.snellAddress,
                snellPort: record.snellPort,
                snellPsk: record.snellPsk,
                snellVersion: record.snellVersion,
            }),
        });
        setEditModalVisible(true);
    };

    // 处理编辑出口提交
    const handleEditEgress = async (values: EgressItem) => {
        console.log('编辑出口表单提交:', values);
        
        if (!editingRecord) return false;
        
        // 构建配置字符串
        let egressConfig = '';
        
        switch (values.egressMode) {
            case 'direct':
                egressConfig = `目的地址: ${values.targetAddress}`;
                break;
            case 'iptables':
                const forwardTypeText = values.forwardType === 'tcp' ? 'TCP' : 
                                       values.forwardType === 'udp' ? 'UDP' : '全部';
                egressConfig = `${forwardTypeText}转发至 ${values.destAddress}:${values.destPort}`;
                break;
            case 'ss2022':
                egressConfig = `Shadowsocks-2022${values.supportUdp ? '，支持UDP' : ''}`;
                break;
            case 'snell':
                egressConfig = `Snell v${values.snellVersion || '4'}: ${values.snellAddress}:${values.snellPort}`;
                break;
            default:
                break;
        }

        const updatedEgress: EgressItem = {
            ...editingRecord,
            egressId: values.egressId || editingRecord.egressId,
            serverId: values.serverId,
            egressMode: values.egressMode,
            egressConfig,
            
            // 清空其他模式的字段并设置当前模式的字段
            targetAddress: undefined,
            forwardType: undefined,
            destAddress: undefined,
            destPort: undefined,
            password: undefined,
            supportUdp: undefined,
            snellAddress: undefined,
            snellPort: undefined,
            snellPsk: undefined,
            snellVersion: undefined,
            
            // 设置对应模式的字段
            ...(values.egressMode === 'direct' && { targetAddress: values.targetAddress }),
            ...(values.egressMode === 'iptables' && { 
                forwardType: values.forwardType,
                destAddress: values.destAddress,
                destPort: values.destPort,
            }),
            ...(values.egressMode === 'ss2022' && { 
                password: values.password,
                supportUdp: values.supportUdp,
            }),
            ...(values.egressMode === 'snell' && { 
                snellAddress: values.snellAddress,
                snellPort: values.snellPort,
                snellPsk: values.snellPsk,
                snellVersion: values.snellVersion || '4',
            }),
        };

        // 更新数据源
        setDataSource(dataSource.map(item => 
            item.id === editingRecord.id ? updatedEgress : item
        ));
        
        message.success('出口更新成功');
        setEditingRecord(null);
        return true; // 返回 true 关闭弹窗
    };

    // 处理新建出口提交
    const handleCreateEgress = async (values: EgressItem) => {
        console.log('创建出口表单提交:', values);
        
        // 构建配置字符串
        let egressConfig = '';
        
        switch (values.egressMode) {
            case 'direct':
                egressConfig = `目的地址: ${values.targetAddress}`;
                break;
            case 'iptables':
                const forwardTypeText = values.forwardType === 'tcp' ? 'TCP' : 
                                       values.forwardType === 'udp' ? 'UDP' : '全部';
                egressConfig = `${forwardTypeText}转发至 ${values.destAddress}:${values.destPort}`;
                break;
            case 'ss2022':
                egressConfig = `Shadowsocks-2022${values.supportUdp ? '，支持UDP' : ''}`;
                break;
            case 'snell':
                egressConfig = `Snell v${values.snellVersion || '4'}: ${values.snellAddress}:${values.snellPort}`;
                break;
            default:
                break;
        }

        const newEgress: EgressItem = {
            id: Date.now(),
            egressId: values.egressId || `egress${Date.now().toString().substr(-6)}`,
            serverId: values.serverId,
            egressMode: values.egressMode,
            egressConfig,
            
            // 复制对应模式的字段
            ...(values.egressMode === 'direct' && { targetAddress: values.targetAddress }),
            ...(values.egressMode === 'iptables' && { 
                forwardType: values.forwardType,
                destAddress: values.destAddress,
                destPort: values.destPort,
            }),
            ...(values.egressMode === 'ss2022' && { 
                password: values.password,
                supportUdp: values.supportUdp,
            }),
            ...(values.egressMode === 'snell' && { 
                snellAddress: values.snellAddress,
                snellPort: values.snellPort,
                snellPsk: values.snellPsk,
                snellVersion: values.snellVersion || '4',
            }),
        };

        setDataSource([...dataSource, newEgress]);
        message.success('出口创建成功');
        return true; // 返回 true 关闭弹窗
    };

    const columns: ProColumns<EgressItem>[] = [
        {
            title: '出口ID',
            dataIndex: 'egressId',
            formItemProps: {
                rules: [{ required: true, message: '出口ID为必填项' }],
            },
            width: '20%',
        },
        {
            title: '服务器ID',
            dataIndex: 'serverId',
            width: '20%',
            valueType: 'select',
            valueEnum: {
                server01: { text: '服务器01' },
                server02: { text: '服务器02' },
                server03: { text: '服务器03' },
            },
            formItemProps: {
                rules: [{ required: true, message: '服务器ID为必填项' }],
            },
            renderFormItem: () => (
                <ProFormSelect
                    name="serverId"
                    placeholder="请选择服务器"
                    options={serverOptions}
                    rules={[{ required: true, message: '服务器ID为必填项' }]}
                />
            ),
        },
        {
            title: '出口模式',
            dataIndex: 'egressMode',
            width: '20%',
            valueType: 'select',
            valueEnum: {
                direct: { text: '直出', status: 'Success' },
                iptables: { text: 'iptables', status: 'Processing' },
                ss2022: { text: 'shadowsocks-2022', status: 'Warning' },
                snell: { text: 'Snell Surge', status: 'Error' },
            },
            render: (_, record) => (
                <Tag color={
                    record.egressMode === 'direct' ? 'green' : 
                    record.egressMode === 'iptables' ? 'blue' : 
                    record.egressMode === 'ss2022' ? 'purple' :
                    record.egressMode === 'snell' ? 'magenta' :
                    'default'
                }>
                    {record.egressMode === 'direct' ? '直出' : 
                     record.egressMode === 'iptables' ? 'iptables' : 
                     record.egressMode === 'ss2022' ? 'shadowsocks-2022' :
                     record.egressMode === 'snell' ? 'Snell Surge' :
                     record.egressMode}
                </Tag>
            ),
        },
        {
            title: '出口配置',
            dataIndex: 'egressConfig',
            width: '30%',
            formItemProps: {
                rules: [{ required: true, message: '出口配置为必填项' }],
            },
        },
        {
            title: '操作',
            valueType: 'option',
            width: '10%',
            render: (_, record) => [
                <Tooltip key="edit" title="编辑">
                    <a onClick={() => openEditModal(record)}>
                        <Tag icon={<EditOutlined />} color="blue">编辑</Tag>
                    </a>
                </Tooltip>,
                <Popconfirm
                    key="delete"
                    title="确定要删除此出口吗？"
                    onConfirm={() => deleteEgress(record)}
                    okText="确定"
                    cancelText="取消"
                >
                    <Tooltip title="删除">
                        <a>
                            <Tag icon={<DeleteOutlined />} color="error">删除</Tag>
                        </a>
                    </Tooltip>
                </Popconfirm>,
            ],
        },
    ];

    return (
        <div>
            <QueryFilter
                defaultCollapsed
                split
                defaultColsNumber={3}
                onFinish={async (values) => {
                    console.log(values);
                    message.success('查询成功');
                }}
            >
                <ProFormText name="egressId" label="出口ID" colProps={{ span: 8 }} />
                <ProFormSelect 
                    name="serverId" 
                    label="服务器ID" 
                    colProps={{ span: 8 }}
                    options={serverOptions}
                />
                <ProFormSelect 
                    name="egressMode" 
                    label="出口模式" 
                    colProps={{ span: 8 }}
                    valueEnum={{
                        direct: { text: '直出' },
                        iptables: { text: 'iptables' },
                        ss2022: { text: 'shadowsocks-2022' },
                        snell: { text: 'Snell Surge' },
                    }}
                />
            </QueryFilter>

            <EditableProTable<EgressItem>
                rowKey="id"
                headerTitle="出口列表"
                maxLength={20}
                scroll={{ x: 'max-content' }}
                recordCreatorProps={false}
                loading={false}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                        type="primary"
                    >
                        新建出口
                    </Button>,
                ]}
                columns={columns}
                request={async () => ({
                    data: dataSource,
                    total: dataSource.length,
                    success: true,
                })}
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
            />

            {/* 创建出口的模态表单 */}
            <ModalForm
                title="新建出口"
                width={600}
                open={createModalVisible}
                onOpenChange={setCreateModalVisible}
                onFinish={handleCreateEgress}
                modalProps={{
                    destroyOnHidden: true,
                    onCancel: () => setCreateModalVisible(false),
                }}
                form={form}
            >
                <ProFormText
                    name="egressId"
                    label="出口ID"
                    placeholder="请输入出口ID，不填将自动生成"
                />
                
                <ProFormSelect
                    name="serverId"
                    label="服务器ID"
                    options={serverOptions}
                    rules={[{ required: true, message: '请选择服务器' }]}
                />
                
                <ProFormSelect
                    name="egressMode"
                    label="出口模式"
                    options={egressModeOptions}
                    rules={[{ required: true, message: '请选择出口模式' }]}
                />
                
                <ProFormDependency name={['egressMode']}>
                    {({ egressMode }) => {
                        // 直出模式
                        if (egressMode === 'direct') {
                            return (
                                <ProFormText
                                    name="targetAddress"
                                    label="目的地址"
                                    placeholder="请输入目的地址"
                                    rules={[{ required: true, message: '请输入目的地址' }]}
                                />
                            );
                        }
                        
                        // iptables模式
                        if (egressMode === 'iptables') {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="forwardType"
                                        label="转发类型"
                                        options={forwardTypeOptions}
                                        rules={[{ required: true, message: '请选择转发类型' }]}
                                    />
                                    <ProFormText
                                        name="destAddress"
                                        label="目的地址"
                                        placeholder="请输入目的地址"
                                        rules={[{ required: true, message: '请输入目的地址' }]}
                                    />
                                    <ProFormText
                                        name="destPort"
                                        label="目的端口"
                                        placeholder="请输入目的端口"
                                        rules={[{ required: true, message: '请输入目的端口' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        // shadowsocks-2022模式
                        if (egressMode === 'ss2022') {
                            return (
                                <ProFormGroup>
                                    <ProFormText.Password
                                        name="password"
                                        label="密码"
                                        placeholder="请输入密码"
                                        rules={[{ required: true, message: '请输入密码' }]}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成100-128位随机密码">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('password', 100, 128, '已生成随机密码')}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                        extra="建议使用生成的随机密码以确保安全性"
                                    />
                                    <ProFormCheckbox name="supportUdp" label="支持UDP">
                                        启用UDP支持
                                    </ProFormCheckbox>
                                </ProFormGroup>
                            );
                        }
                        
                        // Snell模式
                        if (egressMode === 'snell') {
                            return (
                                <ProFormGroup 
                                    title="Snell 配置"
                                    extra={
                                        <a 
                                            href="https://manual.nssurge.com/others/snell.html" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '12px' }}
                                        >
                                            查看文档
                                        </a>
                                    }
                                >
                                    <ProFormText
                                        name="snellAddress"
                                        label="服务器地址"
                                        placeholder="请输入服务器地址 (如: 1.2.3.4)"
                                        rules={[{ required: true, message: '请输入服务器地址' }]}
                                        tooltip="Snell 代理服务器的 IP 地址或域名"
                                    />
                                    <ProFormText
                                        name="snellPort"
                                        label="端口"
                                        placeholder="请输入端口 (如: 6333)"
                                        rules={[
                                            { required: true, message: '请输入端口' },
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
                                        tooltip="Snell 代理服务器的端口号"
                                    />
                                    <ProFormText.Password
                                        name="snellPsk"
                                        label="PSK (预共享密钥)"
                                        placeholder="请输入PSK密钥"
                                        rules={[{ required: true, message: '请输入PSK密钥' }]}
                                        tooltip="Snell 协议的预共享密钥，用于加密通信"
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成100-128位随机PSK密钥">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('snellPsk', 100, 128, '已生成随机PSK密钥')}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                        extra="建议使用生成的随机密钥以确保安全性"
                                    />
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={[
                                            { label: 'v4 (稳定版)', value: '4' },
                                            { label: 'v5 (最新版)', value: '5' }
                                        ]}
                                        initialValue="4"
                                        rules={[{ required: true, message: '请选择协议版本' }]}
                                        tooltip="Snell 协议版本，v4为稳定版本，v5为最新版本"
                                        placeholder="请选择协议版本"
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        return null;
                    }}
                </ProFormDependency>
            </ModalForm>

            {/* 编辑出口的模态表单 */}
            <ModalForm
                title="编辑出口"
                width={600}
                open={editModalVisible}
                onOpenChange={setEditModalVisible}
                onFinish={handleEditEgress}
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
                    name="egressId"
                    label="出口ID"
                    placeholder="请输入出口ID"
                    rules={[{ required: true, message: '出口ID为必填项' }]}
                />
                
                <ProFormSelect
                    name="serverId"
                    label="服务器ID"
                    options={serverOptions}
                    rules={[{ required: true, message: '请选择服务器' }]}
                />
                
                <ProFormSelect
                    name="egressMode"
                    label="出口模式"
                    options={egressModeOptions}
                    rules={[{ required: true, message: '请选择出口模式' }]}
                />
                
                <ProFormDependency name={['egressMode']}>
                    {({ egressMode }) => {
                        // 直出模式
                        if (egressMode === 'direct') {
                            return (
                                <ProFormText
                                    name="targetAddress"
                                    label="目的地址"
                                    placeholder="请输入目的地址"
                                    rules={[{ required: true, message: '请输入目的地址' }]}
                                />
                            );
                        }
                        
                        // iptables模式
                        if (egressMode === 'iptables') {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="forwardType"
                                        label="转发类型"
                                        options={forwardTypeOptions}
                                        rules={[{ required: true, message: '请选择转发类型' }]}
                                    />
                                    <ProFormText
                                        name="destAddress"
                                        label="目的地址"
                                        placeholder="请输入目的地址"
                                        rules={[{ required: true, message: '请输入目的地址' }]}
                                    />
                                    <ProFormText
                                        name="destPort"
                                        label="目的端口"
                                        placeholder="请输入目的端口"
                                        rules={[{ required: true, message: '请输入目的端口' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        // shadowsocks-2022模式
                        if (egressMode === 'ss2022') {
                            return (
                                <ProFormGroup>
                                    <ProFormText.Password
                                        name="password"
                                        label="密码"
                                        placeholder="请输入密码"
                                        rules={[{ required: true, message: '请输入密码' }]}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成100-128位随机密码">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('password', 100, 128, '已生成随机密码', editForm)}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                        extra="建议使用生成的随机密码以确保安全性"
                                    />
                                    <ProFormCheckbox name="supportUdp" label="支持UDP">
                                        启用UDP支持
                                    </ProFormCheckbox>
                                </ProFormGroup>
                            );
                        }
                        
                        // Snell模式
                        if (egressMode === 'snell') {
                            return (
                                <ProFormGroup 
                                    title="Snell 配置"
                                    extra={
                                        <a 
                                            href="https://manual.nssurge.com/others/snell.html" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '12px' }}
                                        >
                                            查看文档
                                        </a>
                                    }
                                >
                                    <ProFormText
                                        name="snellAddress"
                                        label="服务器地址"
                                        placeholder="请输入服务器地址 (如: 1.2.3.4)"
                                        rules={[{ required: true, message: '请输入服务器地址' }]}
                                        tooltip="Snell 代理服务器的 IP 地址或域名"
                                    />
                                    <ProFormText
                                        name="snellPort"
                                        label="端口"
                                        placeholder="请输入端口 (如: 6333)"
                                        rules={[
                                            { required: true, message: '请输入端口' },
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
                                        tooltip="Snell 代理服务器的端口号"
                                    />
                                    <ProFormText.Password
                                        name="snellPsk"
                                        label="PSK (预共享密钥)"
                                        placeholder="请输入PSK密钥"
                                        rules={[{ required: true, message: '请输入PSK密钥' }]}
                                        tooltip="Snell 协议的预共享密钥，用于加密通信"
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成100-128位随机PSK密钥">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('snellPsk', 100, 128, '已生成随机PSK密钥', editForm)}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                        extra="建议使用生成的随机密钥以确保安全性"
                                    />
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={[
                                            { label: 'v4 (稳定版)', value: '4' },
                                            { label: 'v5 (最新版)', value: '5' }
                                        ]}
                                        rules={[{ required: true, message: '请选择协议版本' }]}
                                        tooltip="Snell 协议版本，v4为稳定版本，v5为最新版本"
                                        placeholder="请选择协议版本"
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        return null;
                    }}
                </ProFormDependency>
            </ModalForm>
        </div>
    );
};

export default Egress; 