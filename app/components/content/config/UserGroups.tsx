import React, { useState } from 'react';
import { Button, message } from 'antd';
import {
    EditableProTable,
    ProColumns,
    ProFormText,
    QueryFilter,
} from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';

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
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<UserGroupItem[]>(defaultData);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');

    const columns: ProColumns<UserGroupItem>[] = [
        {
            title: '用户组ID',
            dataIndex: 'groupId',
            formItemProps: {
                rules: [{ required: true, message: '用户组ID为必填项' }],
            },
            width: '25%',
        },
        {
            title: '用户组名称',
            dataIndex: 'groupName',
            formItemProps: {
                rules: [{ required: true, message: '用户组名称为必填项' }],
            },
            width: '40%',
        },
        {
            title: '用户数量',
            dataIndex: 'userCount',
            valueType: 'digit',
            width: '20%',
            sorter: (a, b) => a.userCount - b.userCount,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '15%',
            render: (_, record, __, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.id);
                    }}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    onClick={() => {
                        setDataSource(dataSource.filter((item) => item.id !== record.id));
                        message.success('删除成功');
                    }}
                >
                    删除
                </a>,
            ],
        },
    ];

    return (
        <div>
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

            <EditableProTable<UserGroupItem>
                rowKey="id"
                headerTitle="用户组列表"
                maxLength={10}
                scroll={{ x: 800 }}
                recordCreatorProps={
                    position !== 'hidden'
                        ? {
                              position: position,
                              record: () => ({ 
                                id: (Math.random() * 1000000).toFixed(0), 
                                groupId: '', 
                                groupName: '', 
                                userCount: 0 
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
                        新建用户组
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
        </div>
    );
};

export default UserGroups; 