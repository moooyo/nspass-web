import React, { useState } from 'react';
import { Button, message, Tag } from 'antd';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormSegmented,
    ProFormText,
    QueryFilter,
} from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';

type ServerItem = {
    id: React.Key;
    name?: string;
    ipv4?: string;
    ipv6?: string;
    region?: string;
    group?: string;
    registerTime?: string;
    uploadTraffic?: number;
    downloadTraffic?: number;
    status?: 'online' | 'offline';
};

const defaultData: ServerItem[] = [
    {
        id: 1,
        name: '服务器01',
        ipv4: '192.168.1.1',
        ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        region: '亚洲',
        group: '主要服务器',
        registerTime: '2023-01-01',
        uploadTraffic: 1024,
        downloadTraffic: 2048,
        status: 'online',
    },
    {
        id: 2,
        name: '服务器02',
        ipv4: '192.168.1.2',
        ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7335',
        region: '欧洲',
        group: '备用服务器',
        registerTime: '2023-02-01',
        uploadTraffic: 512,
        downloadTraffic: 1024,
        status: 'offline',
    },
];

const Servers: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<ServerItem[]>(defaultData);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');

    const columns: ProColumns<ServerItem>[] = [
        {
            title: '服务器名称',
            dataIndex: 'name',
            formItemProps: {
                rules: [{ required: true, message: '服务器名称为必填项' }],
            },
            width: '15%',
        },
        {
            title: 'IPV4地址',
            dataIndex: 'ipv4',
            formItemProps: {
                rules: [{ required: true, message: 'IPV4地址为必填项' }],
            },
            width: '15%',
        },
        {
            title: 'IPV6地址',
            dataIndex: 'ipv6',
            width: '20%',
        },
        {
            title: '区域',
            dataIndex: 'region',
            width: '10%',
        },
        {
            title: '服务器组',
            dataIndex: 'group',
            width: '10%',
        },
        {
            title: '注册时间',
            dataIndex: 'registerTime',
            valueType: 'date',
            width: '15%',
        },
        {
            title: '上传流量 (MB)',
            dataIndex: 'uploadTraffic',
            valueType: 'digit',
            width: '12%',
        },
        {
            title: '下载流量 (MB)',
            dataIndex: 'downloadTraffic',
            valueType: 'digit',
            width: '12%',
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueEnum: {
                online: { text: '在线', status: 'Success' },
                offline: { text: '离线', status: 'Error' },
            },
            render: (_, record) => (
                <Tag color={record.status === 'online' ? 'green' : 'red'}>
                    {record.status === 'online' ? '在线' : '离线'}
                </Tag>
            ),
            width: '10%',
        },
        {
            title: '操作',
            valueType: 'option',
            width: '10%',
            render: (_, record, __, action) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <a
                        key="editable"
                        onClick={() => {
                            action?.startEditable?.(record.id);
                        }}
                    >
                        编辑
                    </a>
                    <a
                        key="delete"
                        onClick={() => {
                            setDataSource(dataSource.filter((item) => item.id !== record.id));
                            message.success('删除成功');
                        }}
                    >
                        删除
                    </a>
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
                    message.success('查询成功');
                }}
            >
                <ProFormText name="name" label="服务器名称" colProps={{ span: 8 }} />
                <ProFormSegmented
                    name="status"
                    label="状态"
                    colProps={{ span: 8 }}
                    valueEnum={{
                        all: '全部',
                        online: '在线',
                        offline: '离线',
                    }}
                />
                <ProFormSelect
                    name="region"
                    label="区域"
                    colProps={{ span: 8 }}
                    request={async () => [
                        { label: '全部', value: 'all' },
                        { label: '亚洲', value: 'asia' },
                        { label: '欧洲', value: 'europe' },
                        { label: '美洲', value: 'america' },
                    ]}
                    placeholder="请选择区域"
                />
            </QueryFilter>

            <EditableProTable<ServerItem>
                rowKey="id"
                headerTitle="服务器列表"
                maxLength={5}
                scroll={{ x: 960 }}
                recordCreatorProps={
                    position !== 'hidden'
                        ? {
                              position: position,
                              record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
                          }
                        : false
                }
                loading={false}
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
                            新建
                        </Button>
                    );
                    return [<NewButton key="new" />];
                }}
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

export default Servers; 