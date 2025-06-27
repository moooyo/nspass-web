import React, { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Tag, Popconfirm, Select } from 'antd';
import { message } from '@/utils/message';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
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

    // 加载用户配置列表 - 修复依赖循环问题
    const loadUserConfigs = useCallback(async (params?: UserConfigListParams) => {
        try {
            setLoading(true);
            // 使用传入的参数或当前状态，避免依赖 pagination 状态
            const requestParams = {
                page: params?.page || pagination.current,
                pageSize: params?.pageSize || pagination.pageSize,
                ...params,
            };
            
            const response = await usersConfigService.getUserConfigs(requestParams);
            
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
    }, []); // 移除 pagination 依赖

    // 初始化加载数据
    useEffect(() => {
        loadUserConfigs();
    }, [loadUserConfigs]);

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
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Badge 
                        status={record.banned ? 'error' : 'success'} 
                        text={record.banned ? '已封禁' : '正常'} 
                    />
                </div>
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
            render: (_, record) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
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
                    </Popconfirm>
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
                    </Popconfirm>
                    <Popconfirm
                        key="invite"
                        title="确定要发送邀请注册链接吗？"
                        onConfirm={() => inviteUser(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <a>
                            <Tag color="orange">邀请注册</Tag>
                        </a>
                    </Popconfirm>
                </div>
            ),
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
                toolBarRender={() => {
                    const NewButton = () => (
                        <Button
                            key="button"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setPosition('bottom');
                            }}
                            type="primary"
                        >
                            新建用户
                        </Button>
                    );
                    const RefreshButton = () => (
                        <Button
                            key="refresh"
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                loadUserConfigs();
                            }}
                        >
                            刷新
                        </Button>
                    );
                    return [<NewButton key="new" />, <RefreshButton key="refresh" />];
                }}
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
                    onSave: async (key, record) => {
                        try {
                            if (typeof record.id === 'string' && record.id.includes('.')) {
                                // 新建记录
                                const response = await usersConfigService.createUserConfig(record as CreateUserConfigData);
                                if (response.success) {
                                    message.success('用户创建成功');
                                    loadUserConfigs(); // 重新加载数据
                                } else {
                                    message.error(response.message || '用户创建失败');
                                }
                            } else {
                                // 更新记录
                                const response = await usersConfigService.updateUserConfig(record.id, record);
                                if (response.success) {
                                    message.success('用户更新成功');
                                    loadUserConfigs(); // 重新加载数据
                                } else {
                                    message.error(response.message || '用户更新失败');
                                }
                            }
                        } catch (error) {
                            console.error('保存失败:', error);
                            message.error('保存失败');
                        }
                    },
                    onDelete: async (key, record) => {
                        try {
                            const response = await usersConfigService.deleteUserConfig(record.id);
                            if (response.success) {
                                message.success('用户删除成功');
                                loadUserConfigs(); // 重新加载数据
                            } else {
                                message.error(response.message || '用户删除失败');
                            }
                        } catch (error) {
                            console.error('删除失败:', error);
                        }
                    },
                    onValuesChange: (record, recordList) => {
                        setDataSource(recordList);
                    },
                    deleteText: '删除',
                    deletePopconfirmMessage: '确定删除这条记录吗？',
                    onlyOneLineEditorAlertMessage: '只能同时编辑一行记录',
                    onlyAddOneLineAlertMessage: '只能同时新增一行记录',
                    actionRender: (row, config, dom) => [dom.save, dom.cancel, dom.delete],
                    onChange: setEditableKeys,
                }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
                    onChange: (page, pageSize) => {
                        // 直接调用 loadUserConfigs 并传入新的分页参数
                        loadUserConfigs({ page, pageSize });
                    },
                }}
            />
        </div>
    );
};

export default Users; 