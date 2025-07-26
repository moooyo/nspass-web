import React, { useState, useCallback, useEffect } from 'react';
import { Button, Tag, Popconfirm, Tooltip } from 'antd';
import { message } from '@/utils/message';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    ProFormDigit,
    ProFormDependency,
    ProFormCheckbox,
    ModalForm,
    QueryFilter,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { 
    PlusOutlined, 
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { egressService, EgressItem, CreateEgressData, UpdateEgressData, EgressMode, ForwardType } from '@/services/egress';
import { serverService } from '@/services/server';
import type { ServerItem } from '@/types/generated/api/servers/server_management';
import { useApiOnce } from '@/components/hooks/useApiOnce';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { securityUtils } from '@/shared/utils';
import { generateRandomPort } from '@/utils/passwordUtils';

// 出口模式选项 - 使用新的枚举
const egressModeOptions = [
    { label: '直出', value: EgressMode.EGRESS_MODE_DIRECT },
    { label: 'iptables', value: EgressMode.EGRESS_MODE_IPTABLES },
    { label: 'shadowsocks-2022', value: EgressMode.EGRESS_MODE_SS2022 },
    { label: 'Trojan', value: EgressMode.EGRESS_MODE_TROJAN },
    { label: 'Snell', value: EgressMode.EGRESS_MODE_SNELL },
];

// SS2022加密方式选项
const ss2022CipherOptions = [
    { label: '2022-blake3-aes-128-gcm', value: '2022-blake3-aes-128-gcm' },
    { label: '2022-blake3-aes-256-gcm', value: '2022-blake3-aes-256-gcm' },
    { label: 'aes-128-gcm', value: 'aes-128-gcm' },
    { label: 'aes-192-gcm', value: 'aes-192-gcm' },
    { label: 'aes-256-gcm', value: 'aes-256-gcm' },
];

// 转发类型选项 - 使用新的枚举
const forwardTypeOptions = [
    { label: 'TCP', value: ForwardType.FORWARD_TYPE_TCP },
    { label: 'UDP', value: ForwardType.FORWARD_TYPE_UDP },
    { label: '全部', value: ForwardType.FORWARD_TYPE_ALL },
];

// 使用服务中定义的EgressItem类型，添加display字段
interface LocalEgressItem extends EgressItem {
    displayConfig?: string; // 用于显示的配置字符串
}

// 将API数据转换为显示数据格式
const convertEgressToLocalItem = (egress: EgressItem): LocalEgressItem => {
    // 根据出口模式生成显示配置字符串
    let displayConfig = '';
    
    switch (egress.egressMode) {
        case EgressMode.EGRESS_MODE_DIRECT:
            displayConfig = `直出到: ${egress.targetAddress || 'N/A'}`;
            break;
        case EgressMode.EGRESS_MODE_IPTABLES:
            displayConfig = `${egress.forwardType || 'N/A'} -> ${egress.destAddress || 'N/A'}:${egress.destPort || 'N/A'}`;
            break;
        case EgressMode.EGRESS_MODE_SS2022:
            displayConfig = `SS2022:${egress.port || 'N/A'}, UDP: ${egress.supportUdp ? '是' : '否'}`;
            break;
        case EgressMode.EGRESS_MODE_TROJAN:
            displayConfig = `Trojan:${egress.port || 'N/A'} -> ${egress.destAddress || 'N/A'}:${egress.destPort || 'N/A'}`;
            break;
        case EgressMode.EGRESS_MODE_SNELL:
            displayConfig = `Snell:${egress.port || 'N/A'}, UDP: ${egress.supportUdp ? '是' : '否'}`;
            break;
        default:
            displayConfig = '未配置';
    }

    return {
        ...egress,
        displayConfig,
    };
};

// 转换前端表单数据为API请求数据
const convertFormToCreateData = (values: any): CreateEgressData => {
    const data: CreateEgressData = {
        egressName: values.egressName,  // 更改为egressName
        serverId: values.serverId,
        egressMode: values.egressMode,
    };

    // 根据模式添加对应字段
    if (values.egressMode === EgressMode.EGRESS_MODE_DIRECT) {
        data.targetAddress = values.targetAddress;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
        data.forwardType = values.forwardType;
        data.destAddress = values.destAddress;
        data.destPort = values.destPort;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SS2022) {
        data.password = values.password;
        data.supportUdp = values.supportUdp;
        data.port = values.port;
        // TODO: 等待后端添加cipher字段支持
        // data.cipher = values.cipher;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_TROJAN) {
        data.password = values.password;
        data.port = values.port;
        data.destAddress = values.remoteAddr; // trojan使用remoteAddr字段
        data.destPort = values.remotePort; // trojan使用remotePort字段
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SNELL) {
        data.password = values.password;
        data.port = values.port;
        data.supportUdp = values.supportUdp;
    }

    return data;
};

// 转换前端表单数据为更新API请求数据
const convertFormToUpdateData = (values: any): UpdateEgressData => {
    const data: UpdateEgressData = {
        egressName: values.egressName,  // 更改为egressName
        serverId: values.serverId,
        egressMode: values.egressMode,
    };

    // 根据模式添加对应字段
    if (values.egressMode === EgressMode.EGRESS_MODE_DIRECT) {
        data.targetAddress = values.targetAddress;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
        data.forwardType = values.forwardType;
        data.destAddress = values.destAddress;
        data.destPort = values.destPort;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SS2022) {
        data.password = values.password;
        data.supportUdp = values.supportUdp;
        data.port = values.port;
        // TODO: 等待后端添加cipher字段支持
        // data.cipher = values.cipher;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_TROJAN) {
        data.password = values.password;
        data.port = values.port;
        data.destAddress = values.remoteAddr; // trojan使用remoteAddr字段
        data.destPort = values.remotePort; // trojan使用remotePort字段
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SNELL) {
        data.password = values.password;
        data.port = values.port;
        data.supportUdp = values.supportUdp;
    }

    return data;
};

const Egress: React.FC = () => {
    const [dataSource, setDataSource] = useState<LocalEgressItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<LocalEgressItem | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    
    // 服务器数据状态
    const [servers, setServers] = useState<ServerItem[]>([]);
    const [serversLoading, setServersLoading] = useState<boolean>(false);
    
    // 统一错误处理
    const { handleAsyncOperation } = useApiErrorHandler();
    
    // 转换服务器数据为选项格式
    const serverOptions = servers.map(server => ({
        label: `${server.name} (${server.ipv4 || server.ipv6 || 'N/A'})`,
        value: server.id,
    }));

    // 监听表单字段变化，当选择shadowsocks-2022时自动生成端口
    const handleEgressModeChange = useCallback((egressMode: EgressMode, formInstance: any) => {
        // 为需要密码的出口类型自动生成密码和端口
        if (egressMode === EgressMode.EGRESS_MODE_SS2022) {
            // 自动生成端口
            const currentPort = formInstance.getFieldValue('port');
            if (!currentPort) {
                const randomPort = generateRandomPort(20000, 50000);
                formInstance.setFieldValue('port', randomPort);
            }
            // 自动生成密码
            const currentPassword = formInstance.getFieldValue('password');
            if (!currentPassword) {
                const randomPassword = securityUtils.generateRandomPassword(100, 128);
                formInstance.setFieldValue('password', randomPassword);
            }
            // 默认启用UDP支持
            const currentUdpSupport = formInstance.getFieldValue('supportUdp');
            if (currentUdpSupport === undefined || currentUdpSupport === null) {
                formInstance.setFieldValue('supportUdp', true);
            }
        } else if (egressMode === EgressMode.EGRESS_MODE_TROJAN) {
            // 自动生成端口
            const currentPort = formInstance.getFieldValue('port');
            if (!currentPort) {
                const randomPort = generateRandomPort(20000, 50000);
                formInstance.setFieldValue('port', randomPort);
            }
            // 自动生成密码
            const currentPassword = formInstance.getFieldValue('password');
            if (!currentPassword) {
                const randomPassword = securityUtils.generateRandomPassword(32, 64);
                formInstance.setFieldValue('password', randomPassword);
            }
        } else if (egressMode === EgressMode.EGRESS_MODE_SNELL) {
            // 自动生成端口
            const currentPort = formInstance.getFieldValue('port');
            if (!currentPort) {
                const randomPort = generateRandomPort(20000, 50000);
                formInstance.setFieldValue('port', randomPort);
            }
            // 自动生成密码
            const currentPassword = formInstance.getFieldValue('password');
            if (!currentPassword) {
                const randomPassword = securityUtils.generateRandomPassword(16, 32);
                formInstance.setFieldValue('password', randomPassword);
            }
            // 默认启用UDP支持
            const currentUdpSupport = formInstance.getFieldValue('supportUdp');
            if (currentUdpSupport === undefined || currentUdpSupport === null) {
                formInstance.setFieldValue('supportUdp', true);
            }
        }
    }, []);

    // 确保 form 实例在需要时才被使用
    useEffect(() => {
        if (createModalVisible && form) {
            form.resetFields();
        }
    }, [createModalVisible, form]);

    useEffect(() => {
        if (editModalVisible && editForm && editingRecord) {
            editForm.setFieldsValue(editingRecord);
        }
    }, [editModalVisible, editForm, editingRecord]);

    // 加载出口配置数据
    const loadEgressData = useCallback(async () => {
        setLoading(true);
        try {
            await handleAsyncOperation(
                egressService.getEgressList(),
                '获取出口配置',
                {
                    showSuccess: false, // 数据获取不显示成功提示
                    onSuccess: (data) => {
                        const egressData = data || [];
                        const convertedData = egressData.map(convertEgressToLocalItem);
                        setDataSource(convertedData);
                    },
                    onError: () => {
                        setDataSource([]); // 失败时清空数据
                    }
                }
            );
        } finally {
            setLoading(false);
        }
    }, [handleAsyncOperation]);

    // 加载服务器数据
    const loadServersData = useCallback(async () => {
        setServersLoading(true);
        try {
            await handleAsyncOperation(
                serverService.getServers({ pageSize: 1000 }),
                '获取服务器列表',
                {
                    showSuccess: false, // 数据获取不显示成功提示
                    onSuccess: (data) => {
                        setServers(data || []);
                    },
                    onError: () => {
                        setServers([]); // 失败时清空数据
                    }
                }
            );
        } finally {
            setServersLoading(false);
        }
    }, [handleAsyncOperation]);

    // 使用useApiOnce防止重复API调用
    useApiOnce(() => {
        loadEgressData();
        loadServersData();
    });

    // 生成并设置随机密码
    const generateAndSetPassword = (fieldName: string, minLength: number, maxLength: number, successMessage: string, targetForm?: any) => {
        const currentForm = targetForm || form;
        return securityUtils.generateAndSetFormPassword(currentForm, fieldName, minLength, maxLength, successMessage);
    };

    // 删除出口
    const deleteEgress = async (record: LocalEgressItem) => {
        // 后端API要求使用自增主键ID，如果ID为0或null说明后端数据有问题
        if (!record.id || record.id === 0) {
            message.error('后端数据错误：记录的自增主键ID无效（为0或null）。请检查后端数据库和API实现。');
            console.error('后端数据错误：记录ID无效', record);
            return;
        }
        
        await handleAsyncOperation(
            egressService.deleteEgress(record.id),
            '删除出口',
            {
                customSuccessMessage: `出口 ${record.egressName} 删除成功！`,
                onSuccess: () => {
                    loadEgressData(); // 重新加载数据
                }
            }
        );
    };

    // 打开编辑模态框
    const openEditModal = (record: LocalEgressItem) => {
        setEditingRecord(record);
        // 设置表单值
        editForm.setFieldsValue({
            egressName: record.egressName,  // 更改为egressName
            serverId: record.serverId,
            egressMode: record.egressMode,
            // 根据模式设置对应字段
            ...(record.egressMode === EgressMode.EGRESS_MODE_DIRECT && { targetAddress: record.targetAddress }),
            ...(record.egressMode === EgressMode.EGRESS_MODE_IPTABLES && { 
                forwardType: record.forwardType,
                destAddress: record.destAddress,
                destPort: record.destPort,
            }),
            ...(record.egressMode === EgressMode.EGRESS_MODE_SS2022 && { 
                password: record.password,
                supportUdp: record.supportUdp,
                port: record.port,
            }),
        });
        setEditModalVisible(true);
    };

    // 处理编辑出口提交
    const handleEditEgress = async (values: LocalEgressItem) => {
        console.log('编辑出口表单提交:', values);
        
        if (!editingRecord) return false;
        
        // 后端API要求使用自增主键ID，如果ID为0或null说明后端数据有问题
        if (!editingRecord.id || editingRecord.id === 0) {
            message.error('后端数据错误：记录的自增主键ID无效（为0或null）。请检查后端数据库和API实现。');
            console.error('后端数据错误：记录ID无效', editingRecord);
            return false;
        }
        
        const response = await handleAsyncOperation(
            egressService.updateEgress(editingRecord.id, convertFormToUpdateData(values)),
            '更新出口',
            {
                customSuccessMessage: '出口更新成功！',
                onSuccess: () => {
                    loadEgressData(); // 重新加载数据
                    setEditingRecord(null);
                }
            }
        );
        
        return response.success;
    };

    // 处理新建出口提交
    const handleCreateEgress = async (values: LocalEgressItem) => {
        console.log('创建出口表单提交:', values);
        
        const response = await handleAsyncOperation(
            egressService.createEgress(convertFormToCreateData(values)),
            '创建出口',
            {
                customSuccessMessage: '出口创建成功！',
                onSuccess: () => {
                    loadEgressData(); // 重新加载数据
                }
            }
        );
        
        return response.success;
    };

    const columns: ProColumns<LocalEgressItem>[] = [
        {
            title: '出口名称',
            dataIndex: 'egressName',  // 更改为egressName
            formItemProps: {
                rules: [{ required: true, message: '出口名称为必填项' }],
            },
            width: '15%',
            render: (_, record) => (
                <div>
                    <div>{record.egressName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        ID: {record.id || 'N/A'} | egressId: {record.egressId || 'N/A'}
                    </div>
                </div>
            ),
        },
        {
            title: '服务器ID',
            dataIndex: 'serverId',
            width: '15%',
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
                    fieldProps={{
                        loading: serversLoading,
                    }}
                    rules={[{ required: true, message: '服务器ID为必填项' }]}
                />
            ),
        },
        {
            title: '出口模式',
            dataIndex: 'egressMode',
            width: '15%',
            valueType: 'select',
            valueEnum: {
                [EgressMode.EGRESS_MODE_DIRECT]: { text: '直出', status: 'Success' },
                [EgressMode.EGRESS_MODE_IPTABLES]: { text: 'iptables', status: 'Processing' },
                [EgressMode.EGRESS_MODE_SS2022]: { text: 'shadowsocks-2022', status: 'Warning' },
            },
            render: (_, record) => (
                <Tag color={
                    record.egressMode === EgressMode.EGRESS_MODE_DIRECT ? 'green' : 
                    record.egressMode === EgressMode.EGRESS_MODE_IPTABLES ? 'blue' : 
                    record.egressMode === EgressMode.EGRESS_MODE_SS2022 ? 'purple' :
                    'default'
                }>
                    {record.egressMode === EgressMode.EGRESS_MODE_DIRECT ? '直出' : 
                     record.egressMode === EgressMode.EGRESS_MODE_IPTABLES ? 'iptables' : 
                     record.egressMode === EgressMode.EGRESS_MODE_SS2022 ? 'shadowsocks-2022' :
                     record.egressMode}
                </Tag>
            ),
        },
        {
            title: '出口配置',
            dataIndex: 'displayConfig',
            width: '35%',
            formItemProps: {
                rules: [{ required: true, message: '出口配置为必填项' }],
            },
        },
        {
            title: '操作',
            valueType: 'option',
            width: '20%',
            render: (_, record) => {
                const isValidId = record.id && record.id !== 0;
                
                return [
                    <Tooltip key="edit" title={isValidId ? "编辑" : "后端数据错误：ID无效"}>
                        <a 
                            onClick={() => isValidId ? openEditModal(record) : undefined}
                            style={{ 
                                opacity: isValidId ? 1 : 0.5,
                                cursor: isValidId ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <Tag icon={<EditOutlined />} color={isValidId ? "blue" : "default"}>编辑</Tag>
                        </a>
                    </Tooltip>,
                    isValidId ? (
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
                        </Popconfirm>
                    ) : (
                        <Tooltip key="delete" title="后端数据错误：ID无效">
                            <a style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                                <Tag icon={<DeleteOutlined />} color="default">删除</Tag>
                            </a>
                        </Tooltip>
                    )
                ];
            }
        },
    ];

    return (
        <div>
            <QueryFilter
                defaultCollapsed
                split
                defaultColsNumber={3}
                onFinish={async (values) => {
                    console.log('✓ 出口配置查询完成:', values);
                    // 不显示查询成功提示，只在console记录
                }}
            >
                <ProFormText name="egressName" label="出口名称" colProps={{ span: 8 }} />
                <ProFormSelect 
                    name="serverId" 
                    label="服务器ID" 
                    colProps={{ span: 8 }}
                    options={serverOptions}
                    fieldProps={{
                        loading: serversLoading,
                    }}
                />
                <ProFormSelect 
                    name="egressMode" 
                    label="出口模式" 
                    colProps={{ span: 8 }}
                    valueEnum={{
                        [EgressMode.EGRESS_MODE_DIRECT]: { text: '直出' },
                        [EgressMode.EGRESS_MODE_IPTABLES]: { text: 'iptables' },
                        [EgressMode.EGRESS_MODE_SS2022]: { text: 'shadowsocks-2022' },
                    }}
                />
            </QueryFilter>

            {/* 后端数据错误警告 */}
            {dataSource.some(item => !item.id || item.id === 0) && (
                <div style={{ 
                    marginBottom: 16, 
                    padding: '12px 16px', 
                    backgroundColor: '#fff2f0', 
                    border: '1px solid #ffccc7',
                    borderRadius: '6px',
                    color: '#cf1322'
                }}>
                    <span style={{ fontWeight: 'bold' }}>🚨 后端数据错误：</span> 
                    检测到部分出口记录的自增主键ID无效（为0或null）。根据API规范，删除和编辑操作需要有效的自增主键ID。
                    <br />
                    <span style={{ fontWeight: 'bold' }}>需要后端修复：</span>
                    <br />
                    1. 检查数据库自增主键设置是否正确
                    <br />
                    2. 检查创建记录时是否正确返回了自增ID
                    <br />
                    3. 检查时间戳字段格式（当前返回字符串&quot;0&quot;，应该返回int64格式的时间戳）
                </div>
            )}

            <EditableProTable<LocalEgressItem>
                rowKey="id"
                headerTitle="出口列表"
                maxLength={20}
                scroll={{ x: 'max-content' }}
                recordCreatorProps={false}
                loading={loading}
                toolBarRender={() => [
                    <Button
                        key="refresh"
                        icon={<ReloadOutlined />}
                        onClick={loadEgressData}
                        loading={loading}
                    >
                        刷新
                    </Button>,
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
                    name="egressName"
                    label="出口名称"
                    placeholder="请输入出口名称，不填将自动生成"
                />
                
                <ProFormSelect
                    name="serverId"
                    label="服务器ID"
                    options={serverOptions}
                    fieldProps={{
                        loading: serversLoading,
                    }}
                    rules={[{ required: true, message: '请选择服务器' }]}
                />
                
                <ProFormSelect
                    name="egressMode"
                    label="出口模式"
                    options={egressModeOptions}
                    rules={[{ required: true, message: '请选择出口模式' }]}
                    fieldProps={{
                        onChange: (value) => handleEgressModeChange(value as EgressMode, form)
                    }}
                />
                
                <ProFormDependency name={['egressMode']}>
                    {({ egressMode }) => {
                        // 直出模式
                        if (egressMode === EgressMode.EGRESS_MODE_DIRECT) {
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
                        if (egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
                            return (
                                <>
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
                                </>
                            );
                        }
                        
                        // shadowsocks-2022模式
                        if (egressMode === EgressMode.EGRESS_MODE_SS2022) {
                            return (
                                <>
                                    <ProFormSelect
                                        name="cipher"
                                        label="加密方式"
                                        options={ss2022CipherOptions}
                                        rules={[{ required: true, message: '请选择加密方式' }]}
                                        initialValue="2022-blake3-aes-128-gcm"
                                    />
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
                                    <ProFormDigit
                                        name="port"
                                        label="端口"
                                        placeholder="请输入端口"
                                        rules={[{ required: true, message: '请输入端口' }]}
                                        min={1}
                                        max={65535}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成20000-50000范围内的随机端口">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const randomPort = generateRandomPort(20000, 50000);
                                                            form.setFieldValue('port', randomPort);
                                                            // handleDataResponse.userAction(`已生成随机端口: ${randomPort}`, true);
                                                        }}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                        extra="端口范围: 1-65535，建议使用20000-50000范围"
                                    />
                                    <ProFormCheckbox name="supportUdp" label="支持UDP">
                                        启用UDP支持
                                    </ProFormCheckbox>
                                </>
                            );
                        }

                        // Trojan模式
                        if (egressMode === EgressMode.EGRESS_MODE_TROJAN) {
                            return (
                                <>
                                    <ProFormText.Password
                                        name="password"
                                        label="密码"
                                        placeholder="请输入Trojan密码"
                                        rules={[{ required: true, message: '请输入密码' }]}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成32-64位随机密码">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('password', 32, 64, '已生成Trojan随机密码')}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                    />
                                    <ProFormDigit
                                        name="port"
                                        label="本地端口"
                                        placeholder="请输入本地端口"
                                        rules={[{ required: true, message: '请输入本地端口' }]}
                                        min={1}
                                        max={65535}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成20000-50000范围内的随机端口">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const randomPort = generateRandomPort(20000, 50000);
                                                            form.setFieldValue('port', randomPort);
                                                        }}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                    />
                                    <ProFormText
                                        name="remoteAddr"
                                        label="远程地址"
                                        placeholder="请输入远程服务器地址"
                                        rules={[{ required: true, message: '请输入远程地址' }]}
                                    />
                                    <ProFormText
                                        name="remotePort"
                                        label="远程端口"
                                        placeholder="请输入远程端口"
                                        rules={[{ required: true, message: '请输入远程端口' }]}
                                    />
                                </>
                            );
                        }

                        // Snell模式
                        if (egressMode === EgressMode.EGRESS_MODE_SNELL) {
                            return (
                                <>
                                    <ProFormText.Password
                                        name="password"
                                        label="密码"
                                        placeholder="请输入Snell密码"
                                        rules={[{ required: true, message: '请输入密码' }]}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成16-32位随机密码">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('password', 16, 32, '已生成Snell随机密码')}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                    />
                                    <ProFormDigit
                                        name="port"
                                        label="端口"
                                        placeholder="请输入端口"
                                        rules={[{ required: true, message: '请输入端口' }]}
                                        min={1}
                                        max={65535}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成20000-50000范围内的随机端口">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                        onClick={() => {
                                            const randomPort = generateRandomPort(20000, 50000);
                                            form.setFieldValue('port', randomPort);
                                        }}
                                        size="small"
                                    />
                                </Tooltip>
                            )
                        }}
                        extra="端口范围: 1-65535，建议使用20000-50000范围"
                    />
                    <ProFormCheckbox name="supportUdp" label="支持UDP">
                        启用UDP支持
                    </ProFormCheckbox>
                </>
            );
        }                        return null;
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
                    name="egressName"
                    label="出口名称"
                    placeholder="请输入出口名称"
                    rules={[{ required: true, message: '出口名称为必填项' }]}
                />
                
                <ProFormSelect
                    name="serverId"
                    label="服务器ID"
                    options={serverOptions}
                    fieldProps={{
                        loading: serversLoading,
                    }}
                    rules={[{ required: true, message: '请选择服务器' }]}
                />
                
                <ProFormSelect
                    name="egressMode"
                    label="出口模式"
                    options={egressModeOptions}
                    rules={[{ required: true, message: '请选择出口模式' }]}
                    fieldProps={{
                        onChange: (value) => handleEgressModeChange(value as EgressMode, editForm)
                    }}
                />
                
                <ProFormDependency name={['egressMode']}>
                    {({ egressMode }) => {
                        // 直出模式
                        if (egressMode === EgressMode.EGRESS_MODE_DIRECT) {
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
                        if (egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
                            return (
                                <>
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
                                </>
                            );
                        }
                        
                        // shadowsocks-2022模式
                        if (egressMode === EgressMode.EGRESS_MODE_SS2022) {
                            return (
                                <>
                                    <ProFormSelect
                                        name="cipher"
                                        label="加密方式"
                                        options={ss2022CipherOptions}
                                        rules={[{ required: true, message: '请选择加密方式' }]}
                                        initialValue="2022-blake3-aes-128-gcm"
                                    />
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
                                    <ProFormDigit
                                        name="port"
                                        label="端口"
                                        placeholder="请输入端口"
                                        rules={[{ required: true, message: '请输入端口' }]}
                                        min={1}
                                        max={65535}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成20000-50000范围内的随机端口">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const randomPort = generateRandomPort(20000, 50000);
                                                            editForm.setFieldValue('port', randomPort);
                                                            // handleDataResponse.userAction(`已生成随机端口: ${randomPort}`, true);
                                                        }}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                        extra="端口范围: 1-65535，建议使用20000-50000范围"
                                    />
                                    <ProFormCheckbox name="supportUdp" label="支持UDP">
                                        启用UDP支持
                                    </ProFormCheckbox>
                                </>
                            );
                        }

                        // Trojan模式
                        if (egressMode === EgressMode.EGRESS_MODE_TROJAN) {
                            return (
                                <>
                                    <ProFormText.Password
                                        name="password"
                                        label="密码"
                                        placeholder="请输入Trojan密码"
                                        rules={[{ required: true, message: '请输入密码' }]}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成32-64位随机密码">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('password', 32, 64, '已生成Trojan随机密码', editForm)}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                    />
                                    <ProFormDigit
                                        name="port"
                                        label="本地端口"
                                        placeholder="请输入本地端口"
                                        rules={[{ required: true, message: '请输入本地端口' }]}
                                        min={1}
                                        max={65535}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成20000-50000范围内的随机端口">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const randomPort = generateRandomPort(20000, 50000);
                                                            editForm.setFieldValue('port', randomPort);
                                                        }}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                    />
                                    <ProFormText
                                        name="remoteAddr"
                                        label="远程地址"
                                        placeholder="请输入远程服务器地址"
                                        rules={[{ required: true, message: '请输入远程地址' }]}
                                    />
                                    <ProFormText
                                        name="remotePort"
                                        label="远程端口"
                                        placeholder="请输入远程端口"
                                        rules={[{ required: true, message: '请输入远程端口' }]}
                                    />
                                </>
                            );
                        }

                        // Snell模式
                        if (egressMode === EgressMode.EGRESS_MODE_SNELL) {
                            return (
                                <>
                                    <ProFormText.Password
                                        name="password"
                                        label="密码"
                                        placeholder="请输入Snell密码"
                                        rules={[{ required: true, message: '请输入密码' }]}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成16-32位随机密码">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => generateAndSetPassword('password', 16, 32, '已生成Snell随机密码', editForm)}
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            )
                                        }}
                                    />
                                    <ProFormDigit
                                        name="port"
                                        label="端口"
                                        placeholder="请输入端口"
                                        rules={[{ required: true, message: '请输入端口' }]}
                                        min={1}
                                        max={65535}
                                        fieldProps={{
                                            addonAfter: (
                                                <Tooltip title="生成20000-50000范围内的随机端口">
                                                    <Button 
                                                        type="text" 
                                                        icon={<ThunderboltOutlined />}
                                        onClick={() => {
                                            const randomPort = generateRandomPort(20000, 50000);
                                            editForm.setFieldValue('port', randomPort);
                                        }}
                                        size="small"
                                    />
                                </Tooltip>
                            )
                        }}
                        extra="端口范围: 1-65535，建议使用20000-50000范围"
                    />
                    <ProFormCheckbox name="supportUdp" label="支持UDP">
                        启用UDP支持
                    </ProFormCheckbox>
                </>
            );
        }                        return null;
                    }}
                </ProFormDependency>
            </ModalForm>
        </div>
    );
};

export default Egress;