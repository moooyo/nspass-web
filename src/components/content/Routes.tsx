/**
 * 优化后的路由管理组件
 * 集成了原版本的完整功能和优化版本的最佳实践
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button, Tag, Popconfirm, Tooltip, Space, Card, Typography, Input, Modal, Form, Select, Switch, Alert, Row, Col } from 'antd';
import { message } from '@/utils/message';
import { routeService, RouteItem, CreateRouteData, UpdateRouteData } from '@/services/routes';
import { 
  RouteType, 
  Protocol, 
  ShadowsocksMethod, 
  SnellVersion,
  ProtocolParams,
} from '@/types/generated/model/route';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    ProFormDependency,
    ProFormGroup,
    ProFormCheckbox,
    ModalForm,
    ProFormDigit,
} from '@ant-design/pro-components';
import { 
    PlusOutlined, 
    EditOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
    CopyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    EyeOutlined,
    ReloadOutlined,
    WarningOutlined,
    RocketOutlined,
    AppstoreOutlined,
    CloudOutlined,
    NodeIndexOutlined
} from '@ant-design/icons';
import { securityUtils } from '@/shared/utils';

const { Title } = Typography;

// 协议配置常量
const PROTOCOL_OPTIONS = [
    { label: 'Shadowsocks', value: Protocol.PROTOCOL_SHADOWSOCKS },
    { label: 'Snell', value: Protocol.PROTOCOL_SNELL },
];

const SHADOWSOCKS_METHOD_OPTIONS = [
    { label: 'AES-128-GCM', value: ShadowsocksMethod.SHADOWSOCKS_METHOD_AES_128_GCM },
    { label: 'AES-256-GCM', value: ShadowsocksMethod.SHADOWSOCKS_METHOD_AES_256_GCM },
    { label: 'ChaCha20-IETF-Poly1305', value: ShadowsocksMethod.SHADOWSOCKS_METHOD_CHACHA20_IETF_POLY1305 },
];

const SNELL_VERSION_OPTIONS = [
    { label: 'v4 (稳定版)', value: SnellVersion.SNELL_VERSION_V4 },
    { label: 'v5 (最新版)', value: SnellVersion.SNELL_VERSION_V5 }
];

// 工具函数
const getProtocolDisplayName = (protocol?: Protocol): string => {
    switch (protocol) {
        case Protocol.PROTOCOL_SHADOWSOCKS:
            return 'Shadowsocks';
        case Protocol.PROTOCOL_SNELL:
            return 'Snell';
        default:
            return '未知';
    }
};

const getProtocolPassword = (protocolParams?: ProtocolParams): string => {
    return protocolParams?.shadowsocks?.password || protocolParams?.snell?.psk || '';
};

const getUdpSupport = (protocolParams?: ProtocolParams): boolean => {
    return protocolParams?.shadowsocks?.udpSupport || protocolParams?.snell?.udpSupport || false;
};

const getTcpFastOpen = (protocolParams?: ProtocolParams): boolean => {
    return protocolParams?.shadowsocks?.tcpFastOpen || protocolParams?.snell?.tcpFastOpen || false;
};

const getOtherParams = (protocolParams?: ProtocolParams): string => {
    if (protocolParams?.shadowsocks?.otherParams) {
        return protocolParams.shadowsocks.otherParams;
    }
    if (protocolParams?.snell?.otherParams) {
        return protocolParams.snell.otherParams;
    }
    return '{}';
};

const Routes: React.FC = () => {
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<RouteItem | null>(null);
    const [jsonViewVisible, setJsonViewVisible] = useState(false);
    const [currentJsonData, setCurrentJsonData] = useState<string>('');

    // 懒加载 Form 实例
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // 直接使用 useState + useEffect，这是最可靠的方式
    const [customRoutes, setCustomRoutes] = useState<RouteItem[]>([]);
    const [systemRoutes, setSystemRoutes] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 加载数据的函数
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            
            const [customResponse, systemResponse] = await Promise.all([
                routeService.getRouteList({ type: RouteType.ROUTE_TYPE_CUSTOM }),
                routeService.getRouteList({ type: RouteType.ROUTE_TYPE_SYSTEM })
            ]);

            setCustomRoutes(customResponse.success ? customResponse.data || [] : []);
            setSystemRoutes(systemResponse.success ? systemResponse.data || [] : []);
        } catch (err) {
            console.error('Routes: 加载数据出错', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 分别加载自定义线路和系统线路的函数
    const loadCustomRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await routeService.getRouteList({ type: RouteType.ROUTE_TYPE_CUSTOM });
            setCustomRoutes(response.success ? response.data || [] : []);
        } catch (err) {
            console.error('Routes: 加载自定义线路出错', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSystemRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await routeService.getRouteList({ type: RouteType.ROUTE_TYPE_SYSTEM });
            setSystemRoutes(response.success ? response.data || [] : []);
        } catch (err) {
            console.error('Routes: 加载系统线路出错', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        loadData();
    }, [loadData]);

    // refetch 方法
    const refetch = loadData;

    // 处理数据，分离自定义和系统路由
    const { customDataSource, systemDataSource } = useMemo(() => {
        // 直接使用状态中的数据
        const result = {
            customDataSource: customRoutes || [],
            systemDataSource: systemRoutes || []
        };
        
        return result;
    }, [customRoutes, systemRoutes]);

    // 生成并设置随机密码
    const generateAndSetPassword = (fieldName: string, minLength: number, maxLength: number, successMessage: string, targetForm?: any) => {
        const currentForm = targetForm || form;
        return securityUtils.generateAndSetFormPassword(currentForm, fieldName, minLength, maxLength, successMessage);
    };

    // 代理格式选择弹窗状态
    const [proxyFormatModalVisible, setProxyFormatModalVisible] = useState(false);
    const [currentProxyRoute, setCurrentProxyRoute] = useState<RouteItem | null>(null);

    // 生成不同格式的代理配置
    const generateProxyConfig = (record: RouteItem, format: 'shadowrocket' | 'clash' | 'surge' | 'loon') => {
        if (!record || !record.protocolParams) {
            message.error('线路数据不完整');
            return '';
        }

        const { routeName, entryPoint, port, protocol, protocolParams } = record;
        
        switch (format) {
            case 'shadowrocket':
                return generateShadowrocketConfig(record);
            case 'clash':
                return generateClashConfig(record);
            case 'surge':
                return generateSurgeConfig(record);
            case 'loon':
                return generateLoonConfig(record);
            default:
                return '';
        }
    };

    // Shadowrocket 格式
    const generateShadowrocketConfig = (record: RouteItem) => {
        const { routeName, entryPoint, port, protocol, protocolParams } = record;
        
        if (protocol === 'PROTOCOL_SHADOWSOCKS' && protocolParams?.shadowsocks) {
            const { method, password } = protocolParams.shadowsocks;
            if (!method || !password) {
                return '# Shadowsocks 配置不完整';
            }
            const methodMap: { [key: string]: string } = {
                'SHADOWSOCKS_METHOD_AES_128_GCM': 'aes-128-gcm',
                'SHADOWSOCKS_METHOD_AES_256_GCM': 'aes-256-gcm',
                'SHADOWSOCKS_METHOD_CHACHA20_IETF_POLY1305': 'chacha20-ietf-poly1305'
            };
            const encryptMethod = methodMap[method] || 'aes-128-gcm';
            return `ss://${btoa(`${encryptMethod}:${password}`)}@${entryPoint}:${port}#${encodeURIComponent(routeName || 'unknown')}`;
        }
        return `# 不支持的协议类型: ${protocol}`;
    };

    // Clash 格式
    const generateClashConfig = (record: RouteItem) => {
        const { routeName, entryPoint, port, protocol, protocolParams } = record;
        
        if (protocol === 'PROTOCOL_SHADOWSOCKS' && protocolParams?.shadowsocks) {
            const { method, password } = protocolParams.shadowsocks;
            if (!method || !password) {
                return '# Shadowsocks 配置不完整';
            }
            const methodMap: { [key: string]: string } = {
                'SHADOWSOCKS_METHOD_AES_128_GCM': 'aes-128-gcm',
                'SHADOWSOCKS_METHOD_AES_256_GCM': 'aes-256-gcm',
                'SHADOWSOCKS_METHOD_CHACHA20_IETF_POLY1305': 'chacha20-ietf-poly1305'
            };
            const encryptMethod = methodMap[method] || 'aes-128-gcm';
            return `- name: "${routeName || 'unknown'}"
  type: ss
  server: ${entryPoint}
  port: ${port}
  cipher: ${encryptMethod}
  password: "${password}"`;
        }
        
        if (protocol === 'PROTOCOL_SNELL' && protocolParams?.snell) {
            const { psk, version } = protocolParams.snell;
            if (!psk || !version) {
                return '# Snell 配置不完整';
            }
            const versionMap: { [key: string]: string } = {
                'SNELL_VERSION_V4': '4',
                'SNELL_VERSION_V5': '5'
            };
            const snellVersion = versionMap[version] || '4';
            return `- name: "${routeName || 'unknown'}"
  type: snell
  server: ${entryPoint}
  port: ${port}
  psk: "${psk}"
  version: ${snellVersion}`;
        }
        
        return `# 不支持的协议类型: ${protocol}`;
    };

    // Surge 格式
    const generateSurgeConfig = (record: RouteItem) => {
        const { routeName, entryPoint, port, protocol, protocolParams } = record;
        
        if (protocol === 'PROTOCOL_SHADOWSOCKS' && protocolParams?.shadowsocks) {
            const { method, password } = protocolParams.shadowsocks;
            if (!method || !password) {
                return '# Shadowsocks 配置不完整';
            }
            const methodMap: { [key: string]: string } = {
                'SHADOWSOCKS_METHOD_AES_128_GCM': 'aes-128-gcm',
                'SHADOWSOCKS_METHOD_AES_256_GCM': 'aes-256-gcm',
                'SHADOWSOCKS_METHOD_CHACHA20_IETF_POLY1305': 'chacha20-ietf-poly1305'
            };
            const encryptMethod = methodMap[method] || 'aes-128-gcm';
            return `${routeName || 'unknown'} = ss, ${entryPoint}, ${port}, encrypt-method=${encryptMethod}, password=${password}`;
        }
        
        if (protocol === 'PROTOCOL_SNELL' && protocolParams?.snell) {
            const { psk, version } = protocolParams.snell;
            if (!psk || !version) {
                return '# Snell 配置不完整';
            }
            const versionMap: { [key: string]: string } = {
                'SNELL_VERSION_V4': '4',
                'SNELL_VERSION_V5': '5'
            };
            const snellVersion = versionMap[version] || '4';
            return `${routeName || 'unknown'} = snell, ${entryPoint}, ${port}, psk=${psk}, version=${snellVersion}`;
        }
        
        return `# 不支持的协议类型: ${protocol}`;
    };

    // Loon 格式
    const generateLoonConfig = (record: RouteItem) => {
        const { routeName, entryPoint, port, protocol, protocolParams } = record;
        
        if (protocol === 'PROTOCOL_SHADOWSOCKS' && protocolParams?.shadowsocks) {
            const { method, password, udpSupport, tcpFastOpen } = protocolParams.shadowsocks;
            if (!method || !password) {
                return '# Shadowsocks 配置不完整';
            }
            const methodMap: { [key: string]: string } = {
                'SHADOWSOCKS_METHOD_AES_128_GCM': 'aes-128-gcm',
                'SHADOWSOCKS_METHOD_AES_256_GCM': 'aes-256-gcm',
                'SHADOWSOCKS_METHOD_CHACHA20_IETF_POLY1305': 'chacha20-ietf-poly1305'
            };
            const encryptMethod = methodMap[method] || 'aes-128-gcm';
            const udpFlag = udpSupport ? 'true' : 'false';
            const fastOpenFlag = tcpFastOpen ? 'true' : 'false';
            return `${routeName || 'unknown'} = Shadowsocks,${entryPoint},${port},${encryptMethod},"${password}",fast-open=${fastOpenFlag},udp=${udpFlag}`;
        }
        
        if (protocol === 'PROTOCOL_SNELL' && protocolParams?.snell) {
            const { psk, version, udpSupport, tcpFastOpen } = protocolParams.snell;
            if (!psk || !version) {
                return '# Snell 配置不完整';
            }
            const versionMap: { [key: string]: string } = {
                'SNELL_VERSION_V4': '4',
                'SNELL_VERSION_V5': '5'
            };
            const snellVersion = versionMap[version] || '4';
            const udpFlag = udpSupport ? 'true' : 'false';
            const fastOpenFlag = tcpFastOpen ? 'true' : 'false';
            return `${routeName || 'unknown'} = Snell,${entryPoint},${port},psk="${psk}",version=${snellVersion},fast-open=${fastOpenFlag},udp=${udpFlag}`;
        }
        
        return `# 不支持的协议类型: ${protocol}`;
    };

    // 复制代理配置到剪贴板
    const copyProxyConfig = async (format: 'shadowrocket' | 'clash' | 'surge' | 'loon') => {
        if (!currentProxyRoute) return;
        
        const config = generateProxyConfig(currentProxyRoute, format);
        if (config && !config.startsWith('# 不支持')) {
            try {
                await navigator.clipboard.writeText(config);
                message.success(`${format.charAt(0).toUpperCase() + format.slice(1)} 配置已复制到剪贴板`);
                setProxyFormatModalVisible(false);
            } catch (error) {
                message.error('复制失败，请手动复制');
            }
        } else {
            message.error('不支持的协议类型或配置生成失败');
        }
    };

    // 打开代理格式选择弹窗
    const openProxyFormatModal = (record: RouteItem) => {
        setCurrentProxyRoute(record);
        setProxyFormatModalVisible(true);
    };

    // 查看JSON数据
    const viewJsonData = (jsonString: string) => {
        setCurrentJsonData(jsonString);
        setJsonViewVisible(true);
    };

    // 删除线路
    const deleteRoute = async (record: RouteItem) => {
        if (!record.id) {
            message.error('线路ID不存在');
            return;
        }
        try {
            const response = await routeService.deleteRoute(record.id);
            if (response.success) {
                message.success(`已删除线路: ${record.routeName}`);
                refetch();
            } else {
                // handleDataResponse.userAction('删除线路', false, response);
            }
        } catch {
            // handleDataResponse.userAction('删除线路', false, undefined, error);
        }
    };

    // 打开编辑模态框
    const openEditModal = (record: RouteItem) => {
        setEditingRecord(record);
        
        // 根据协议设置表单初始值
        const formValues: any = {
            routeName: record.routeName,
            entryPoint: record.entryPoint,
            port: record.port,
            protocol: record.protocol,
            description: record.description,
        };

        // 设置协议特定参数
        if (record.protocol === Protocol.PROTOCOL_SHADOWSOCKS && record.protocolParams?.shadowsocks) {
            const shadowsocks = record.protocolParams.shadowsocks;
            formValues.method = shadowsocks.method;
            formValues.password = shadowsocks.password;
            formValues.udpSupport = shadowsocks.udpSupport;
            formValues.tcpFastOpen = shadowsocks.tcpFastOpen;
            formValues.otherParams = shadowsocks.otherParams;
        }

        if (record.protocol === Protocol.PROTOCOL_SNELL && record.protocolParams?.snell) {
            const snell = record.protocolParams.snell;
            formValues.snellVersion = snell.version;
            formValues.psk = snell.psk;
            formValues.udpSupport = snell.udpSupport;
            formValues.tcpFastOpen = snell.tcpFastOpen;
            formValues.otherParams = snell.otherParams;
        }

        editForm.setFieldsValue(formValues);
        setEditModalVisible(true);
    };

    // 处理编辑线路提交
    const handleEditRoute = async (values: any) => {
        if (!editingRecord) return false;
        
        try {
            // 构建协议参数
            const protocolParams: ProtocolParams = {};
            
            if (values.protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                protocolParams.shadowsocks = {
                    method: values.method,
                    password: values.password,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            } else if (values.protocol === Protocol.PROTOCOL_SNELL) {
                protocolParams.snell = {
                    version: values.snellVersion,
                    psk: values.password || values.psk,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            }
            
            const updateData: UpdateRouteData = {
                routeName: values.routeName,
                entryPoint: values.entryPoint,
                port: values.port,
                protocol: values.protocol,
                protocolParams: protocolParams,
                description: values.description,
            };

            if (!editingRecord.id) {
                message.error('线路ID不存在');
                return false;
            }

            const response = await routeService.updateRoute(editingRecord.id, updateData);
            if (response.success) {
                // handleDataResponse.userAction('线路更新', true);
                setEditingRecord(null);
                refetch();
                return true;
            } else {
                // handleDataResponse.error('线路更新失败', response.message);
                return false;
            }
        } catch {
            // handleDataResponse.error('线路更新', error);
            return false;
        }
    };

    // 处理创建线路提交
    const handleCreateRoute = async (values: any) => {
        try {
            // 构建协议参数
            const protocolParams: ProtocolParams = {};
            
            if (values.protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                protocolParams.shadowsocks = {
                    method: values.method,
                    password: values.password,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            } else if (values.protocol === Protocol.PROTOCOL_SNELL) {
                protocolParams.snell = {
                    version: values.snellVersion,
                    psk: values.password,
                    udpSupport: values.udpSupport || false,
                    tcpFastOpen: values.tcpFastOpen || false,
                    otherParams: values.otherParams || '{}',
                };
            }

            const createData: CreateRouteData = {
                routeName: values.routeName,
                entryPoint: values.entryPoint,
                port: values.port || (values.protocol === Protocol.PROTOCOL_SHADOWSOCKS ? 8388 : 6333),
                protocol: values.protocol,
                protocolParams: protocolParams,
                description: values.description,
            };

            const response = await routeService.createRoute(createData);
            if (response.success) {
                message.success('线路创建成功');
                refetch();
                return true;
            } else {
                // handleDataResponse.error('线路创建失败', response.message);
                return false;
            }
        } catch {
            // handleDataResponse.error('线路创建', error);
            return false;
        }
    };

    // 生成表格列配置
    const generateColumns = (isEditable: boolean): ProColumns<RouteItem>[] => [
        {
            title: '线路ID',
            dataIndex: 'id',
            width: '12%',
        },
        {
            title: '线路名',
            dataIndex: 'routeName',
            width: '15%',
        },
        {
            title: '入口(IP或域名)',
            dataIndex: 'entryPoint',
            width: '20%',
        },
        {
            title: '协议',
            dataIndex: 'protocol',
            width: '12%',
            render: (_, record: RouteItem) => (
                <Tag color={record.protocol === Protocol.PROTOCOL_SHADOWSOCKS ? 'blue' : 'purple'}>
                    {getProtocolDisplayName(record.protocol)}
                </Tag>
            ),
        },
        {
            title: 'UDP支持',
            dataIndex: 'protocolParams',
            width: '10%',
            render: (_, record: RouteItem) => (
                <Tag color={getUdpSupport(record.protocolParams) ? 'success' : 'default'}>
                    {getUdpSupport(record.protocolParams) ? '是' : '否'}
                </Tag>
            ),
        },
        {
            title: 'TCP Fast Open支持',
            dataIndex: 'protocolParams',
            width: '15%',
            render: (_, record: RouteItem) => (
                <Tag color={getTcpFastOpen(record.protocolParams) ? 'success' : 'default'}>
                    {getTcpFastOpen(record.protocolParams) ? '是' : '否'}
                </Tag>
            ),
        },
        {
            title: '密码',
            dataIndex: 'protocolParams',
            width: '15%',
            render: (_, record: RouteItem) => (
                <Input.Password 
                    value={getProtocolPassword(record.protocolParams)} 
                    readOnly 
                    size="small"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{ width: '120px' }}
                />
            ) as any,
        },
        {
            title: '其他协议参数',
            dataIndex: 'protocolParams',
            width: '20%',
            render: (_, record: RouteItem) => {
                const params = getOtherParams(record.protocolParams);
                return (
                    <Space>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {params && params.length > 30 ? `${params.substring(0, 30)}...` : params}
                        </span>
                        <Tooltip title="查看JSON">
                            <Button 
                                type="text" 
                                size="small" 
                                icon={<EyeOutlined />}
                                onClick={() => viewJsonData(params)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
        {
            title: '操作',
            valueType: 'option' as const,
            width: '15%',
            render: (_: any, record: RouteItem) => [
                <Tooltip key="copy" title="复制">
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => openProxyFormatModal(record)}
                    >
                        复制
                    </Button>
                </Tooltip>,
                ...(isEditable ? [
                    <Tooltip key="edit" title="编辑">
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                        >
                            编辑
                        </Button>
                    </Tooltip>,
                    <Popconfirm
                        key="delete"
                        title="确定要删除此线路吗？"
                        onConfirm={() => deleteRoute(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <Button 
                                type="text" 
                                size="small" 
                                danger
                                icon={<DeleteOutlined />}
                            >
                                删除
                            </Button>
                        </Tooltip>
                    </Popconfirm>,
                ] : []),
            ],
        },
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            {/* 自定义线路配置 */}
            <Card 
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            自定义线路配置 ({customDataSource.length}条)
                        </Title>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadCustomRoutes}
                                loading={loading}
                            >
                                刷新
                            </Button>
                            <Button
                                icon={<PlusOutlined />}
                                onClick={() => setCreateModalVisible(true)}
                                type="primary"
                            >
                                新增线路
                            </Button>
                        </Space>
                    </div>
                }
                style={{ marginBottom: '24px' }}
            >
                <EditableProTable<RouteItem>
                    rowKey="id"
                    maxLength={50}
                    scroll={{ x: 'max-content' }}
                    recordCreatorProps={false}
                    loading={loading}
                    search={false}
                    options={false}
                    dataSource={customDataSource}
                    columns={generateColumns(true)}
                    value={customDataSource}
                    onChange={(value) => {
                        // This is for local editing, actual changes go through API
                        console.log('Table data changed:', value);
                    }}
                    editable={{
                        type: 'multiple',
                        editableKeys: [],
                        onSave: async () => false,
                        onChange: () => {},
                        actionRender: () => [],
                    }}
                />
            </Card>

            {/* 系统生成线路 */}
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            系统生成线路 ({systemDataSource.length}条)
                        </Title>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadSystemRoutes}
                            loading={loading}
                        >
                            刷新
                        </Button>
                    </div>
                }
            >
                <EditableProTable<RouteItem>
                    rowKey="id"
                    maxLength={50}
                    scroll={{ x: 'max-content' }}
                    recordCreatorProps={false}
                    loading={loading}
                    search={false}
                    options={false}
                    dataSource={systemDataSource}
                    columns={generateColumns(false)}
                    value={systemDataSource}
                    editable={{
                        type: 'multiple',
                        editableKeys: [],
                        onSave: async () => false,
                        onChange: () => {},
                        actionRender: () => [],
                    }}
                />
            </Card>

            {/* 创建线路的模态表单 */}
            <ModalForm
                title="新增线路"
                width={600}
                open={createModalVisible}
                onOpenChange={setCreateModalVisible}
                onFinish={handleCreateRoute}
                modalProps={{
                    destroyOnHidden: true,
                    onCancel: () => setCreateModalVisible(false),
                }}
                form={form}
            >
                <ProFormText
                    name="routeName"
                    label="线路名"
                    placeholder="请输入线路名称"
                    rules={[{ required: true, message: '请输入线路名称' }]}
                />
                
                <ProFormText
                    name="entryPoint"
                    label="入口(IP或域名)"
                    placeholder="请输入服务器IP地址或域名"
                    rules={[{ required: true, message: '请输入服务器IP地址或域名' }]}
                />

                <ProFormDigit
                    name="port"
                    label="端口"
                    placeholder="请输入端口号"
                    min={1}
                    max={65535}
                    rules={[
                        { required: true, message: '请输入端口号' },
                        { 
                            validator: (_: any, value: any) => {
                                if (value && (value < 1 || value > 65535)) {
                                    return Promise.reject(new Error('端口范围必须在 1-65535 之间'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                />
                
                <ProFormSelect
                    name="protocol"
                    label="协议"
                    options={PROTOCOL_OPTIONS}
                    rules={[{ required: true, message: '请选择协议' }]}
                />
                
                <ProFormDependency name={['protocol']}>
                    {({ protocol }) => {
                        if (protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="method"
                                        label="加密方法"
                                        options={SHADOWSOCKS_METHOD_OPTIONS}
                                        rules={[{ required: true, message: '请选择加密方法' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        if (protocol === Protocol.PROTOCOL_SNELL) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={SNELL_VERSION_OPTIONS}
                                        initialValue={SnellVersion.SNELL_VERSION_V4}
                                        rules={[{ required: true, message: '请选择协议版本' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        return null;
                    }}
                </ProFormDependency>

                <ProFormCheckbox name="udpSupport" label="UDP支持">
                    启用UDP支持
                </ProFormCheckbox>

                <ProFormCheckbox name="tcpFastOpen" label="TCP Fast Open支持">
                    启用TCP Fast Open
                </ProFormCheckbox>
                
                <ProFormText.Password
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                    fieldProps={{
                        addonAfter: (
                            <Tooltip title="生成64-128位随机密码">
                                <Button 
                                    type="text" 
                                    icon={<ThunderboltOutlined />}
                                    onClick={() => generateAndSetPassword('password', 64, 128, '已生成随机密码')}
                                    size="small"
                                />
                            </Tooltip>
                        )
                    }}
                    extra="建议使用生成的随机密码以确保安全性"
                />

                <ProFormTextArea
                    name="otherParams"
                    label="其他协议参数"
                    placeholder='请输入JSON格式的其他参数，例如: {"timeout": 300}'
                    rules={[
                        {
                            validator: (_: any, value: any) => {
                                if (value) {
                                    try {
                                        JSON.parse(value);
                                        return Promise.resolve();
                                    } catch {
                                        return Promise.reject(new Error('请输入有效的JSON格式'));
                                    }
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    fieldProps={{
                        rows: 3,
                    }}
                />

                <ProFormTextArea
                    name="description"
                    label="线路描述"
                    placeholder="请输入线路描述（可选）"
                    fieldProps={{
                        rows: 2,
                    }}
                />
            </ModalForm>

            {/* 编辑线路的模态表单 */}
            <ModalForm
                title="编辑线路"
                width={600}
                open={editModalVisible}
                onOpenChange={setEditModalVisible}
                onFinish={handleEditRoute}
                modalProps={{
                    destroyOnHidden: true,
                    onCancel: () => {
                        setEditModalVisible(false);
                        setEditingRecord(null);
                        editForm.resetFields();
                    },
                }}
                form={editForm}
            >
                <ProFormText
                    name="routeName"
                    label="线路名"
                    placeholder="请输入线路名称"
                    rules={[{ required: true, message: '请输入线路名称' }]}
                />
                
                <ProFormText
                    name="entryPoint"
                    label="入口(IP或域名)"
                    placeholder="请输入服务器IP地址或域名"
                    rules={[{ required: true, message: '请输入服务器IP地址或域名' }]}
                />

                <ProFormDigit
                    name="port"
                    label="端口"
                    placeholder="请输入端口号"
                    min={1}
                    max={65535}
                    rules={[
                        { required: true, message: '请输入端口号' },
                        { 
                            validator: (_: any, value: any) => {
                                if (value && (value < 1 || value > 65535)) {
                                    return Promise.reject(new Error('端口范围必须在 1-65535 之间'));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                />
                
                <ProFormSelect
                    name="protocol"
                    label="协议"
                    options={PROTOCOL_OPTIONS}
                    rules={[{ required: true, message: '请选择协议' }]}
                />
                
                <ProFormDependency name={['protocol']}>
                    {({ protocol }) => {
                        if (protocol === Protocol.PROTOCOL_SHADOWSOCKS) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="method"
                                        label="加密方法"
                                        options={SHADOWSOCKS_METHOD_OPTIONS}
                                        rules={[{ required: true, message: '请选择加密方法' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        if (protocol === Protocol.PROTOCOL_SNELL) {
                            return (
                                <ProFormGroup>
                                    <ProFormSelect
                                        name="snellVersion"
                                        label="协议版本"
                                        options={SNELL_VERSION_OPTIONS}
                                        rules={[{ required: true, message: '请选择协议版本' }]}
                                    />
                                </ProFormGroup>
                            );
                        }
                        
                        return null;
                    }}
                </ProFormDependency>

                <ProFormCheckbox name="udpSupport" label="UDP支持">
                    启用UDP支持
                </ProFormCheckbox>

                <ProFormCheckbox name="tcpFastOpen" label="TCP Fast Open支持">
                    启用TCP Fast Open
                </ProFormCheckbox>
                
                <ProFormText.Password
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                    fieldProps={{
                        addonAfter: (
                            <Tooltip title="生成64-128位随机密码">
                                <Button 
                                    type="text" 
                                    icon={<ThunderboltOutlined />}
                                    onClick={() => generateAndSetPassword('password', 64, 128, '已生成随机密码', editForm)}
                                    size="small"
                                />
                            </Tooltip>
                        )
                    }}
                    extra="建议使用生成的随机密码以确保安全性"
                />

                <ProFormTextArea
                    name="otherParams"
                    label="其他协议参数"
                    placeholder='请输入JSON格式的其他参数，例如: {"timeout": 300}'
                    rules={[
                        {
                            validator: (_: any, value: any) => {
                                if (value) {
                                    try {
                                        JSON.parse(value);
                                        return Promise.resolve();
                                    } catch {
                                        return Promise.reject(new Error('请输入有效的JSON格式'));
                                    }
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    fieldProps={{
                        rows: 3,
                    }}
                />

                <ProFormTextArea
                    name="description"
                    label="线路描述"
                    placeholder="请输入线路描述（可选）"
                    fieldProps={{
                        rows: 2,
                    }}
                />
            </ModalForm>

            {/* 查看JSON的模态框 */}
            <Modal
                title="查看协议参数"
                open={jsonViewVisible}
                onCancel={() => setJsonViewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setJsonViewVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={600}
            >
                <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    maxHeight: '400px',
                    overflow: 'auto'
                }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {(() => {
                            try {
                                return JSON.stringify(JSON.parse(currentJsonData || '{}'), null, 2);
                            } catch {
                                return currentJsonData || '{}';
                            }
                        })()}
                    </pre>
                </div>
            </Modal>

            {/* 代理格式选择弹窗 */}
            <Modal
                title={
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '18px',
                        fontWeight: 600
                    }}>
                        <CopyOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                        <span>选择代理客户端</span>
                    </div>
                }
                open={proxyFormatModalVisible}
                onCancel={() => setProxyFormatModalVisible(false)}
                footer={null}
                width={660}
                style={{
                    top: 50,
                }}
                bodyStyle={{
                    padding: '24px',
                    background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '12px'
                }}
            >
                <div style={{ 
                    marginBottom: '24px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px',
                        color: '#1e293b',
                        fontSize: '14px',
                        fontWeight: 500
                    }}>
                        <div style={{
                            width: '4px',
                            height: '16px',
                            background: 'linear-gradient(to bottom, #667eea, #764ba2)',
                            borderRadius: '2px'
                        }} />
                        选择要复制的代理配置格式
                    </div>
                    <div style={{ 
                        color: '#64748b',
                        fontSize: '13px',
                        marginLeft: '12px'
                    }}>
                        线路: <span style={{ fontWeight: 500, color: '#334155' }}>{currentProxyRoute?.routeName || '未知'}</span> 
                        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
                        服务器: <span style={{ fontWeight: 500, color: '#334155' }}>{currentProxyRoute?.entryPoint}:{currentProxyRoute?.port}</span>
                    </div>
                </div>
                
                <Row gutter={[20, 20]}>
                    <Col span={12}>
                        <div 
                            onClick={() => copyProxyConfig('shadowrocket')}
                            style={{ 
                                height: '100px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                right: '-50%',
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <RocketOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                            <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Shadowrocket</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>iOS 代理客户端</div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div 
                            onClick={() => copyProxyConfig('clash')}
                            style={{ 
                                height: '100px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                right: '-50%',
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <AppstoreOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                            <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Clash</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>跨平台代理客户端</div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div 
                            onClick={() => copyProxyConfig('surge')}
                            style={{ 
                                height: '100px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.4)';
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                right: '-50%',
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <CloudOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                            <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Surge</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>macOS/iOS 网络工具</div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div 
                            onClick={() => copyProxyConfig('loon')}
                            style={{ 
                                height: '100px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.4)';
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                right: '-50%',
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <NodeIndexOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                            <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Loon</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>iOS 网络调试工具</div>
                        </div>
                    </Col>
                </Row>
                
                <div style={{ 
                    marginTop: '32px', 
                    textAlign: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                    <Button 
                        onClick={() => setProxyFormatModalVisible(false)}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            fontWeight: 500,
                            color: '#64748b',
                            borderColor: '#e2e8f0',
                            backgroundColor: 'white',
                            minWidth: '120px'
                        }}
                    >
                        取消
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default React.memo(Routes);
