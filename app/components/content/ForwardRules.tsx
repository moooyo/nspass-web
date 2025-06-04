import React, { useState, useMemo, FC, useRef, useEffect } from 'react';
import { Button, message, Tag, Popconfirm, Badge, Space, Tooltip, Modal, Form, Card, Row, Col, Typography, Divider, Input, Select } from 'antd';
import {
    EditableProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
    EditableFormInstance,
} from '@ant-design/pro-components';
import { 
    PlusOutlined, 
    PauseCircleOutlined, 
    PlayCircleOutlined,
    BugOutlined, 
    CopyOutlined, 
    EditOutlined,
    DeleteOutlined,
    ArrowRightOutlined,
    DragOutlined,
    GlobalOutlined,
    ApiOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ServerItem } from './LeafletWrapper';
import 'leaflet/dist/leaflet.css';

// 动态导入LeafletWrapper组件，禁用SSR
const DynamicLeafletWrapper = dynamic(() => import('./LeafletWrapper'), {
  ssr: false,
  loading: () => <div style={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>加载地图组件...</div>
});

// 服务器类型枚举
const serverTypeEnum = {
    NORMAL: { text: '普通服务器', color: 'blue' },
    EXIT: { text: '出口服务器', color: 'orange' },
};

// 服务器数据类型 - 使用从LeafletWrapper导入的类型

// 入口类型
const entryTypeEnum = {
    HTTP: { text: 'HTTP', status: 'Processing' },
    SOCKS5: { text: 'SOCKS5', status: 'Processing' },
    SHADOWSOCKS: { text: 'Shadowsocks', status: 'Processing' },
    TROJAN: { text: 'Trojan', status: 'Processing' },
};

// 出口类型
const exitTypeEnum = {
    DIRECT: { text: '直连', status: 'Default' },
    PROXY: { text: '代理', status: 'Warning' },
    REJECT: { text: '拒绝', status: 'Error' },
};

// 规则状态
const ruleStatusEnum = {
    ACTIVE: { text: '运行中', status: 'Success' },
    PAUSED: { text: '已暂停', status: 'Default' },
    ERROR: { text: '出错', status: 'Error' },
};

type ForwardRuleItem = {
    id: React.Key;
    ruleId: string;
    entryType: keyof typeof entryTypeEnum;
    entryConfig: string;
    trafficUsed: number; // MB
    exitType: keyof typeof exitTypeEnum;
    exitConfig: string;
    status: keyof typeof ruleStatusEnum;
    viaNodes: string[]; // 途径节点数组
};

const defaultData: ForwardRuleItem[] = [
    {
        id: 1,
        ruleId: 'rule001',
        entryType: 'HTTP',
        entryConfig: '127.0.0.1:8080',
        trafficUsed: 1024,
        exitType: 'PROXY',
        exitConfig: 'proxy.example.com:443',
        status: 'ACTIVE',
        viaNodes: ['香港节点', '日本节点'],
    },
    {
        id: 2,
        ruleId: 'rule002',
        entryType: 'SOCKS5',
        entryConfig: '0.0.0.0:1080',
        trafficUsed: 512,
        exitType: 'DIRECT',
        exitConfig: '-',
        status: 'PAUSED',
        viaNodes: ['新加坡节点'],
    },
    {
        id: 3,
        ruleId: 'rule003',
        entryType: 'SHADOWSOCKS',
        entryConfig: '0.0.0.0:8388',
        trafficUsed: 2048,
        exitType: 'REJECT',
        exitConfig: '-',
        status: 'ERROR',
        viaNodes: [],
    },
];

// 模拟的服务器数据
const sampleServers: ServerItem[] = [
    { 
        id: 'server001', 
        name: '香港服务器', 
        type: 'NORMAL',
        ip: '203.0.113.1',
        location: {
            country: '中国香港',
            latitude: 22.3193,
            longitude: 114.1694,
            x: 650,
            y: 250
        }
    },
    { 
        id: 'server002', 
        name: '东京服务器', 
        type: 'NORMAL',
        ip: '203.0.113.2',
        location: {
            country: '日本',
            latitude: 35.6762,
            longitude: 139.6503,
            x: 700,
            y: 220
        }
    },
    { 
        id: 'server003', 
        name: '新加坡服务器', 
        type: 'NORMAL',
        ip: '203.0.113.3',
        location: {
            country: '新加坡',
            latitude: 1.3521,
            longitude: 103.8198,
            x: 620,
            y: 300
        }
    },
    { 
        id: 'exit001', 
        name: '美国出口', 
        type: 'EXIT',
        ip: '198.51.100.1',
        location: {
            country: '美国',
            latitude: 38.8951,
            longitude: -77.0364,
            x: 250,
            y: 220
        }
    },
    { 
        id: 'exit002', 
        name: '德国出口', 
        type: 'EXIT',
        ip: '198.51.100.2',
        location: {
            country: '德国',
            latitude: 52.5200,
            longitude: 13.4050,
            x: 450,
            y: 180
        }
    },
];

// 可拖拽的服务器项类型
type DraggableServerItemProps = {
    server: ServerItem;
    index: number;
    moveServer: (dragIndex: number, hoverIndex: number) => void;
    onRemove: (index: number) => void;
};

// 拖拽项类型
const SERVER_ITEM_TYPE = 'server';

// 可拖拽的服务器项组件
const DraggableServerItem: FC<DraggableServerItemProps> = ({ server, index, moveServer, onRemove }) => {
    const ref = useRef<HTMLDivElement>(null);

    // 定义拖拽行为
    const [{ isDragging }, drag] = useDrag({
        type: SERVER_ITEM_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    // 定义放置行为
    const [, drop] = useDrop({
        accept: SERVER_ITEM_TYPE,
        hover(item: { index: number }, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // 不替换自己
            if (dragIndex === hoverIndex) {
                return;
            }

            // 确定屏幕上的矩形
            const hoverBoundingRect = ref.current.getBoundingClientRect();

            // 获取中间点
            const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

            // 确定鼠标位置
            const clientOffset = monitor.getClientOffset();

            // 到左侧的距离
            const hoverClientX = clientOffset!.x - hoverBoundingRect.left;

            // 仅在鼠标超过一半物体时才移动
            // 向左拖动时
            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return;
            }

            // 向右拖动时
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }

            // 执行移动操作
            moveServer(dragIndex, hoverIndex);

            // 修改拖拽项的索引，避免闪烁
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    return (
        <div 
            ref={ref} 
            style={{ 
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                margin: '0 4px',
                display: 'inline-block'
            }}
        >
            <Tag
                color={serverTypeEnum.NORMAL.color}
                closable
                onClose={() => onRemove(index)}
                style={{ 
                    padding: '4px 8px',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <DragOutlined style={{ marginRight: 5, cursor: 'grab' }} />
                    <span>{server.name}</span>
                </div>
                <div style={{ fontSize: '10px', marginTop: '3px', color: '#888' }}>
                    {server.ip}
                </div>
            </Tag>
        </div>
    );
};

const ForwardRules: React.FC = () => {
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<ForwardRuleItem[]>(defaultData);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
    
    // 新增状态用于控制ModelForm对话框
    const [modelFormVisible, setModelFormVisible] = useState(false);
    const [selectedPath, setSelectedPath] = useState<ServerItem[]>([]);
    const [exitServer, setExitServer] = useState<ServerItem | null>(null);
    const [form] = Form.useForm();
    
    // 配置出口信息
    const [exitConfig, setExitConfig] = useState<string>('');
    
    // 出口类型选择
    const [selectedExitType, setSelectedExitType] = useState<keyof typeof exitTypeEnum>('PROXY');

    const editableFormRef = useRef<EditableFormInstance>(null);

    // 暂停/启动规则
    const toggleRuleStatus = (record: ForwardRuleItem) => {
        const newDataSource = dataSource.map(item => {
            if (item.id === record.id) {
                const newStatus: keyof typeof ruleStatusEnum = record.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
                return { ...item, status: newStatus };
            }
            return item;
        });
        setDataSource(newDataSource);
        message.success(record.status === 'ACTIVE' ? 
            `已暂停规则: ${record.ruleId}` : 
            `已启动规则: ${record.ruleId}`
        );
    };

    // 诊断规则
    const diagnoseRule = (record: ForwardRuleItem) => {
        message.info(`正在诊断规则: ${record.ruleId}`);
        // 这里可以添加诊断逻辑，比如弹出诊断结果或跳转到诊断页面
        setTimeout(() => {
            message.success(`规则 ${record.ruleId} 诊断完成，一切正常！`);
        }, 1500);
    };

    // 复制规则
    const copyRule = (record: ForwardRuleItem) => {
        const newRule: ForwardRuleItem = {
            ...record,
            id: Date.now(),
            ruleId: `${record.ruleId}_copy`,
            status: 'PAUSED', // 复制的规则默认是暂停状态
            trafficUsed: 0, // 复制的规则流量使用量为0
            viaNodes: [], // 复制的规则途径节点为空
        };
        setDataSource([...dataSource, newRule]);
        message.success(`已复制规则: ${record.ruleId}`);
    };

    // 删除规则
    const deleteRule = (record: ForwardRuleItem) => {
        setDataSource(dataSource.filter(item => item.id !== record.id));
        message.success(`已删除规则: ${record.ruleId}`);
    };

    // 处理服务器选择
    const handleServerSelect = (server: ServerItem) => {
        if (server.type === 'NORMAL') {
            // 添加普通服务器到路径
            setSelectedPath([...selectedPath, server]);
        } else if (server.type === 'EXIT') {
            // 替换出口服务器
            setExitServer(server);
        }
    };
    
    // 重置路径配置
    const resetPathConfig = () => {
        setSelectedPath([]);
        setExitServer(null);
        // 移除这些配置项，因为出口服务器是只读的
        // setExitConfig('');
        // setSelectedExitType('PROXY');
    };
    
    // 提交配置
    const handleSubmit = () => {
        // 检查是否有出口服务器
        if (!exitServer) {
            message.error('请选择一个出口服务器');
            return;
        }
        
        // 处理提交逻辑
        const viaNodes = selectedPath.map(server => server.name);
        
        // 创建新规则
        const newRule: ForwardRuleItem = {
            id: (Math.random() * 1000000).toFixed(0),
            ruleId: `rule${Date.now().toString().substr(-6)}`,
            entryType: 'HTTP',
            entryConfig: '0.0.0.0:8080', // 默认配置
            trafficUsed: 0,
            exitType: 'PROXY', // 固定使用代理类型
            exitConfig: exitServer.ip, // 使用出口服务器的IP
            status: 'PAUSED',
            viaNodes: viaNodes,
        };
        
        setDataSource([...dataSource, newRule]);
        message.success('创建规则成功');
        setModelFormVisible(false);
        resetPathConfig();
    };
    
    // 配置路径组件
    const PathConfiguration = () => {
        // 移动服务器的函数
        const moveServer = (dragIndex: number, hoverIndex: number) => {
            const draggedServer = selectedPath[dragIndex];
            const newPath = [...selectedPath];
            newPath.splice(dragIndex, 1);
            newPath.splice(hoverIndex, 0, draggedServer);
            setSelectedPath(newPath);
        };

        // 更新exitServer的信息，移除因为出口服务器是只读的
        // React.useEffect(() => {
        //     if (exitServer) {
        //         setExitConfig(exitServer.name);
        //     }
        // }, [exitServer]);

        return (
            <div className="path-config" style={{ marginBottom: 16 }}>
                <Typography.Title level={5}>配置路径</Typography.Title>
                <Row gutter={16} align="top">
                    <Col span={16}>
                        <Card 
                            size="small" 
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <GlobalOutlined style={{ marginRight: 8 }} />
                                    <span>中继服务器</span>
                                    <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                        (可拖动调整顺序)
                                    </Typography.Text>
                                </div>
                            } 
                            style={{ minHeight: 120 }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                alignItems: 'center',
                                minHeight: 70,
                                padding: '8px 0'
                            }}>
                                {selectedPath.length > 0 ? (
                                    <DndProvider backend={HTML5Backend}>
                                        {selectedPath.map((server, index) => (
                                            <DraggableServerItem
                                                key={server.id}
                                                server={server}
                                                index={index}
                                                moveServer={moveServer}
                                                onRemove={(i) => setSelectedPath(selectedPath.filter((_, idx) => idx !== i))}
                                            />
                                        ))}
                                    </DndProvider>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#999', width: '100%', marginTop: 20 }}>
                                        请选择中继服务器
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                            size="small" 
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ApiOutlined style={{ marginRight: 8 }} />
                                    <span>出口服务器</span>
                                </div>
                            } 
                            style={{ 
                                minHeight: 120, 
                                boxShadow: exitServer ? '0 0 8px rgba(250, 140, 22, 0.2)' : 'none',
                                border: exitServer ? '1px solid #fa8c16' : '1px solid #f0f0f0'
                            }}
                        >
                            {exitServer ? (
                                <div style={{ padding: '8px 0' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 12
                                    }}>
                                        <Tag 
                                            color={serverTypeEnum.EXIT.color}
                                            style={{ 
                                                padding: '6px 10px',
                                                fontSize: 14,
                                                marginRight: 0
                                            }}
                                        >
                                            {exitServer.name}
                                        </Tag>
                                        <Button 
                                            type="text" 
                                            danger 
                                            size="small"
                                            onClick={() => setExitServer(null)}
                                        >
                                            移除
                                        </Button>
                                    </div>
                                    
                                    <div style={{ marginBottom: 8 }}>
                                        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                            出口类型:
                                        </Typography.Text>
                                        <Tag color="orange" style={{ marginRight: 0 }}>
                                            {exitTypeEnum['PROXY'].text}
                                        </Tag>
                                    </div>
                                    
                                    <div>
                                        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                            出口IP:
                                        </Typography.Text>
                                        <div style={{ padding: '4px 0' }}>
                                            {exitServer.ip}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                                    请选择出口服务器
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
                <div style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    marginTop: 12, 
                    color: '#999',
                    fontSize: 12
                }}>
                    <ArrowRightOutlined style={{ color: '#1890ff', marginRight: 8 }} /> 
                    数据流向: 从左至右，依次经过所有中继服务器，最终到达出口服务器
                </div>
            </div>
        );
    };
    
    // 服务器选择组件
    const ServerSelection = () => {
        return (
            <div className="server-selection">
                <Typography.Title level={5}>可用服务器</Typography.Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card size="small" title="中继服务器" style={{ marginBottom: 16 }}>
                            <Row gutter={[8, 8]}>
                                {sampleServers
                                    .filter(server => server.type === 'NORMAL')
                                    .map(server => (
                                        <Col span={12} key={server.id}>
                                            <Card 
                                                hoverable 
                                                size="small"
                                                onClick={() => handleServerSelect(server)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography.Text strong>{server.name}</Typography.Text>
                                                    <Typography.Text type="secondary">ID: {server.id}</Typography.Text>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" title="出口服务器" style={{ marginBottom: 16 }}>
                            <Row gutter={[8, 8]}>
                                {sampleServers
                                    .filter(server => server.type === 'EXIT')
                                    .map(server => (
                                        <Col span={12} key={server.id}>
                                            <Card 
                                                hoverable 
                                                size="small"
                                                onClick={() => handleServerSelect(server)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography.Text strong>{server.name}</Typography.Text>
                                                    <Typography.Text type="secondary">ID: {server.id}</Typography.Text>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    const columns: ProColumns<ForwardRuleItem>[] = [
        {
            title: '规则ID',
            dataIndex: 'ruleId',
            width: '10%',
            fieldProps: {
                autoFocus: false,
            }
        },
        {
            title: '入口',
            key: 'entry',
            width: '15%',
            render: (_, record) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Tag color="blue">{entryTypeEnum[record.entryType].text}</Tag>
                    <span>{record.entryConfig}</span>
                </div>
            ),
            renderFormItem: () => (
                <div>
                    <ProFormSelect
                        name="entryType"
                        placeholder="入口类型"
                        valueEnum={entryTypeEnum}
                        rules={[{ required: true, message: '入口类型为必填项' }]}
                        fieldProps={{
                            autoFocus: false,
                        }}
                    />
                    <ProFormText
                        name="entryConfig"
                        placeholder="入口配置"
                        rules={[{ required: true, message: '入口配置为必填项' }]}
                        fieldProps={{
                            autoFocus: false,
                        }}
                    />
                </div>
            ),
            fieldProps: {
                autoFocus: false,
            }
        },
        {
            title: '已用流量 (MB)',
            dataIndex: 'trafficUsed',
            valueType: 'digit',
            width: '10%',
            sorter: (a, b) => a.trafficUsed - b.trafficUsed,
            fieldProps: {
                autoFocus: false,
            }
        },
        {
            title: '途径节点',
            dataIndex: 'viaNodes',
            width: '15%',
            render: (_, record) => (
                <Space wrap>
                    {record.viaNodes && record.viaNodes.length > 0 ? (
                        record.viaNodes.map((node, index) => (
                            <Tag key={index} color="purple">{node}</Tag>
                        ))
                    ) : (
                        <span style={{ color: '#999' }}>无途径节点</span>
                    )}
                </Space>
            ),
            renderFormItem: () => (
                <div>
                    <ProFormText
                        name="viaNodes"
                        placeholder="输入节点，以逗号分隔"
                        fieldProps={{
                            autoFocus: false,
                        }}
                    />
                </div>
            ),
            fieldProps: {
                autoFocus: false,
            }
        },
        {
            title: '出口',
            key: 'exit',
            width: '15%',
            render: (_, record) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Tag color={
                        record.exitType === 'DIRECT' ? 'green' : 
                        record.exitType === 'PROXY' ? 'orange' : 
                        'red'
                    }>
                        {exitTypeEnum[record.exitType].text}
                    </Tag>
                    <span>{record.exitConfig}</span>
                </div>
            ),
            renderFormItem: () => (
                <div>
                    <ProFormSelect
                        name="exitType"
                        placeholder="出口类型"
                        valueEnum={exitTypeEnum}
                        rules={[{ required: true, message: '出口类型为必填项' }]}
                        fieldProps={{
                            autoFocus: false,
                        }}
                    />
                    <ProFormText
                        name="exitConfig"
                        placeholder="出口配置"
                        fieldProps={{
                            autoFocus: false,
                        }}
                    />
                </div>
            ),
            fieldProps: {
                autoFocus: false,
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: '10%',
            render: (_, record) => (
                <Badge 
                    status={
                        record.status === 'ACTIVE' ? 'success' : 
                        record.status === 'PAUSED' ? 'default' : 
                        'error'
                    } 
                    text={ruleStatusEnum[record.status].text} 
                />
            ),
            valueType: 'select',
            valueEnum: ruleStatusEnum,
            filters: true,
            onFilter: (value, record) => record.status === value,
        },
        {
            title: '操作',
            valueType: 'option',
            width: '30%',
            render: (_, record) => (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Tooltip key="toggle" title={record.status === 'ACTIVE' ? '暂停' : '启动'}>
                        <a onClick={() => toggleRuleStatus(record)}>
                            {record.status === 'ACTIVE' ? 
                                <Tag icon={<PauseCircleOutlined />} color="default">暂停</Tag> : 
                                <Tag icon={<PlayCircleOutlined />} color="success">启动</Tag>
                            }
                        </a>
                    </Tooltip>
                    <Tooltip key="diagnose" title="诊断">
                        <a onClick={() => diagnoseRule(record)}>
                            <Tag icon={<BugOutlined />} color="processing">诊断</Tag>
                        </a>
                    </Tooltip>
                    <Tooltip key="copy" title="复制">
                        <a onClick={() => copyRule(record)}>
                            <Tag icon={<CopyOutlined />} color="cyan">复制</Tag>
                        </a>
                    </Tooltip>
                    <Tooltip key="edit" title="编辑">
                        <a onClick={() => setEditableKeys([record.id])}>
                            <Tag icon={<EditOutlined />} color="blue">编辑</Tag>
                        </a>
                    </Tooltip>
                    <Popconfirm
                        key="delete"
                        title="确定要删除此规则吗？"
                        onConfirm={() => deleteRule(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <a>
                                <Tag icon={<DeleteOutlined />} color="error">删除</Tag>
                            </a>
                        </Tooltip>
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
                    message.success('查询成功');
                }}
            >
                <ProFormText name="ruleId" label="规则ID" colProps={{ span: 8 }} />
                <ProFormSelect 
                    name="entryType" 
                    label="入口类型" 
                    colProps={{ span: 8 }}
                    valueEnum={entryTypeEnum}
                />
                <ProFormSelect 
                    name="exitType" 
                    label="出口类型" 
                    colProps={{ span: 8 }}
                    valueEnum={exitTypeEnum}
                />
                <ProFormSelect 
                    name="status" 
                    label="状态" 
                    colProps={{ span: 8 }}
                    valueEnum={ruleStatusEnum}
                />
            </QueryFilter>

            <EditableProTable<ForwardRuleItem>
                rowKey="id"
                headerTitle="转发规则列表"
                maxLength={20}
                scroll={{ x: 1200 }}
                recordCreatorProps={
                    position !== 'hidden'
                        ? {
                              position: position,
                              record: () => ({ 
                                id: (Math.random() * 1000000).toFixed(0), 
                                ruleId: `rule${Date.now().toString().substr(-6)}`, 
                                entryType: 'HTTP',
                                entryConfig: '',
                                trafficUsed: 0,
                                exitType: 'DIRECT',
                                exitConfig: '',
                                status: 'PAUSED',
                                viaNodes: []
                              }),
                              creatorButtonText: '新建规则',
                              onClick: () => {
                                  // 点击新建按钮时打开ModelForm对话框而不是直接添加表格行
                                  setModelFormVisible(true);
                                  return false; // 阻止默认行为
                              },
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
                                setModelFormVisible(true);
                            }}
                            type="primary"
                        >
                            新建规则
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
                    actionRender: (row, config, defaultDoms) => {
                        const SaveButton = () => (
                            <span style={{ marginRight: 8 }}>{defaultDoms.save}</span>
                        );
                        const CancelButton = () => defaultDoms.cancel;
                        return [<SaveButton key="save" />, <CancelButton key="cancel" />];
                    },
                }}
                defaultSize="small"
                search={false}
                options={false}
                tableAlertRender={false}
            />

            {/* 服务器配置ModelForm对话框 */}
            <Modal
                title="配置转发规则路径"
                open={modelFormVisible}
                width={900}
                destroyOnHidden={true}
                onCancel={() => {
                    setModelFormVisible(false);
                    resetPathConfig();
                }}
                onOk={handleSubmit}
                okText="创建规则"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    {/* 世界地图部分 */}
                    <div style={{ height: 500 }}>
                        {typeof window !== 'undefined' && (
                            <DynamicLeafletWrapper 
                                selectedPath={selectedPath}
                                sampleServers={sampleServers}
                                exitServer={exitServer}
                                handleServerSelect={handleServerSelect}
                                serverTypeEnum={serverTypeEnum}
                            />
                        )}
                    </div>
                    
                    <Divider />
                    
                    {/* 配置路径部分 */}
                    <PathConfiguration />
                    
                    <Divider />
                    
                    {/* 服务器选择部分 */}
                    <ServerSelection />
                </Form>
            </Modal>
        </div>
    );
};

export default ForwardRules; 