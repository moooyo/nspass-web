import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button, Alert } from 'antd';
import { message } from '@/utils/message';
import {
    ProTable,
    ProColumns,
    ProFormText,
    QueryFilter,
    ModalForm,
} from '@ant-design/pro-components';
import { PlusOutlined, EditOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { 
    userGroupsService, 
    UserGroupItem, 
    CreateUserGroupData, 
    UserGroupListParams 
} from '../../../services/userGroups';

const UserGroups: React.FC = () => {
    const [dataSource, setDataSource] = useState<UserGroupItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMode] = useState<'create' | 'edit'>('create');
    const [currentRecord] = useState<UserGroupItem | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // 加载用户组列表
    const loadUserGroups = useCallback(async (params?: UserGroupListParams) => {
        try {
            setLoading(true);
            const requestParams = {
                page: params?.page || pagination.current,
                pageSize: params?.pageSize || pagination.pageSize,
                ...params,
            };
            
            const response = await userGroupsService.getUserGroups(requestParams);
            
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
                message.error(response.message || '加载用户组列表失败');
            }
        } catch (error) {
            console.error('加载用户组列表失败:', error);
            message.error('加载用户组列表失败');
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize]);

    // 初始化加载数据
    useEffect(() => {
        loadUserGroups();
    }, []);

    // 打开新增弹窗
    const openCreateModal = useCallback(() => {
        message.warning('当前版本不支持独立创建用户组，请通过用户管理来设置用户组');
    }, []);

    // 打开编辑弹窗
    const openEditModal = useCallback((_record: UserGroupItem) => {
        message.warning('当前版本不支持直接编辑用户组，请通过用户管理来修改用户的用户组属性');
    }, []);

    // 统一处理表单提交
    const handleModalSubmit = useCallback(async (values: CreateUserGroupData) => {
        try {
            if (modalMode === 'create') {
                const response = await userGroupsService.createUserGroup(values);
                if (response.success) {
                    message.success('用户组创建成功');
                    setModalVisible(false);
                    loadUserGroups();
                    return true;
                } else {
                    message.error(response.message || '用户组创建失败');
                    return false;
                }
            } else {
                if (!currentRecord) return false;
                
                const response = await userGroupsService.updateUserGroup(currentRecord.id, values);
                if (response.success) {
                    message.success('用户组更新成功');
                    setModalVisible(false);
                    loadUserGroups();
                    return true;
                } else {
                    message.error(response.message || '用户组更新失败');
                    return false;
                }
            }
        } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
            return false;
        }
    }, [modalMode, currentRecord, loadUserGroups]);

    // 删除用户组
    const deleteUserGroup = useCallback(async (_record: UserGroupItem) => {
        message.warning('当前版本不支持删除用户组，用户组会根据用户设置自动管理');
    }, []);

    // 使用 useMemo 缓存表格列配置，避免每次渲染重新创建
    const columns: ProColumns<UserGroupItem>[] = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '10%',
            search: false,
        },
        {
            title: '用户组ID',
            dataIndex: 'groupId',
            width: '25%',
        },
        {
            title: '用户组名称',
            dataIndex: 'groupName',
            width: '35%',
        },
        {
            title: '用户数量',
            dataIndex: 'userCount',
            width: '15%',
            search: false,
            sorter: (a, b) => a.userCount - b.userCount,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '15%',
            render: (_, record) => [
                <Button
                    key="view"
                    type="link"
                    size="small"
                    icon={<InfoCircleOutlined />}
                    onClick={() => message.info(`用户组 ${record.groupName} 当前有 ${record.userCount} 个用户`)}
                >
                    查看
                </Button>,
                <Button
                    key="edit"
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEditModal(record)}
                    disabled
                    title="当前版本不支持直接编辑用户组"
                >
                    编辑
                </Button>,
                <Button
                    key="delete"
                    type="link"
                    size="small"
                    danger
                    onClick={() => deleteUserGroup(record)}
                    disabled
                    title="当前版本不支持删除用户组"
                >
                    删除
                </Button>,
            ],
        },
    ], [openEditModal, deleteUserGroup]);

    return (
        <div>
            {/* 功能说明 */}
            <Alert
                message="用户组管理说明"
                description={
                    <div>
                        <p>• 用户组数据从用户管理中自动统计生成</p>
                        <p>• 要修改用户的用户组，请前往<strong>用户管理</strong>页面编辑具体用户</p>
                        <p>• 当前版本不支持独立的用户组创建/编辑/删除操作</p>
                        <p>• 用户组会根据用户设置自动更新统计信息</p>
                    </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            {/* 统一的用户组Modal */}
            <ModalForm
                title={modalMode === 'create' ? '新增用户组' : '编辑用户组'}
                width={500}
                open={modalVisible}
                onOpenChange={setModalVisible}
                onFinish={handleModalSubmit}
                initialValues={modalMode === 'edit' ? currentRecord || {} : {}}
                modalProps={{
                    destroyOnHidden: true,
                }}
            >
                <ProFormText
                    name="groupId"
                    label="用户组ID"
                    placeholder="请输入用户组ID"
                    rules={[{ required: true, message: '用户组ID为必填项' }]}
                    disabled={modalMode === 'edit'} // 编辑时不允许修改groupId
                />
                <ProFormText
                    name="groupName"
                    label="用户组名称"
                    placeholder="请输入用户组名称"
                    rules={[{ required: true, message: '用户组名称为必填项' }]}
                />
            </ModalForm>

            <QueryFilter
                defaultCollapsed
                split
                defaultColsNumber={2}
                onFinish={async (values) => {
                    await loadUserGroups(values);
                    message.success('查询成功');
                }}
            >
                <ProFormText name="groupId" label="用户组ID" colProps={{ span: 12 }} />
                <ProFormText name="groupName" label="用户组名称" colProps={{ span: 12 }} />
            </QueryFilter>

            <ProTable<UserGroupItem>
                rowKey="id"
                headerTitle="用户组列表"
                scroll={{ x: 800 }}
                loading={loading}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                        type="primary"
                        disabled
                        title="当前版本不支持独立创建用户组"
                    >
                        新建用户组
                    </Button>,
                    <Button
                        key="refresh"
                        icon={<ReloadOutlined />}
                        onClick={() => loadUserGroups()}
                    >
                        刷新
                    </Button>,
                ]}
                columns={columns}
                request={async () => {
                    return {
                        data: dataSource,
                        total: pagination.total,
                        success: true,
                    };
                }}
                search={false}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
                    onChange: (page, pageSize) => {
                        loadUserGroups({ page, pageSize });
                    },
                }}
            />
        </div>
    );
};

export default UserGroups; 