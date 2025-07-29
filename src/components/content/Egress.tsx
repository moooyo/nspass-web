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
    EyeOutlined,
} from '@ant-design/icons';
import { egressService, EgressItem, CreateEgressData, UpdateEgressData, EgressMode, ForwardType } from '@/services/egress';
import { serverService } from '@/services/server';
import type { ServerItem } from '@/types/generated/api/servers/server_management';
import { useApiOnce } from '@/components/hooks/useApiOnce';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { securityUtils } from '@/shared/utils';
import { generateRandomPortFromRange } from '@/utils/passwordUtils';
import { parseEgressConfig } from '@/utils/egressConfigUtils';

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

// 使用服务中定义的EgressItem类型，添加display字段和解析出的配置字段
interface LocalEgressItem extends EgressItem {
    displayConfig?: string; // 用于显示的配置字符串
    // 从egressConfig解析出的字段，用于向后兼容
    targetAddress?: string;
    target_address?: string;
    forwardType?: string;
    forward_type?: string;
    destAddress?: string;
    dest_ip?: string;
    destPort?: string;
    dest_port?: string;
    supportUdp?: boolean;
    udp_support?: boolean;
    [key: string]: any; // 允许其他动态字段
}



// 将API数据转换为显示数据格式
const convertEgressToLocalItem = (egress: EgressItem): LocalEgressItem => {
    // 解析 egressConfig 获取具体配置
    const config = parseEgressConfig(egress.egressConfig || '', egress.egressMode);

    // 根据出口模式生成显示配置字符串
    let displayConfig = '';

    switch (egress.egressMode) {
        case EgressMode.EGRESS_MODE_DIRECT:
            displayConfig = `直出到: ${config.target_address || config.targetAddress || 'N/A'}`;
            break;
        case EgressMode.EGRESS_MODE_IPTABLES:
            const forwardType = config.forward_type || config.forwardType || 'N/A';
            const destIp = config.dest_ip || config.destAddress || 'N/A';
            const destPort = config.dest_port || config.destPort || 'N/A';
            displayConfig = `${forwardType} -> ${destIp}:${destPort}`;
            break;
        case EgressMode.EGRESS_MODE_SS2022:
            const supportUdp = config.udp_support || config.supportUdp || false;
            displayConfig = `SS2022:${egress.port || 'N/A'}, UDP: ${supportUdp ? '是' : '否'}`;
            break;
        case EgressMode.EGRESS_MODE_TROJAN:
            const trojanUdp = config.udp_support || config.supportUdp || false;
            displayConfig = `Trojan:${egress.port || 'N/A'}, UDP: ${trojanUdp ? '是' : '否'}`;
            break;
        case EgressMode.EGRESS_MODE_SNELL:
            const snellUdp = config.udp_support || config.supportUdp || false;
            displayConfig = `Snell:${egress.port || 'N/A'}, UDP: ${snellUdp ? '是' : '否'}`;
            break;
        default:
            displayConfig = '未配置';
    }

    return {
        ...egress,
        displayConfig,
        // 为了向后兼容，将解析出的配置字段添加到对象中
        ...config
    };
};

// 转换前端表单数据为API请求数据
const convertFormToCreateData = (values: any): CreateEgressData => {
    const data: CreateEgressData = {
        egressId: values.egressId || `egress-${Date.now()}`, // 生成业务ID
        egressName: values.egressName,
        serverId: values.serverId,
        egressMode: values.egressMode,
    };

    // 根据模式构建egressConfig JSON
    let egressConfig: any = {};

    if (values.egressMode === EgressMode.EGRESS_MODE_DIRECT) {
        egressConfig = {
            target_address: values.targetAddress
        };
    } else if (values.egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
        egressConfig = {
            forward_type: values.forwardType,
            dest_ip: values.destAddress,
            dest_port: values.destPort
        };
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SS2022) {
        egressConfig = {
            udp_support: values.supportUdp || false,
            method: values.cipher || '2022-blake3-aes-128-gcm'
        };
        // 通用字段
        data.password = values.password;
        data.port = values.port;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_TROJAN) {
        egressConfig = {
            udp_support: values.supportUdp || false,
            sni: values.sni || '',
            skip_cert_verify: values.skipCertVerify || false
        };
        // 通用字段
        data.password = values.password;
        data.port = values.port;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SNELL) {
        egressConfig = {
            udp_support: values.supportUdp || false,
            version: values.version || 'v4'
        };
        // 通用字段
        data.password = values.password;
        data.port = values.port;
    }

    // 序列化egressConfig
    if (Object.keys(egressConfig).length > 0) {
        data.egressConfig = JSON.stringify(egressConfig);
    }

    return data;
};

