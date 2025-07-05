import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Button, Tag, Modal, Input, Typography, Space, Alert } from 'antd';
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
    ActionType
} from '@ant-design/pro-components';
import { PlusOutlined, EditOutlined, CopyOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import ReactCountryFlag from 'react-country-flag';
import { message } from '@/utils/message';
import { 
  ServerService, 
  statusToString,
  stringToStatus,
  type ServerListParams,
  type CreateServerParams,
  type UpdateServerParams
} from '@/services/servers';
import type { ServerItem } from '@/types/generated/api/servers/server_management';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// 导入国家数据
const countryFlagEmoji = require('country-flag-emoji');

// 从第三方库获取所有国家数据
const allCountries = countryFlagEmoji.list;

// 常用国家代码
const popularCountryCodes = [
    'CN', 'US', 'JP', 'DE', 'GB', 'FR', 'CA', 'AU', 'KR', 'SG', 
    'HK', 'TW', 'RU', 'IN', 'BR', 'NL', 'CH', 'SE', 'NO', 'IT'
];

// 生成完整的国家选项列表
const getCountryOptions = () => {
    // 获取常用国家
    const popularCountries = popularCountryCodes
        .map(code => countryFlagEmoji.get(code))
        .filter(Boolean);
    
    // 获取其他国家（排除常用国家）
    const otherCountries = allCountries.filter((country: any) => 
        !popularCountryCodes.includes(country.code)
    );
    
    const createCountryOption = (country: any) => ({
        label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReactCountryFlag 
                    countryCode={country.code}
                    svg
                    style={{
                        width: '16px',
                        height: '12px'
                    }}
                />
                {country.name}
            </span>
        ),
        value: country.name
    });
    
    return [
        // 常用国家分组
        {
            label: '── 常用国家 ──',
            value: 'divider-popular',
            disabled: true
        },
        ...popularCountries.map(createCountryOption),
        // 其他国家分组
        {
            label: '── 其他国家 ──',
            value: 'divider-others', 
            disabled: true
        },
        ...otherCountries.map(createCountryOption)
    ];
};

// 根据国家名称获取国家代码
const getCountryCodeByName = (countryName: string): string | null => {
    const country = allCountries.find((c: any) => c.name === countryName);
    return country ? country.code : null;
};

// 根据国家名称获取国旗组件
const getFlagByCountryName = (countryName?: string) => {
    if (!countryName) return <span style={{ marginRight: '6px' }}>🌍</span>;
    
    const countryCode = getCountryCodeByName(countryName);
    if (!countryCode) return <span style={{ marginRight: '6px' }}>🌍</span>;
    
    return (
        <ReactCountryFlag 
            countryCode={countryCode}
            svg
            style={{
                width: '20px',
                height: '15px',
                marginRight: '6px'
            }}
            title={countryName}
        />
    );
};

