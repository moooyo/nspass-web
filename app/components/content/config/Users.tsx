import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Badge, Tag, Popconfirm, Select, Modal } from 'antd';
import { message } from '@/utils/message';
import {
    ProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
    ModalForm,
    ProFormDigit,
    ProFormDatePicker,
} from '@ant-design/pro-components';
import { PlusOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
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
    const [dataSource, setDataSource] = useState<UserConfigItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRecord, setCurrentRecord] = useState<UserConfigItem | null>(null);
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

    // 打开新增弹窗
    const openCreateModal = () => {
        setModalMode('create');
        setCurrentRecord(null);
        setModalVisible(true);
    };

    // 打开编辑弹窗
    const openEditModal = (record: UserConfigItem) => {
        setModalMode('edit');
        setCurrentRecord(record);
        setModalVisible(true);
    };

    // 统一处理表单提交
    const handleModalSubmit = async (values: any) => {
        try {
            if (modalMode === 'create') {
                const userData: CreateUserConfigData = {
                    userId: values.userId,
                    username: values.username,
                    userGroup: values.userGroup,
                    expireTime: values.expireTime,
                    trafficLimit: values.trafficLimit,
                    trafficResetType: values.trafficResetType,
                    ruleLimit: values.ruleLimit,
                    banned: false,
                };

                const response = await usersConfigService.createUserConfig(userData);
                if (response.success) {
                    message.success('用户创建成功');
                } else {
                    message.error(response.message || '用户创建失败');
                    return false;
                }
            } else {
                if (!currentRecord) return false;

                const response = await usersConfigService.updateUserConfig(currentRecord.id, values);
                if (response.success) {
                    message.success('用户更新成功');
                } else {
                    message.error(response.message || '用户更新失败');
                    return false;
                }
            }

            setModalVisible(false);
            setCurrentRecord(null);
            loadUserConfigs();
            return true;
        } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
            return false;
        }
    };

    // 使用 useMemo 缓存表格列配置，避免每次渲染重新创建
    const columns: ProColumns<UserConfigItem>[] = useMemo(() => [
        {
            title: '用户ID',
            dataIndex: 'userId',
            width: '15%',
        },
        {
            title: '用户名',
            dataIndex: 'username',
            width: '15%',
        },
        {
            title: '用户组',
            dataIndex: 'userGroup',
            width: '12%',
        },
        {
            title: '过期时间',
            dataIndex: 'expireTime',
            valueType: 'date',
            width: '15%',
        },
        {
            title: '流量限制',
            dataIndex: 'trafficLimit',
            width: '12%',
            render: (value) => value ? `${value} MB` : '无限制',
        },
        {
            title: '流量重置',
            dataIndex: 'trafficResetType',
            width: '12%',
            valueEnum: {
                'monthly': { text: '每月重置' },
                'weekly': { text: '每周重置' },
                'never': { text: '不重置' },
            },
        },
        {
            title: '状态',
            dataIndex: 'banned',
            width: '10%',
            render: (banned) => (
                <Badge 
                    status={banned ? 'error' : 'success'} 
                    text={banned ? '已封禁' : '正常'} 
                />
            ),
        },
        {
            title: '操作',
            valueType: 'option',
            width: '25%',
            render: (_, record) => [
                <Button
                    key="edit"
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(record)}
                >
                    编辑
                </Button>,
                <Button
                    key="ban"
                    type="link"
                    size="small"
                    danger={!record.banned}
                    onClick={() => toggleBanUser(record)}
                >
                    {record.banned ? '解封' : '封禁'}
                </Button>,
                <Button
                    key="reset"
                    type="link"
                    size="small"
                    onClick={() => resetUserTraffic(record)}
                >
                    重置流量
                </Button>,
                <Button
                    key="invite"
                    type="link"
                    size="small"
                    onClick={() => inviteUser(record)}
                >
                    邀请注册
                </Button>,
            ],
        },
    ], [openEditModal, toggleBanUser, resetUserTraffic, inviteUser]);

    return (
        <div>
            {/* 统一的用户Modal */}
            <ModalForm
                title={modalMode === 'create' ? '新增用户' : '编辑用户'}
                width={600}
                open={modalVisible}
                onOpenChange={setModalVisible}
                onFinish={handleModalSubmit}
                initialValues={modalMode === 'edit' ? currentRecord || {} : {
                    userGroup: 'user',
                    trafficLimit: 1024,
                    trafficResetType: 'MONTHLY',
                    ruleLimit: 10
                }}
                modalProps={{
                    destroyOnHidden: true,
                }}
            >
                <ProFormText
                    name="userId"
                    label="用户ID"
                    placeholder="请输入用户ID"
                    rules={[{ required: true, message: '用户ID为必填项' }]}
                />
                <ProFormText
                    name="username"
                    label="用户名"
                    placeholder="请输入用户名"
                    rules={[{ required: true, message: '用户名为必填项' }]}
                />
                <ProFormSelect
                    name="userGroup"
                    label="用户组"
                    placeholder="请选择用户组"
                    options={userGroupOptions}
                    rules={[{ required: true, message: '用户组为必填项' }]}
                />
                <ProFormDatePicker
                    name="expireTime"
                    label="过期时间"
                    placeholder="请选择过期时间"
                    rules={[{ required: true, message: '过期时间为必填项' }]}
                />
                <ProFormDigit
                    name="trafficLimit"
                    label="流量限制 (MB)"
                    placeholder="请输入流量限制"
                    rules={[{ required: true, message: '流量限制为必填项' }]}
                />
                <ProFormSelect
                    name="trafficResetType"
                    label="流量重置方式"
                    placeholder="请选择流量重置方式"
                    valueEnum={trafficResetTypes}
                    rules={[{ required: true, message: '流量重置方式为必填项' }]}
                />
                <ProFormDigit
                    name="ruleLimit"
                    label="规则数量限制"
                    placeholder="请输入规则数量限制"
                    rules={[{ required: true, message: '规则数量限制为必填项' }]}
                />
            </ModalForm>

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

            <ProTable<UserConfigItem>
                rowKey="id"
                headerTitle="用户列表"
                scroll={{ x: 1200 }}
                loading={loading}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
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
                    </Button>
                ]}
                columns={columns}
                dataSource={dataSource}
                search={false}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
                    onChange: (page: number, pageSize: number) => {
                        loadUserConfigs({ page, pageSize });
                    },
                }}
            />
        </div>
    );
};

export default React.memo(Users); 