// 转换前端表单数据为更新API请求数据
const convertFormToUpdateData = (values: any, id: number): UpdateEgressData => {
    const data: UpdateEgressData = {
        id: id,
        egressName: values.egressName,
        serverId: values.serverId,
        egressMode: values.egressMode,
    };

    // 根据模式构建egressConfig JSON
    let egressConfig: any = {};

    if (values.egressMode === EgressMode.EGRESS_MODE_DIRECT) {
        egressConfig = {
            target_address: values.targetAddress
        };
    } else if (values.egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
        egressConfig = {
            forward_type: values.forwardType,
            dest_ip: values.destAddress,
            dest_port: values.destPort
        };
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SS2022) {
        egressConfig = {
            udp_support: values.supportUdp || false,
            method: values.cipher || '2022-blake3-aes-128-gcm'
        };
        // 通用字段
        data.password = values.password;
        data.port = values.port;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_TROJAN) {
        egressConfig = {
            udp_support: values.supportUdp || false,
            sni: values.sni || '',
            skip_cert_verify: values.skipCertVerify || false
        };
        // 通用字段
        data.password = values.password;
        data.port = values.port;
    } else if (values.egressMode === EgressMode.EGRESS_MODE_SNELL) {
        egressConfig = {
            udp_support: values.supportUdp || false,
            version: values.version || 'v4'
        };
        // 通用字段
        data.password = values.password;
        data.port = values.port;
    }

    // 序列化egressConfig
    if (Object.keys(egressConfig).length > 0) {
        data.egressConfig = JSON.stringify(egressConfig);
    }

    return data;
};

