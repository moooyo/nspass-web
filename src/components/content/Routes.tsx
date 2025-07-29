/**
 * 线路管理组件
 * 显示和管理所有线路配置，支持查看线路详情和复制配置
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button, Tag, Tooltip, Space, Card, Typography, Input, Modal } from 'antd';
import { routeService, RouteItem } from '@/services/routes';
import { 
  RouteType, 
  Protocol, 
  ProtocolParams,
} from '@/types/generated/model/route';
import {
    EditableProTable,
    ProColumns,
} from '@ant-design/pro-components';
import { 
    CopyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    EyeOutlined,
    ReloadOutlined,
    RocketOutlined,
    AppstoreOutlined,
    CloudOutlined,
    NodeIndexOutlined
} from '@ant-design/icons';

const { Title } = Typography;

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
    const [jsonViewVisible, setJsonViewVisible] = useState(false);
    const [currentJsonData, setCurrentJsonData] = useState<string>('');

    // 只保留系统线路状态
    const [systemRoutes, setSystemRoutes] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 加载线路数据
    const loadRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await routeService.getRouteList({ type: RouteType.ROUTE_TYPE_SYSTEM });
            setSystemRoutes(response.success ? response.data || [] : []);
        } catch (err) {
            console.error('Routes: 加载线路出错', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        loadRoutes();
    }, [loadRoutes]);

    // 代理格式选择弹窗状态
    const [proxyFormatModalVisible, setProxyFormatModalVisible] = useState(false);
    const [currentProxyRoute, setCurrentProxyRoute] = useState<RouteItem | null>(null);

    // 生成不同格式的代理配置
    const generateProxyConfig = (record: RouteItem, format: 'shadowrocket' | 'clash' | 'surge' | 'loon') => {
        if (!record?.protocolParams) {
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
                setProxyFormatModalVisible(false);
            } catch (error) {
                console.error('复制失败');
            }
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

    // 生成表格列配置（只读模式）
    const generateColumns = (): ProColumns<RouteItem>[] => [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '8%',
        },
        {
            title: '线路名称',
            dataIndex: 'routeName',
            width: '15%',
        },
        {
            title: '服务器地址',
            dataIndex: 'entryPoint',
            width: '20%',
            render: (_, record: RouteItem) => (
                <span style={{ fontFamily: 'monospace' }}>
                    {record.entryPoint}:{record.port}
                </span>
            ),
        },
        {
            title: '协议',
            dataIndex: 'protocol',
            width: '10%',
            render: (_, record: RouteItem) => (
                <Tag color={record.protocol === Protocol.PROTOCOL_SHADOWSOCKS ? 'blue' : 'purple'}>
                    {getProtocolDisplayName(record.protocol)}
                </Tag>
            ),
        },
        {
            title: '功能支持',
            dataIndex: 'protocolParams',
            width: '15%',
            render: (_, record: RouteItem) => (
                <Space size="small">
                    <Tag color={getUdpSupport(record.protocolParams) ? 'success' : 'default'}>
                        UDP{getUdpSupport(record.protocolParams) ? '✓' : '✗'}
                    </Tag>
                    <Tag color={getTcpFastOpen(record.protocolParams) ? 'success' : 'default'}>
                        FastOpen{getTcpFastOpen(record.protocolParams) ? '✓' : '✗'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: '密码',
            dataIndex: 'protocolParams',
            width: '12%',
            render: (_, record: RouteItem) => (
                <Input.Password 
                    value={getProtocolPassword(record.protocolParams)} 
                    readOnly 
                    size="small"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{ width: '100px' }}
                />
            ) as any,
        },
        {
            title: '配置参数',
            dataIndex: 'protocolParams',
            width: '12%',
            render: (_, record: RouteItem) => {
                const params = getOtherParams(record.protocolParams);
                return (
                    <Tooltip title="查看完整JSON配置">
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => viewJsonData(params)}
                        >
                            查看配置
                        </Button>
                    </Tooltip>
                );
            },
        },
        {
            title: '操作',
            valueType: 'option' as const,
            width: '8%',
            render: (_: any, record: RouteItem) => [
                <Tooltip key="copy" title="复制配置">
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => openProxyFormatModal(record)}
                    >
                        复制
                    </Button>
                </Tooltip>,
            ],
        },
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            {/* 线路管理 */}
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            线路管理 ({systemRoutes.length}条)
                        </Title>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadRoutes}
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
                    dataSource={systemRoutes}
                    columns={generateColumns()}
                    value={systemRoutes}
                    editable={{
                        type: 'multiple',
                        editableKeys: [],
                        onSave: async () => false,
                        onChange: () => {},
                        actionRender: () => [],
                    }}
                />
            </Card>

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
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                    >
                        <RocketOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                        <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Shadowrocket</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>iOS 代理客户端</div>
                    </div>
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
                    >
                        <AppstoreOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                        <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Clash</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>跨平台代理客户端</div>
                    </div>
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
                    >
                        <CloudOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                        <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Surge</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>macOS/iOS 网络工具</div>
                    </div>
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
                    >
                        <NodeIndexOutlined style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }} />
                        <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Loon</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>iOS 网络调试工具</div>
                    </div>
                </div>
                
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
