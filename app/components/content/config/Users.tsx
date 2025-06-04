import React, { useState, useEffect } from 'react';
import { Button, message, Space, Badge, Tag, Popconfirm, Select } from 'antd';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, UserAddOutlined, StopOutlined } from '@ant-design/icons';
import { 
    usersConfigService, 
    UserConfigItem, 
    CreateUserConfigData, 
    UserConfigListParams 
} from '@/services/usersConfig';

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

const Users: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<UserConfigItem[]>([]);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 加载用户配置列表
    const loadUserConfigs = async (params?: UserConfigListParams) => {
        try {
            setLoading(true);
            const response = await usersConfigService.getUserConfigs({
                page: pagination.current,
                pageSize: pagination.pageSize,
                ...params,
            });
            
            if (response.success && response.data) {
                setDataSource(response.data);
                if (response.pagination) {
                    setPagination({
                        current: response.pagination.current,
                        pageSize: response.pagination.pageSize,
                        total: response.pagination.total,
                    });
                }
            } else {
                message.error('加载用户配置失败');
            }
        } catch (error) {
            console.error('加载用户配置失败:', error);
            message.error('加载用户配置失败');
        } finally {
            setLoading(false);
        }
    };

    // 初始化加载数据
    useEffect(() => {
        loadUserConfigs();
    }, []);

    // 封禁/解除封禁用户
    const toggleBanUser = async (record: UserConfigItem) => {
        try {
            const response = await usersConfigService.toggleBanUser(record.id, !record.banned);
            if (response.success) {
                message.success(record.banned ? `已解除封禁用户: ${record.username}` : `已封禁用户: ${record.username}`);
                loadUserConfigs(); // 重新加载数据
            } else {
                message.error(response.message || '操作失败');
            }
        } catch (error) {
            console.error('封禁操作失败:', error);
            message.error('封禁操作失败');
        }
    };

    // 重置用户流量
    const resetUserTraffic = async (record: UserConfigItem) => {
        try {
            const response = await usersConfigService.resetUserTraffic(record.id);
            if (response.success) {
                message.success(`已重置用户 ${record.username} 的流量`);
            } else {
                message.error(response.message || '重置流量失败');
            }
        } catch (error) {
            console.error('重置流量失败:', error);
            message.error('重置流量失败');
        }
    };

    // 邀请注册
    const inviteUser = async (record: UserConfigItem) => {
        try {
            const response = await usersConfigService.inviteUser(record.id);
            if (response.success) {
                message.success(`已向用户 ${record.username} 发送邀请注册链接`);
            } else {
                message.error(response.message || '发送邀请失败');
            }
        } catch (error) {
            console.error('发送邀请失败:', error);
            message.error('发送邀请失败');
        }
    };

    const columns: ProColumns<UserConfigItem>[] = [
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
                    await loadUserConfigs(values);
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

            <EditableProTable<UserConfigItem>
                rowKey="id"
                headerTitle="用户列表"
                maxLength={20}
                scroll={{ x: 1200 }}
                recordCreatorProps={
                    position !== 'hidden'
                        ? {
                              position: position,
                              record: (): UserConfigItem => ({ 
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
                loading={loading}
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
                    <Button
                        key="refresh"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            loadUserConfigs();
                        }}
                    >
                        刷新
                    </Button>,
                ]}
                columns={columns}
                request={async () => {
                    // 这个函数在初始化时会被调用，但我们使用自己的loadUserConfigs
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
                    editableKeys,
                    onSave: async (rowKey, data, row) => {
                        try {
                            if (typeof rowKey === 'string' && rowKey.startsWith('temp')) {
                                // 新建用户
                                const createData: CreateUserConfigData = {
                                    userId: data.userId,
                                    username: data.username,
                                    userGroup: data.userGroup,
                                    expireTime: data.expireTime,
                                    trafficLimit: data.trafficLimit,
                                    trafficResetType: data.trafficResetType,
                                    ruleLimit: data.ruleLimit,
                                    banned: data.banned || false,
                                };
                                const response = await usersConfigService.createUserConfig(createData);
                                if (response.success) {
                                    message.success('用户创建成功');
                                    loadUserConfigs();
                                } else {
                                    message.error(response.message || '用户创建失败');
                                }
                                                        } else {
                                // 更新用户
                                const response = await usersConfigService.updateUserConfig(rowKey as React.Key, data);
                                if (response.success) {
                                    message.success('用户更新成功');
                                    loadUserConfigs();
                                } else {
                                    message.error(response.message || '用户更新失败');
                                }
                            }
                        } catch (error) {
                            console.error('保存失败:', error);
                            message.error('保存失败');
                        }
                    },
                    onChange: setEditableKeys,
                    onDelete: async (key) => {
                        try {
                            // 处理单个key或key数组
                            const keys = Array.isArray(key) ? key : [key];
                            if (keys.length === 1) {
                                const response = await usersConfigService.deleteUserConfig(keys[0]);
                                if (response.success) {
                                    message.success('用户删除成功');
                                    loadUserConfigs();
                                } else {
                                    message.error(response.message || '用户删除失败');
                                }
                            } else {
                                // 批量删除
                                const response = await usersConfigService.batchDeleteUserConfigs(keys);
                                if (response.success) {
                                    message.success(`成功删除 ${keys.length} 个用户`);
                                    loadUserConfigs();
                                } else {
                                    message.error(response.message || '批量删除失败');
                                }
                            }
                        } catch (error) {
                            console.error('删除失败:', error);
                            message.error('删除失败');
                        }
                    },
                }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
                    onChange: (page, pageSize) => {
                        setPagination(prev => ({ ...prev, current: page, pageSize }));
                        loadUserConfigs({ page, pageSize });
                    },
                }}
            />
        </>
    );
};

export default Users; 