const Egress: React.FC = () => {
    const [dataSource, setDataSource] = useState<LocalEgressItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<LocalEgressItem | null>(null);
    const [configViewModalVisible, setConfigViewModalVisible] = useState<boolean>(false);
    const [viewingConfig, setViewingConfig] = useState<LocalEgressItem | null>(null);
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

    // 监听表单字段变化，当选择需要端口的出口类型时自动生成端口
    const handleEgressModeChange = useCallback((egressMode: EgressMode, formInstance: any) => {
        // 为需要密码和端口的出口类型自动生成
        if (egressMode === EgressMode.EGRESS_MODE_SS2022 ||
            egressMode === EgressMode.EGRESS_MODE_TROJAN ||
            egressMode === EgressMode.EGRESS_MODE_SNELL) {

            // 获取当前选择的服务器
            const selectedServerId = formInstance.getFieldValue('serverId');
            const selectedServer = servers.find(server => server.id === selectedServerId);

            // 自动生成端口
            const currentPort = formInstance.getFieldValue('port');
            if (!currentPort) {
                const randomPort = generateRandomPortFromRange(selectedServer?.availablePorts, 20000, 50000);
                formInstance.setFieldValue('port', randomPort);
            }

            // 自动生成密码
            const currentPassword = formInstance.getFieldValue('password');
            if (!currentPassword) {
                let randomPassword: string;
                if (egressMode === EgressMode.EGRESS_MODE_SS2022) {
                    randomPassword = securityUtils.generateRandomPassword(100, 128);
                } else if (egressMode === EgressMode.EGRESS_MODE_TROJAN) {
                    randomPassword = securityUtils.generateRandomPassword(32, 64);
                } else { // SNELL
                    randomPassword = securityUtils.generateRandomPassword(16, 32);
                }
                formInstance.setFieldValue('password', randomPassword);
            }

            // 默认启用UDP支持（SS2022和Snell）
            if (egressMode === EgressMode.EGRESS_MODE_SS2022 || egressMode === EgressMode.EGRESS_MODE_SNELL) {
                const currentUdpSupport = formInstance.getFieldValue('supportUdp');
                if (currentUdpSupport === undefined || currentUdpSupport === null) {
                    formInstance.setFieldValue('supportUdp', true);
                }
            }
        }
    }, [servers]);

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

    // 打开配置查看模态框
    const openConfigViewModal = useCallback((record: LocalEgressItem) => {
        setViewingConfig(record);
        setConfigViewModalVisible(true);
    }, []);

    // 打开编辑模态框
    const openEditModal = (record: LocalEgressItem) => {
        setEditingRecord(record);

        // 解析egressConfig获取配置信息
        const config = parseEgressConfig(record.egressConfig || '', record.egressMode);

        // 设置表单值
        const formValues: any = {
            egressName: record.egressName,
            serverId: record.serverId,
            egressMode: record.egressMode,
            // 通用字段
            password: record.password,
            port: record.port,
        };

        // 根据模式设置对应字段
        if (record.egressMode === EgressMode.EGRESS_MODE_DIRECT) {
            formValues.targetAddress = config.target_address || record.targetAddress;
        } else if (record.egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
            formValues.forwardType = config.forward_type || record.forwardType;
            formValues.destAddress = config.dest_ip || record.destAddress;
            formValues.destPort = config.dest_port || record.destPort;
        } else if (record.egressMode === EgressMode.EGRESS_MODE_SS2022) {
            formValues.supportUdp = config.udp_support || record.supportUdp;
            formValues.cipher = config.method || '2022-blake3-aes-128-gcm';
        } else if (record.egressMode === EgressMode.EGRESS_MODE_TROJAN) {
            formValues.supportUdp = config.udp_support || record.supportUdp;
            formValues.sni = config.sni || '';
            formValues.skipCertVerify = config.skip_cert_verify || false;
        } else if (record.egressMode === EgressMode.EGRESS_MODE_SNELL) {
            formValues.supportUdp = config.udp_support || record.supportUdp;
            formValues.version = config.version || 'v4';
        }

        editForm.setFieldsValue(formValues);
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
            egressService.updateEgress(editingRecord.id, convertFormToUpdateData(values, editingRecord.id)),
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
            width: '25%',
            formItemProps: {
                rules: [{ required: true, message: '出口配置为必填项' }],
            },
        },
        {
            title: '通用配置',
            width: '15%',
            hideInSearch: true,
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    {record.port && (
                        <div>
                            <span style={{ color: '#666' }}>端口: </span>
                            <span style={{ color: '#1890ff', fontFamily: 'monospace' }}>{record.port}</span>
                        </div>
                    )}
                    {record.password && (
                        <div>
                            <span style={{ color: '#666' }}>密码: </span>
                            <span style={{ color: '#52c41a', fontFamily: 'monospace' }}>
                                {record.password.length > 20 ? `${record.password.substring(0, 20)}...` : record.password}
                            </span>
                        </div>
                    )}
                    {!record.port && !record.password && (
                        <span style={{ color: '#999' }}>无通用配置</span>
                    )}
                </div>
            ),
        },
        {
            title: '操作',
            valueType: 'option',
            width: '25%',
            render: (_, record) => {
                const isValidId = record.id && record.id !== 0;

                return [
                    <Tooltip key="view" title="查看配置">
                        <a onClick={() => openConfigViewModal(record)}>
                            <Tag icon={<EyeOutlined />} color="green">查看</Tag>
                        </a>
                    </Tooltip>,
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
                                                <Tooltip title="根据服务器可用端口范围生成随机端口">
                                                    <Button
                                                        type="text"
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const selectedServerId = form.getFieldValue('serverId');
                                                            const selectedServer = servers.find(server => server.id === selectedServerId);
                                                            const randomPort = generateRandomPortFromRange(selectedServer?.availablePorts, 20000, 50000);
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
                                                <Tooltip title="根据服务器可用端口范围生成随机端口">
                                                    <Button
                                                        type="text"
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const selectedServerId = form.getFieldValue('serverId');
                                                            const selectedServer = servers.find(server => server.id === selectedServerId);
                                                            const randomPort = generateRandomPortFromRange(selectedServer?.availablePorts, 20000, 50000);
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
                                                <Tooltip title="根据服务器可用端口范围生成随机端口">
                                                    <Button
                                                        type="text"
                                                        icon={<ThunderboltOutlined />}
                                        onClick={() => {
                                            const selectedServerId = form.getFieldValue('serverId');
                                            const selectedServer = servers.find(server => server.id === selectedServerId);
                                            const randomPort = generateRandomPortFromRange(selectedServer?.availablePorts, 20000, 50000);
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
                                                <Tooltip title="根据服务器可用端口范围生成随机端口">
                                                    <Button
                                                        type="text"
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const selectedServerId = editForm.getFieldValue('serverId');
                                                            const selectedServer = servers.find(server => server.id === selectedServerId);
                                                            const randomPort = generateRandomPortFromRange(selectedServer?.availablePorts, 20000, 50000);
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
                                                <Tooltip title="根据服务器可用端口范围生成随机端口">
                                                    <Button
                                                        type="text"
                                                        icon={<ThunderboltOutlined />}
                                                        onClick={() => {
                                                            const selectedServerId = editForm.getFieldValue('serverId');
                                                            const selectedServer = servers.find(server => server.id === selectedServerId);
                                                            const randomPort = generateRandomPortFromRange(selectedServer?.availablePorts, 20000, 50000);
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
                                                <Tooltip title="根据服务器可用端口范围生成随机端口">
                                                    <Button
                                                        type="text"
                                                        icon={<ThunderboltOutlined />}
                                        onClick={() => {
                                            const selectedServerId = editForm.getFieldValue('serverId');
                                            const selectedServer = servers.find(server => server.id === selectedServerId);
                                            const randomPort = generateRandomPortFromRange(selectedServer?.availablePorts, 20000, 50000);
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

            {/* 配置查看模态框 */}
            <ModalForm
                title="查看出口配置"
                width={800}
                open={configViewModalVisible}
                onOpenChange={setConfigViewModalVisible}
                submitter={false}
                modalProps={{
                    destroyOnHidden: true,
                    onCancel: () => {
                        setConfigViewModalVisible(false);
                        setViewingConfig(null);
                    },
                }}
            >
                {viewingConfig && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <h4>基本信息</h4>
                            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                                <p><strong>出口名称:</strong> {viewingConfig.egressName}</p>
                                <p><strong>出口ID:</strong> {viewingConfig.egressId}</p>
                                <p><strong>服务器ID:</strong> {viewingConfig.serverId}</p>
                                <p><strong>出口模式:</strong> {
                                    viewingConfig.egressMode === EgressMode.EGRESS_MODE_DIRECT ? '直出' :
                                    viewingConfig.egressMode === EgressMode.EGRESS_MODE_IPTABLES ? 'iptables' :
                                    viewingConfig.egressMode === EgressMode.EGRESS_MODE_SS2022 ? 'shadowsocks-2022' :
                                    viewingConfig.egressMode === EgressMode.EGRESS_MODE_TROJAN ? 'Trojan' :
                                    viewingConfig.egressMode === EgressMode.EGRESS_MODE_SNELL ? 'Snell' :
                                    viewingConfig.egressMode
                                }</p>
                                {viewingConfig.port && <p><strong>端口:</strong> {viewingConfig.port}</p>}
                                {viewingConfig.password && <p><strong>密码:</strong> {viewingConfig.password}</p>}
                            </div>
                        </div>

                        <div>
                            <h4>详细配置 (JSON)</h4>
                            <pre style={{
                                background: '#f5f5f5',
                                padding: 12,
                                borderRadius: 4,
                                overflow: 'auto',
                                maxHeight: 400,
                                fontSize: '12px',
                                fontFamily: 'monospace'
                            }}>
                                {JSON.stringify(
                                    {
                                        egressId: viewingConfig.egressId,
                                        egressName: viewingConfig.egressName,
                                        serverId: viewingConfig.serverId,
                                        egressMode: viewingConfig.egressMode,
                                        port: viewingConfig.port,
                                        password: viewingConfig.password,
                                        egressConfig: viewingConfig.egressConfig ? JSON.parse(viewingConfig.egressConfig) : null
                                    },
                                    null,
                                    2
                                )}
                            </pre>
                        </div>
                    </div>
                )}
            </ModalForm>
        </div>
    );
};

export default Egress;