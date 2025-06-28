import React, { useState } from 'react';
import { Button, Tag, Modal } from 'antd';
import { message } from '@/utils/message';
import {
    ProTable,
    ProColumns,
    ProFormSelect,
    ProFormSegmented,
    ProFormText,
    QueryFilter,
    ModalForm,
    ProFormDigit,
    ProFormDatePicker,
} from '@ant-design/pro-components';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

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
    const [dataSource, setDataSource] = useState<ServerItem[]>(defaultData);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRecord, setCurrentRecord] = useState<ServerItem | null>(null);

    // 打开新增弹窗
    const openCreateModal = () => {
        setModalMode('create');
        setCurrentRecord(null);
        setModalVisible(true);
    };

    // 打开编辑弹窗
    const openEditModal = (record: ServerItem) => {
        setModalMode('edit');
        setCurrentRecord(record);
        setModalVisible(true);
    };

    // 统一处理表单提交
    const handleModalSubmit = async (values: any) => {
        try {
            if (modalMode === 'create') {
                const newServer: ServerItem = {
                    id: Date.now(),
                    name: values.name,
                    ipv4: values.ipv4,
                    ipv6: values.ipv6,
                    region: values.region,
                    group: values.group,
                    registerTime: values.registerTime,
                    uploadTraffic: values.uploadTraffic || 0,
                    downloadTraffic: values.downloadTraffic || 0,
                    status: values.status || 'offline',
                };
                setDataSource([...dataSource, newServer]);
                message.success('服务器创建成功');
            } else {
                if (!currentRecord) return false;
                
                const updatedDataSource = dataSource.map(item => 
                    item.id === currentRecord.id ? { ...item, ...values } : item
                );
                setDataSource(updatedDataSource);
                message.success('服务器更新成功');
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

    // 删除服务器
    const deleteServer = (record: ServerItem) => {
        setDataSource(dataSource.filter((item) => item.id !== record.id));
        message.success('删除成功');
    };

    const columns: ProColumns<ServerItem>[] = [
        {
            title: '服务器名称',
            dataIndex: 'name',
            width: '15%',
        },
        {
            title: 'IPV4地址',
            dataIndex: 'ipv4',
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
            width: '15%',
            render: (_, record) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                        key="edit"
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        key="delete"
                        type="link"
                        size="small"
                        danger
                        onClick={() => deleteServer(record)}
                    >
                        删除
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            {/* 统一的服务器Modal */}
            <ModalForm
                title={modalMode === 'create' ? '新增服务器' : '编辑服务器'}
                width={600}
                open={modalVisible}
                onOpenChange={setModalVisible}
                onFinish={handleModalSubmit}
                initialValues={modalMode === 'edit' ? currentRecord || {} : {
                    uploadTraffic: 0,
                    downloadTraffic: 0,
                    status: 'offline'
                }}
                modalProps={{
                    destroyOnClose: true,
                }}
            >
                <ProFormText
                    name="name"
                    label="服务器名称"
                    placeholder="请输入服务器名称"
                    rules={[{ required: true, message: '服务器名称为必填项' }]}
                />
                <ProFormText
                    name="ipv4"
                    label="IPV4地址"
                    placeholder="请输入IPV4地址"
                    rules={[{ required: true, message: 'IPV4地址为必填项' }]}
                />
                <ProFormText
                    name="ipv6"
                    label="IPV6地址"
                    placeholder="请输入IPV6地址"
                />
                <ProFormText
                    name="region"
                    label="区域"
                    placeholder="请输入区域"
                />
                <ProFormText
                    name="group"
                    label="服务器组"
                    placeholder="请输入服务器组"
                />
                <ProFormDatePicker
                    name="registerTime"
                    label="注册时间"
                    placeholder="请选择注册时间"
                />
                <ProFormDigit
                    name="uploadTraffic"
                    label="上传流量 (MB)"
                    placeholder="请输入上传流量"
                />
                <ProFormDigit
                    name="downloadTraffic"
                    label="下载流量 (MB)"
                    placeholder="请输入下载流量"
                />
                <ProFormSelect
                    name="status"
                    label="状态"
                    placeholder="请选择状态"
                    options={[
                        { label: '在线', value: 'online' },
                        { label: '离线', value: 'offline' },
                    ]}
                />
            </ModalForm>

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

            <ProTable<ServerItem>
                rowKey="id"
                headerTitle="服务器列表"
                scroll={{ x: 960 }}
                loading={false}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                        type="primary"
                    >
                        新建服务器
                    </Button>
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

export default Servers; 