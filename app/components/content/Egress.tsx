import React, { useState } from 'react';
import { Button, message, Tag, Popconfirm, Space, Tooltip } from 'antd';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    ProFormDigit,
    ProFormTextArea,
    ProFormDependency,
    ProFormGroup,
    ProFormCheckbox,
    ModalForm,
    QueryFilter,
} from '@ant-design/pro-components';
import { 
    PlusOutlined, 
    EditOutlined,
    DeleteOutlined,
    ApiOutlined
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
];

const Egress: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<EgressItem[]>(defaultData);
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);

    // 删除出口
    const deleteEgress = (record: EgressItem) => {
        setDataSource(dataSource.filter(item => item.id !== record.id));
        message.success(`已删除出口: ${record.egressId}`);
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
            },
            render: (_, record) => (
                <Tag color={
                    record.egressMode === 'direct' ? 'green' : 
                    record.egressMode === 'iptables' ? 'blue' : 
                    'purple'
                }>
                    {record.egressMode === 'direct' ? '直出' : 
                     record.egressMode === 'iptables' ? 'iptables' : 
                     'shadowsocks-2022'}
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
                    <a onClick={() => setEditableKeys([record.id])}>
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

            <EditableProTable<EgressItem>
                rowKey="id"
                headerTitle="出口列表"
                maxLength={20}
                scroll={{ x: 1000 }}
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
                    editableKeys,
                    onSave: async (rowKey, data, row) => {
                        console.log(rowKey, data, row);
                        message.success('保存成功');
                    },
                    onChange: setEditableKeys,
                    actionRender: (row, config, defaultDoms) => {
                        return [defaultDoms.save, defaultDoms.cancel];
                    },
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