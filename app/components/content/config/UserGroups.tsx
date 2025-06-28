import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { message } from '@/utils/message';
import {
    ProTable,
    ProColumns,
    ProFormText,
    QueryFilter,
    ModalForm,
    ProFormDigit,
} from '@ant-design/pro-components';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

type UserGroupItem = {
    id: React.Key;
    groupId: string;
    groupName: string;
    userCount: number;
};

const defaultData: UserGroupItem[] = [
    {
        id: 1,
        groupId: 'admin',
        groupName: '管理员组',
        userCount: 3,
    },
    {
        id: 2,
        groupId: 'user',
        groupName: '普通用户组',
        userCount: 42,
    },
    {
        id: 3,
        groupId: 'guest',
        groupName: '访客组',
        userCount: 15,
    },
];

const UserGroups: React.FC = () => {
    const [dataSource, setDataSource] = useState<UserGroupItem[]>(defaultData);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRecord, setCurrentRecord] = useState<UserGroupItem | null>(null);

    // 打开新增弹窗
    const openCreateModal = () => {
        setModalMode('create');
        setCurrentRecord(null);
        setModalVisible(true);
    };

    // 打开编辑弹窗
    const openEditModal = (record: UserGroupItem) => {
        setModalMode('edit');
        setCurrentRecord(record);
        setModalVisible(true);
    };

    // 统一处理表单提交
    const handleModalSubmit = async (values: any) => {
        try {
            if (modalMode === 'create') {
                const newGroup: UserGroupItem = {
                    id: Date.now(),
                    groupId: values.groupId,
                    groupName: values.groupName,
                    userCount: 0,
                };
                setDataSource([...dataSource, newGroup]);
                message.success('用户组创建成功');
            } else {
                if (!currentRecord) return false;
                
                const updatedDataSource = dataSource.map(item => 
                    item.id === currentRecord.id 
                        ? { ...item, groupId: values.groupId, groupName: values.groupName }
                        : item
                );
                setDataSource(updatedDataSource);
                message.success('用户组更新成功');
            }

            setModalVisible(false);
            setCurrentRecord(null);
            return true;
        } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
            return false;
        }
    };

    // 删除用户组
    const deleteUserGroup = (record: UserGroupItem) => {
        setDataSource(dataSource.filter((item) => item.id !== record.id));
        message.success('删除成功');
    };

    const columns: ProColumns<UserGroupItem>[] = [
        {
            title: '用户组ID',
            dataIndex: 'groupId',
            width: '25%',
        },
        {
            title: '用户组名称',
            dataIndex: 'groupName',
            width: '40%',
        },
        {
            title: '用户数量',
            dataIndex: 'userCount',
            width: '20%',
            sorter: (a, b) => a.userCount - b.userCount,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '15%',
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
                    key="delete"
                    type="link"
                    size="small"
                    danger
                    onClick={() => deleteUserGroup(record)}
                >
                    删除
                </Button>,
            ],
        },
    ];

    return (
        <div>
            {/* 统一的用户组Modal */}
            <ModalForm
                title={modalMode === 'create' ? '新增用户组' : '编辑用户组'}
                width={500}
                open={modalVisible}
                onOpenChange={setModalVisible}
                onFinish={handleModalSubmit}
                initialValues={modalMode === 'edit' ? currentRecord || {} : {}}
                modalProps={{
                    destroyOnClose: true,
                }}
            >
                <ProFormText
                    name="groupId"
                    label="用户组ID"
                    placeholder="请输入用户组ID"
                    rules={[{ required: true, message: '用户组ID为必填项' }]}
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
                    console.log(values);
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
                loading={false}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                        type="primary"
                    >
                        新建用户组
                    </Button>,
                ]}
                columns={columns}
                dataSource={dataSource}
                search={false}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />
        </div>
    );
};

export default UserGroups; 