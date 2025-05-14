import React, { useState } from 'react';
import { Button, message, Tag, Popconfirm, Badge, Space, Tooltip } from 'antd';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
} from '@ant-design/pro-components';
import { 
    PlusOutlined, 
    PauseCircleOutlined, 
    PlayCircleOutlined,
    BugOutlined, 
    CopyOutlined, 
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

// 入口类型
const entryTypeEnum = {
    HTTP: { text: 'HTTP', status: 'Processing' },
    SOCKS5: { text: 'SOCKS5', status: 'Processing' },
    SHADOWSOCKS: { text: 'Shadowsocks', status: 'Processing' },
    TROJAN: { text: 'Trojan', status: 'Processing' },
};

// 出口类型
const exitTypeEnum = {
    DIRECT: { text: '直连', status: 'Default' },
    PROXY: { text: '代理', status: 'Warning' },
    REJECT: { text: '拒绝', status: 'Error' },
};

// 规则状态
const ruleStatusEnum = {
    ACTIVE: { text: '运行中', status: 'Success' },
    PAUSED: { text: '已暂停', status: 'Default' },
    ERROR: { text: '出错', status: 'Error' },
};

type ForwardRuleItem = {
    id: React.Key;
    ruleId: string;
    entryType: keyof typeof entryTypeEnum;
    entryConfig: string;
    trafficUsed: number; // MB
    exitType: keyof typeof exitTypeEnum;
    exitConfig: string;
    status: keyof typeof ruleStatusEnum;
    viaNodes: string[]; // 途径节点数组
};

const defaultData: ForwardRuleItem[] = [
    {
        id: 1,
        ruleId: 'rule001',
        entryType: 'HTTP',
        entryConfig: '127.0.0.1:8080',
        trafficUsed: 1024,
        exitType: 'PROXY',
        exitConfig: 'proxy.example.com:443',
        status: 'ACTIVE',
        viaNodes: ['香港节点', '日本节点'],
    },
    {
        id: 2,
        ruleId: 'rule002',
        entryType: 'SOCKS5',
        entryConfig: '0.0.0.0:1080',
        trafficUsed: 512,
        exitType: 'DIRECT',
        exitConfig: '-',
        status: 'PAUSED',
        viaNodes: ['新加坡节点'],
    },
    {
        id: 3,
        ruleId: 'rule003',
        entryType: 'SHADOWSOCKS',
        entryConfig: '0.0.0.0:8388',
        trafficUsed: 2048,
        exitType: 'REJECT',
        exitConfig: '-',
        status: 'ERROR',
        viaNodes: [],
    },
];

const ForwardRules: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<ForwardRuleItem[]>(defaultData);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');

    // 暂停/启动规则
    const toggleRuleStatus = (record: ForwardRuleItem) => {
        const newDataSource = dataSource.map(item => {
            if (item.id === record.id) {
                const newStatus: keyof typeof ruleStatusEnum = record.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
                return { ...item, status: newStatus };
            }
            return item;
        });
        setDataSource(newDataSource);
        message.success(record.status === 'ACTIVE' ? 
            `已暂停规则: ${record.ruleId}` : 
            `已启动规则: ${record.ruleId}`
        );
    };

    // 诊断规则
    const diagnoseRule = (record: ForwardRuleItem) => {
        message.info(`正在诊断规则: ${record.ruleId}`);
        // 这里可以添加诊断逻辑，比如弹出诊断结果或跳转到诊断页面
        setTimeout(() => {
            message.success(`规则 ${record.ruleId} 诊断完成，一切正常！`);
        }, 1500);
    };

    // 复制规则
    const copyRule = (record: ForwardRuleItem) => {
        const newRule: ForwardRuleItem = {
            ...record,
            id: Date.now(),
            ruleId: `${record.ruleId}_copy`,
            status: 'PAUSED', // 复制的规则默认是暂停状态
            trafficUsed: 0, // 复制的规则流量使用量为0
            viaNodes: [], // 复制的规则途径节点为空
        };
        setDataSource([...dataSource, newRule]);
        message.success(`已复制规则: ${record.ruleId}`);
    };

    // 删除规则
    const deleteRule = (record: ForwardRuleItem) => {
        setDataSource(dataSource.filter(item => item.id !== record.id));
        message.success(`已删除规则: ${record.ruleId}`);
    };

    const columns: ProColumns<ForwardRuleItem>[] = [
        {
            title: '规则ID',
            dataIndex: 'ruleId',
            formItemProps: {
                rules: [{ required: true, message: '规则ID为必填项' }],
            },
            width: '12%',
        },
        {
            title: '入口',
            key: 'entry',
            width: '15%',
            render: (_, record) => (
                <>
                    <Tag color="blue">{entryTypeEnum[record.entryType].text}</Tag>
                    <span>{record.entryConfig}</span>
                </>
            ),
            renderFormItem: () => (
                <Space>
                    <ProFormSelect
                        name="entryType"
                        placeholder="入口类型"
                        valueEnum={entryTypeEnum}
                        rules={[{ required: true, message: '入口类型为必填项' }]}
                    />
                    <ProFormText
                        name="entryConfig"
                        placeholder="入口配置"
                        rules={[{ required: true, message: '入口配置为必填项' }]}
                    />
                </Space>
            ),
        },
        {
            title: '已用流量 (MB)',
            dataIndex: 'trafficUsed',
            valueType: 'digit',
            width: '10%',
            sorter: (a, b) => a.trafficUsed - b.trafficUsed,
        },
        {
            title: '途径节点',
            dataIndex: 'viaNodes',
            width: '15%',
            render: (_, record) => (
                <Space wrap>
                    {record.viaNodes && record.viaNodes.length > 0 ? (
                        record.viaNodes.map((node, index) => (
                            <Tag key={index} color="purple">{node}</Tag>
                        ))
                    ) : (
                        <span style={{ color: '#999' }}>无途径节点</span>
                    )}
                </Space>
            ),
            renderFormItem: () => (
                <ProFormText
                    name="viaNodes"
                    placeholder="输入节点，以逗号分隔"
                />
            ),
        },
        {
            title: '出口',
            key: 'exit',
            width: '15%',
            render: (_, record) => (
                <>
                    <Tag color={
                        record.exitType === 'DIRECT' ? 'green' : 
                        record.exitType === 'PROXY' ? 'orange' : 
                        'red'
                    }>
                        {exitTypeEnum[record.exitType].text}
                    </Tag>
                    <span>{record.exitConfig}</span>
                </>
            ),
            renderFormItem: () => (
                <Space>
                    <ProFormSelect
                        name="exitType"
                        placeholder="出口类型"
                        valueEnum={exitTypeEnum}
                        rules={[{ required: true, message: '出口类型为必填项' }]}
                    />
                    <ProFormText
                        name="exitConfig"
                        placeholder="出口配置"
                    />
                </Space>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: '10%',
            render: (_, record) => (
                <Badge 
                    status={
                        record.status === 'ACTIVE' ? 'success' : 
                        record.status === 'PAUSED' ? 'default' : 
                        'error'
                    } 
                    text={ruleStatusEnum[record.status].text} 
                />
            ),
            valueType: 'select',
            valueEnum: ruleStatusEnum,
            filters: true,
            onFilter: (value, record) => record.status === value,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '30%',
            render: (_, record) => [
                <Tooltip key="toggle" title={record.status === 'ACTIVE' ? '暂停' : '启动'}>
                    <a onClick={() => toggleRuleStatus(record)}>
                        {record.status === 'ACTIVE' ? 
                            <Tag icon={<PauseCircleOutlined />} color="default">暂停</Tag> : 
                            <Tag icon={<PlayCircleOutlined />} color="success">启动</Tag>
                        }
                    </a>
                </Tooltip>,
                <Tooltip key="diagnose" title="诊断">
                    <a onClick={() => diagnoseRule(record)}>
                        <Tag icon={<BugOutlined />} color="processing">诊断</Tag>
                    </a>
                </Tooltip>,
                <Tooltip key="copy" title="复制">
                    <a onClick={() => copyRule(record)}>
                        <Tag icon={<CopyOutlined />} color="cyan">复制</Tag>
                    </a>
                </Tooltip>,
                <Tooltip key="edit" title="编辑">
                    <a onClick={() => setEditableKeys([record.id])}>
                        <Tag icon={<EditOutlined />} color="blue">编辑</Tag>
                    </a>
                </Tooltip>,
                <Popconfirm
                    key="delete"
                    title="确定要删除此规则吗？"
                    onConfirm={() => deleteRule(record)}
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
        <>
            <QueryFilter
                defaultCollapsed
                split
                defaultColsNumber={3}
                onFinish={async (values) => {
                    console.log(values);
                    message.success('查询成功');
                }}
            >
                <ProFormText name="ruleId" label="规则ID" colProps={{ span: 8 }} />
                <ProFormSelect 
                    name="entryType" 
                    label="入口类型" 
                    colProps={{ span: 8 }}
                    valueEnum={entryTypeEnum}
                />
                <ProFormSelect 
                    name="exitType" 
                    label="出口类型" 
                    colProps={{ span: 8 }}
                    valueEnum={exitTypeEnum}
                />
                <ProFormSelect 
                    name="status" 
                    label="状态" 
                    colProps={{ span: 8 }}
                    valueEnum={ruleStatusEnum}
                />
            </QueryFilter>

            <EditableProTable<ForwardRuleItem>
                rowKey="id"
                headerTitle="转发规则列表"
                maxLength={20}
                scroll={{ x: 1200 }}
                recordCreatorProps={
                    position !== 'hidden'
                        ? {
                              position: position,
                              record: () => ({ 
                                id: (Math.random() * 1000000).toFixed(0), 
                                ruleId: `rule${Date.now().toString().substr(-6)}`, 
                                entryType: 'HTTP',
                                entryConfig: '',
                                trafficUsed: 0,
                                exitType: 'DIRECT',
                                exitConfig: '',
                                status: 'PAUSED',
                                viaNodes: []
                              }),
                          }
                        : false
                }
                loading={false}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setPosition('bottom');
                        }}
                        type="primary"
                    >
                        新建规则
                    </Button>,
                ]}
                columns={columns}
                request={async () => ({
                    data: defaultData,
                    total: 3,
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
        </>
    );
};

export default ForwardRules; 