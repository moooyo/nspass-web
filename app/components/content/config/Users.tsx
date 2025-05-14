import React, { useState } from 'react';
import { Button, message, Space, Badge, Tag, Popconfirm, Select } from 'antd';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, UserAddOutlined, StopOutlined } from '@ant-design/icons';

// 流量重置方式枚举
const trafficResetTypes = {
    NONE: { text: '不重置', value: 'NONE' },
    DAILY: { text: '每日', value: 'DAILY' },
    WEEKLY: { text: '每周', value: 'WEEKLY' },
    MONTHLY: { text: '每月', value: 'MONTHLY' },
};

// 用户组选项
const userGroupOptions = [
    { label: '管理员组', value: 'admin' },
    { label: '普通用户组', value: 'user' },
    { label: '访客组', value: 'guest' },
];

type UserItem = {
    id: React.Key;
    userId: string;
    username: string;
    userGroup: string;
    expireTime: string;
    trafficLimit: number; // MB
    trafficResetType: keyof typeof trafficResetTypes;
    ruleLimit: number;
    banned: boolean;
};

const defaultData: UserItem[] = [
    {
        id: 1,
        userId: 'user001',
        username: '张三',
        userGroup: 'admin',
        expireTime: '2024-12-31',
        trafficLimit: 10240, // 10GB
        trafficResetType: 'MONTHLY',
        ruleLimit: 50,
        banned: false,
    },
    {
        id: 2,
        userId: 'user002',
        username: '李四',
        userGroup: 'user',
        expireTime: '2024-10-15',
        trafficLimit: 5120, // 5GB
        trafficResetType: 'WEEKLY',
        ruleLimit: 20,
        banned: false,
    },
    {
        id: 3,
        userId: 'user003',
        username: '王五',
        userGroup: 'guest',
        expireTime: '2024-06-30',
        trafficLimit: 1024, // 1GB
        trafficResetType: 'NONE',
        ruleLimit: 10,
        banned: true,
    },
];

const Users: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<UserItem[]>(defaultData);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');

    // 封禁/解除封禁用户
    const toggleBanUser = (record: UserItem) => {
        const newDataSource = dataSource.map(item => {
            if (item.id === record.id) {
                return { ...item, banned: !item.banned };
            }
            return item;
        });
        setDataSource(newDataSource);
        message.success(record.banned ? `已解除封禁用户: ${record.username}` : `已封禁用户: ${record.username}`);
    };

    // 重置用户流量
    const resetUserTraffic = (record: UserItem) => {
        message.success(`已重置用户 ${record.username} 的流量`);
    };

    // 邀请注册
    const inviteUser = (record: UserItem) => {
        message.success(`已向用户 ${record.username} 发送邀请注册链接`);
    };

    const columns: ProColumns<UserItem>[] = [
        {
            title: '用户ID',
            dataIndex: 'userId',
            formItemProps: {
                rules: [{ required: true, message: '用户ID为必填项' }],
            },
            width: '10%',
        },
        {
            title: '用户名',
            dataIndex: 'username',
            formItemProps: {
                rules: [{ required: true, message: '用户名为必填项' }],
            },
            width: '10%',
        },
        {
            title: '用户组',
            dataIndex: 'userGroup',
            width: '10%',
            valueType: 'select',
            valueEnum: {
                admin: { text: '管理员组' },
                user: { text: '普通用户组' },
                guest: { text: '访客组' },
            },
            formItemProps: {
                rules: [{ required: true, message: '用户组为必填项' }],
            },
            renderFormItem: () => (
                <Select options={userGroupOptions} placeholder="请选择用户组" />
            ),
        },
        {
            title: '过期时间',
            dataIndex: 'expireTime',
            valueType: 'date',
            width: '12%',
            sorter: (a, b) => new Date(a.expireTime).getTime() - new Date(b.expireTime).getTime(),
        },
        {
            title: '流量限制 (MB)',
            dataIndex: 'trafficLimit',
            valueType: 'digit',
            width: '10%',
        },
        {
            title: '流量重置方式',
            dataIndex: 'trafficResetType',
            valueType: 'select',
            width: '10%',
            valueEnum: trafficResetTypes,
        },
        {
            title: '规则数量限制',
            dataIndex: 'ruleLimit',
            valueType: 'digit',
            width: '10%',
        },
        {
            title: '状态',
            dataIndex: 'banned',
            width: '8%',
            render: (_, record) => (
                <Badge 
                    status={record.banned ? 'error' : 'success'} 
                    text={record.banned ? '已封禁' : '正常'} 
                />
            ),
            valueType: 'select',
            valueEnum: {
                true: { text: '已封禁', status: 'Error' },
                false: { text: '正常', status: 'Success' },
            },
        },
        {
            title: '操作',
            valueType: 'option',
            width: '20%',
            render: (_, record) => [
                <Popconfirm
                    key="ban"
                    title={record.banned ? '确定要解除封禁该用户吗？' : '确定要封禁该用户吗？'}
                    onConfirm={() => toggleBanUser(record)}
                    okText="确定"
                    cancelText="取消"
                >
                    <a>
                        <Tag color={record.banned ? 'green' : 'red'}>
                            {record.banned ? '解除封禁' : '封禁'}
                        </Tag>
                    </a>
                </Popconfirm>,
                <Popconfirm
                    key="resetTraffic"
                    title="确定要重置该用户的流量吗？"
                    onConfirm={() => resetUserTraffic(record)}
                    okText="确定"
                    cancelText="取消"
                >
                    <a>
                        <Tag color="blue">重置流量</Tag>
                    </a>
                </Popconfirm>,
                <Popconfirm
                    key="invite"
                    title="确定要发送邀请注册链接吗？"
                    onConfirm={() => inviteUser(record)}
                    okText="确定"
                    cancelText="取消"
                >
                    <a>
                        <Tag color="purple">邀请注册</Tag>
                    </a>
                </Popconfirm>,
                <a
                    key="editable"
                    onClick={() => {
                        const editableKey = record.id;
                        setEditableKeys([editableKey]);
                    }}
                >
                    <Tag color="green">编辑</Tag>
                </a>,
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
                <ProFormText name="userId" label="用户ID" colProps={{ span: 8 }} />
                <ProFormText name="username" label="用户名" colProps={{ span: 8 }} />
                <ProFormSelect 
                    name="userGroup" 
                    label="用户组" 
                    colProps={{ span: 8 }}
                    options={userGroupOptions}
                    placeholder="请选择用户组"
                />
                <ProFormSelect 
                    name="banned" 
                    label="状态" 
                    colProps={{ span: 8 }}
                    valueEnum={{
                        '': '全部',
                        false: '正常',
                        true: '已封禁',
                    }}
                />
            </QueryFilter>

            <EditableProTable<UserItem>
                rowKey="id"
                headerTitle="用户列表"
                maxLength={20}
                scroll={{ x: 1200 }}
                recordCreatorProps={
                    position !== 'hidden'
                        ? {
                              position: position,
                              record: () => ({ 
                                id: (Math.random() * 1000000).toFixed(0), 
                                userId: '', 
                                username: '', 
                                userGroup: 'user',
                                expireTime: '',
                                trafficLimit: 1024,
                                trafficResetType: 'MONTHLY',
                                ruleLimit: 10,
                                banned: false
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
                        新建用户
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
                }}
            />
        </>
    );
};

export default Users; 