const Servers: React.FC = () => {
    const actionRef = useRef<ActionType>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRecord, setCurrentRecord] = useState<ServerItem | null>(null);
    const [currentServers, setCurrentServers] = useState<ServerItem[]>([]);
    const [installModalVisible, setInstallModalVisible] = useState<boolean>(false);
    const [installCommand, setInstallCommand] = useState<string>('');
    const [installServerInfo, setInstallServerInfo] = useState<ServerItem | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    // 获取当前服务器中存在的国家（去重）
    const getAvailableCountries = () => {
        return [...new Set(
            currentServers
                .map(server => server.country)
                .filter(Boolean) // 过滤掉空值
        )] as string[];
    };

    // 使用 useMemo 缓存国家valueEnum
    const countryValueEnum = useMemo(() => {
        const countries = [...new Set(
            currentServers
                .map(server => server.country)
                .filter(Boolean) // 过滤掉空值
        )] as string[];
        
        const valueEnum: Record<string, { text: string; status: string }> = {
            all: { text: '全部', status: 'Default' }
        };
        
        countries.forEach(country => {
            valueEnum[country] = { text: country, status: 'Default' };
        });
        
        return valueEnum;
    }, [currentServers]);

    // 使用 useMemo 缓存服务器组valueEnum
    const groupValueEnum = useMemo(() => {
        const groups = [...new Set(
            currentServers
                .map(server => server.group)
                .filter(Boolean) // 过滤掉空值
        )] as string[];
        
        const valueEnum: Record<string, { text: string; status: string }> = {
            all: { text: '全部', status: 'Default' }
        };
        
        groups.forEach(group => {
            valueEnum[group] = { text: group, status: 'Default' };
        });
        
        return valueEnum;
    }, [currentServers]);

    // 使用 useCallback 缓存函数引用
    const openCreateModal = useCallback(() => {
        setModalMode('create');
        setCurrentRecord(null);
        setModalVisible(true);
    }, []);

    // 打开编辑弹窗
    const openEditModal = useCallback((record: ServerItem) => {
        setModalMode('edit');
        setCurrentRecord(record);
        setModalVisible(true);
    }, []);

    // 统一处理表单提交
    const handleModalSubmit = async (values: any) => {
        try {
            if (modalMode === 'create') {
                const createData: CreateServerParams = {
                    name: values.name,
                    country: values.country,
                    group: values.group,
                    registerTime: values.registerTime || new Date().toISOString(),
                    uploadTraffic: values.uploadTraffic || 0,
                    downloadTraffic: values.downloadTraffic || 0,
                    status: 'pending_install', // 新建服务器默认状态为等待安装
                };
                
                await ServerService.createServer(createData);
                message.success('服务器创建成功');
            } else {
                if (!currentRecord) return false;
                
                const updateData: UpdateServerParams = {
                    ...values,
                    status: values.status // 保持字符串格式，服务层会转换
                };
                
                await ServerService.updateServer(currentRecord.id!, updateData);
                message.success('服务器更新成功');
            }

            setModalVisible(false);
            setCurrentRecord(null);
            actionRef.current?.reload();
            return true;
        } catch (error) {
            console.error('操作失败:', error);
            message.error(error instanceof Error ? error.message : '操作失败');
            return false;
        }
    };

    // 删除服务器
    const deleteServer = useCallback(async (record: ServerItem) => {
        try {
            await ServerService.deleteServer(record.id!);
            message.success('删除成功');
            actionRef.current?.reload();
        } catch (error) {
            console.error('删除失败:', error);
            message.error(error instanceof Error ? error.message : '删除失败');
        }
    }, []);

    // 处理安装
    const handleInstall = useCallback(async (record: ServerItem) => {
        try {
            if (!record.token) {
                message.error('服务器缺少认证令牌，请重新创建服务器');
                return;
            }

            // 生成安装命令 - 使用环境变量的方式传递参数
            const command = `export NSPASS_SERVER_ID="${record.id}" && export NSPASS_TOKEN="${record.token}" && curl -sSL https://raw.githubusercontent.com/nspass/nspass-agent/main/scripts/install.sh | bash`;
            
            setInstallCommand(command);
            setInstallServerInfo(record);
            setInstallModalVisible(true);
            setCopySuccess(false);
        } catch (error) {
            console.error('生成安装命令失败:', error);
            message.error(error instanceof Error ? error.message : '生成安装命令失败');
        }
    }, []);

    // 复制安装命令到剪贴板
    const handleCopyInstallCommand = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(installCommand);
            setCopySuccess(true);
            message.success('安装命令已复制到剪贴板');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('复制到剪贴板失败:', error);
            message.error('复制失败，请手动复制命令');
        }
    }, [installCommand]);

    // 使用 useMemo 缓存表格列配置，避免每次渲染重新创建
    const columns: ProColumns<ServerItem>[] = useMemo(() => [
        {
            title: '服务器名称',
            dataIndex: 'name',
            width: '15%',
        },
        {
            title: 'IPV4地址',
            dataIndex: 'ipv4',
            width: '15%',
            hideInSearch: true,
        },
        {
            title: 'IPV6地址',
            dataIndex: 'ipv6',
            width: '20%',
            hideInSearch: true,
        },
        {
            title: '国家',
            dataIndex: 'country',
            width: '10%',
            valueEnum: countryValueEnum,
            render: (_, record) => (
                <span>
                    {getFlagByCountryName(record.country)} {record.country}
                </span>
            ),
        },
        {
            title: '服务器组',
            dataIndex: 'group',
            width: '10%',
            valueEnum: groupValueEnum,
        },
        {
            title: '注册时间',
            dataIndex: 'registerTime',
            valueType: 'date',
            width: '15%',
            hideInSearch: true,
        },
        {
            title: '上传流量 (MB)',
            dataIndex: 'uploadTraffic',
            valueType: 'digit',
            width: '12%',
            hideInSearch: true,
        },
        {
            title: '下载流量 (MB)',
            dataIndex: 'downloadTraffic',
            valueType: 'digit',
            width: '12%',
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: '10%',
            valueEnum: {
                all: { text: '全部', status: 'Default' },
                online: { text: '在线', status: 'Success' },
                offline: { text: '离线', status: 'Error' },
                pending_install: { text: '等待安装', status: 'Processing' },
                unknown: { text: '未知', status: 'Warning' },
            },
            render: (_, record) => {
                const statusText = statusToString(record.status!);
                const statusConfig = {
                    online: { color: 'green', text: '在线' },
                    offline: { color: 'red', text: '离线' },
                    pending_install: { color: 'blue', text: '等待安装' },
                    unknown: { color: 'orange', text: '未知' },
                };
                const config = statusConfig[statusText as keyof typeof statusConfig] || statusConfig.unknown;
                return (
                    <Tag color={config.color}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: '操作',
            valueType: 'option',
            width: '20%',
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
                    {statusToString(record.status!) === 'pending_install' && (
                        <Button
                            key="install"
                            type="link"
                            size="small"
                            style={{ color: '#1890ff' }}
                            icon={<CopyOutlined />}
                            onClick={() => handleInstall(record)}
                        >
                            复制安装命令
                        </Button>
                    )}
                    <Button
                        key="delete"
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteServer(record)}
                    >
                        删除
                    </Button>
                </div>
            ),
        },
    ], [currentServers, openEditModal, handleInstall, deleteServer]);

    return (
        <div>
            {/* 统一的服务器Modal */}
            <ModalForm
                title={modalMode === 'create' ? '新增服务器' : '编辑服务器'}
                width={600}
                open={modalVisible}
                onOpenChange={setModalVisible}
                onFinish={handleModalSubmit}
                initialValues={modalMode === 'edit' && currentRecord ? {
                    ...currentRecord,
                    status: statusToString(currentRecord.status!)
                } : {
                    uploadTraffic: 0,
                    downloadTraffic: 0,
                    registerTime: new Date().toISOString().split('T')[0],
                    status: 'pending_install',
                }}
                modalProps={{
                    destroyOnHidden: true,
                }}
            >
                <ProFormText
                    name="name"
                    label="服务器名称"
                    placeholder="请输入服务器名称"
                    rules={[{ required: true, message: '服务器名称为必填项' }]}
                />
                {modalMode === 'edit' && (
                    <>
                        <ProFormText
                            name="ipv4"
                            label="IPV4地址"
                            placeholder="IPV4地址由系统自动上报"
                            disabled
                        />
                        <ProFormText
                            name="ipv6"
                            label="IPV6地址"
                            placeholder="IPV6地址由系统自动上报"
                            disabled
                        />
                    </>
                )}
                <ProFormSelect
                    name="country"
                    label="国家"
                    placeholder="请选择国家"
                    showSearch
                    request={async () => getCountryOptions()}
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
                    disabled={modalMode === 'create'}
                    options={[
                        { label: '在线', value: 'online' },
                        { label: '离线', value: 'offline' },
                        { label: '等待安装', value: 'pending_install' },
                        { label: '未知', value: 'unknown' },
                    ]}
                />
                {modalMode === 'create' && (
                    <div style={{ background: '#e6f7ff', padding: '12px', borderRadius: '4px', marginBottom: '16px', border: '1px solid #91d5ff' }}>
                        <p style={{ margin: 0, color: '#0050b3', fontSize: '14px' }}>
                            💡 新建服务器时状态默认为"等待安装"，IPV4和IPV6地址将在服务器安装后自动上报
                        </p>
                    </div>
                )}
            </ModalForm>

            {/* 安装命令模态框 */}
            <Modal
                title={<Title level={4}>安装 NSPass Agent</Title>}
                open={installModalVisible}
                onCancel={() => setInstallModalVisible(false)}
                width={800}
                footer={[
                    <Button key="close" onClick={() => setInstallModalVisible(false)}>
                        关闭
                    </Button>,
                    <Button 
                        key="copy" 
                        type="primary" 
                        icon={copySuccess ? <CheckOutlined /> : <CopyOutlined />}
                        onClick={handleCopyInstallCommand}
                        style={{ backgroundColor: copySuccess ? '#52c41a' : undefined }}
                    >
                        {copySuccess ? '已复制' : '复制命令'}
                    </Button>,
                ]}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Alert
                        message="安装说明"
                        description={
                            <div>
                                <p>请在目标服务器上执行以下命令来安装 NSPass Agent：</p>
                                <ul>
                                    <li>确保服务器有 root 权限</li>
                                    <li>确保服务器可以访问 GitHub 和互联网</li>
                                    <li>支持的系统：Linux (Ubuntu 16+, CentOS 7+, Debian 9+)</li>
                                    <li>命令会自动设置服务器ID和认证令牌</li>
                                </ul>
                            </div>
                        }
                        type="info"
                        showIcon
                    />
                    
                    {installServerInfo && (
                        <div>
                            <Title level={5}>服务器信息</Title>
                            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                                <Text strong>服务器名称：</Text>{installServerInfo.name}<br/>
                                <Text strong>服务器ID：</Text>{installServerInfo.id}<br/>
                                <Text strong>国家：</Text>{installServerInfo.country}<br/>
                                <Text strong>组别：</Text>{installServerInfo.group}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <Title level={5}>安装命令</Title>
                        <TextArea
                            value={installCommand}
                            rows={4}
                            readOnly
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                    
                    <Alert
                        message="注意事项"
                        description={
                            <div>
                                <p>安装完成后，服务器状态将自动更新为"在线"状态。如果安装失败，请检查：</p>
                                <ul>
                                    <li>网络连接是否正常</li>
                                    <li>是否有足够的系统权限</li>
                                    <li>防火墙设置是否阻止了必要的端口</li>
                                </ul>
                            </div>
                        }
                        type="warning"
                        showIcon
                    />
                </Space>
            </Modal>

            <ProTable<ServerItem>
                rowKey="id"
                headerTitle="服务器列表"
                scroll={{ x: 960 }}
                actionRef={actionRef}
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
                request={async (params) => {
                    try {
                        const serverParams: ServerListParams = {
                            current: params.current,
                            pageSize: params.pageSize,
                            name: params.name,
                            status: params.status,
                            country: params.country,
                            group: params.group
                        };
                        
                        const result = await ServerService.getServers(serverParams);
                        
                        // 更新当前服务器数据，用于动态生成筛选选项
                        setCurrentServers(result.data);
                        
                        return {
                            data: result.data,
                            success: result.success,
                            total: result.total,
                        };
                    } catch (error) {
                        console.error('获取服务器列表失败:', error);
                        message.error(error instanceof Error ? error.message : '获取服务器列表失败');
                        return {
                            data: [],
                            success: false,
                            total: 0,
                        };
                    }
                }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />
        </div>
    );
};

export default React.memo(Servers); 