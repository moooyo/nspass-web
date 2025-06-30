import React, { useState, useEffect, useCallback } from 'react';
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
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { egressService } from '@/services/egress';
import type { EgressItem } from '@/services/egress';
import { useApiOnce } from '@/components/hooks/useApiOnce';

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
];

// 转发类型选项
const forwardTypeOptions = [
    { label: 'TCP', value: 'tcp' },
    { label: 'UDP', value: 'udp' },
    { label: '全部', value: 'all' },
];

type LocalEgressItem = {
    id: React.Key;
    egressId: string;
    serverId: string;
    egressMode: 'direct' | 'iptables' | 'ss2022';
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
};

// 将API数据转换为组件数据格式
const convertEgressToLocalItem = (egress: EgressItem): LocalEgressItem => {
    return {
        id: egress.id,
        egressId: egress.egressId,
        serverId: egress.serverId,
        egressMode: egress.egressMode,
        egressConfig: egress.egressConfig,
        targetAddress: egress.targetAddress,
        forwardType: egress.forwardType,
        destAddress: egress.destAddress,
        destPort: egress.destPort,
        password: egress.password,
        supportUdp: egress.supportUdp,
    };
};

const Egress: React.FC = () => {
    const [dataSource, setDataSource] = useState<LocalEgressItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasLoadedData, setHasLoadedData] = useState<boolean>(false);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<LocalEgressItem | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // 加载出口配置数据
    const loadEgressData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await egressService.getEgressList();
            
            if (response.success) {
                const egressData = response.data || [];
                const convertedData = egressData.map(convertEgressToLocalItem);
                setDataSource(convertedData);
                setHasLoadedData(true);
                message.success(response.message || '获取出口配置成功');
            } else {
                // 失败时清空数据，避免显示过期缓存
                setDataSource([]);
                setHasLoadedData(false);
                message.error(response.message || '获取出口配置失败');
            }
        } catch (error) {
            console.error('获取出口配置失败:', error);
            // 失败时清空数据，避免显示过期缓存
            setDataSource([]);
            setHasLoadedData(false);
            message.error('获取出口配置失败');
        } finally {
            setLoading(false);
        }
    }, []);

    // 使用useApiOnce防止重复API调用
    useApiOnce(() => {
        loadEgressData();
    });

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
    const deleteEgress = async (record: LocalEgressItem) => {
        try {
            const response = await egressService.deleteEgress(record.id);
            if (response.success) {
                setDataSource(dataSource.filter(item => item.id !== record.id));
                message.success(response.message || `已删除出口: ${record.egressId}`);
            } else {
                message.error(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除出口失败:', error);
            message.error('删除失败');
        }
    };

    // 打开编辑模态框
    const openEditModal = (record: LocalEgressItem) => {
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
        });
        setEditModalVisible(true);
    };

    // 处理编辑出口提交
    const handleEditEgress = async (values: LocalEgressItem) => {
        console.log('编辑出口表单提交:', values);
        
        if (!editingRecord) return false;
        
        try {
            const response = await egressService.updateEgress(editingRecord.id, values);
            if (response.success) {
                // 重新加载数据
                const listResponse = await egressService.getEgressList();
                if (listResponse.success) {
                    const egressData = listResponse.data || [];
                    const convertedData = egressData.map(convertEgressToLocalItem);
                    setDataSource(convertedData);
                }
                message.success(response.message || '出口更新成功');
                setEditingRecord(null);
                return true;
            } else {
                message.error(response.message || '出口更新失败');
                return false;
            }
        } catch (error) {
            console.error('更新出口失败:', error);
            message.error('出口更新失败');
            return false;
        }
    };

    // 处理新建出口提交
    const handleCreateEgress = async (values: LocalEgressItem) => {
        console.log('创建出口表单提交:', values);
        
        try {
            const response = await egressService.createEgress(values);
            if (response.success) {
                // 重新加载数据
                const listResponse = await egressService.getEgressList();
                if (listResponse.success) {
                    const egressData = listResponse.data || [];
                    const convertedData = egressData.map(convertEgressToLocalItem);
                    setDataSource(convertedData);
                }
                message.success(response.message || '出口创建成功');
                return true;
            } else {
                message.error(response.message || '出口创建失败');
                return false;
            }
        } catch (error) {
            console.error('创建出口失败:', error);
            message.error('出口创建失败');
            return false;
        }
    };

    const columns: ProColumns<LocalEgressItem>[] = [
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
            },
            render: (_, record) => (
                <Tag color={
                    record.egressMode === 'direct' ? 'green' : 
                    record.egressMode === 'iptables' ? 'blue' : 
                    record.egressMode === 'ss2022' ? 'purple' :
                    'default'
                }>
                    {record.egressMode === 'direct' ? '直出' : 
                     record.egressMode === 'iptables' ? 'iptables' : 
                     record.egressMode === 'ss2022' ? 'shadowsocks-2022' :
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
                    }}
                />
            </QueryFilter>

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
                        
                        return null;
                    }}
                </ProFormDependency>
            </ModalForm>
        </div>
    );
};

export default Egress; 