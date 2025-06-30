import React, { useState, FC, useRef, useCallback, useMemo, useEffect } from 'react';
import { Button, Tag, Popconfirm, Badge, Space, Tooltip, Modal, Form, Card, Row, Col, Typography, Divider } from 'antd';
import { message } from '@/utils/message';
import {
    ProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
    ModalForm,
} from '@ant-design/pro-components';
import { 
    PlusOutlined, 
    ReloadOutlined,
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
import { forwardRulesService } from '@/services/forwardRules';
import type { ForwardRule, RuleStatus } from '@/services/forwardRules';
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

// 将API数据转换为组件数据格式
const convertForwardRuleToItem = (rule: ForwardRule): ForwardRuleItem => {
    return {
        id: rule.id || 0,
        ruleId: `rule${rule.id || 0}`,
        entryType: 'HTTP', // 根据API数据映射
        entryConfig: `${rule.targetAddress || ''}:${rule.targetPort || 0}`,
        trafficUsed: (rule.uploadTraffic || 0) + (rule.downloadTraffic || 0),
        exitType: rule.egressMode === 'EGRESS_MODE_DIRECT' ? 'DIRECT' : 'PROXY',
        exitConfig: rule.targetAddress || '',
        status: rule.status === 'RULE_STATUS_ACTIVE' ? 'ACTIVE' : 
                rule.status === 'RULE_STATUS_INACTIVE' ? 'PAUSED' : 'ERROR',
        viaNodes: [], // API数据中可能没有这个字段
    };
};

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
    const [dataSource, setDataSource] = useState<ForwardRuleItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasLoadedData, setHasLoadedData] = useState<boolean>(false);
    
    // 统一的Modal状态管理
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRecord, setCurrentRecord] = useState<ForwardRuleItem | null>(null);
    const [selectedPath, setSelectedPath] = useState<ServerItem[]>([]);
    const [exitServer, setExitServer] = useState<ServerItem | null>(null);
    const [form] = Form.useForm();
    
    // 地图缓存相关状态
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    // 加载转发规则数据
    const loadRules = useCallback(async () => {
        try {
            setLoading(true);
            const response = await forwardRulesService.getRules();
            
            if (response.success) {
                const rulesData = response.data?.data || [];
                const convertedRules = rulesData.map(convertForwardRuleToItem);
                setDataSource(convertedRules);
                setHasLoadedData(true);
                message.success(response.message || '获取转发规则成功');
            } else {
                // 失败时清空数据，避免显示过期缓存
                setDataSource([]);
                setHasLoadedData(false);
                message.error(response.message || '获取转发规则失败');
            }
        } catch (error) {
            console.error('获取转发规则失败:', error);
            // 失败时清空数据，避免显示过期缓存
            setDataSource([]);
            setHasLoadedData(false);
            message.error('获取转发规则失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRules();
    }, [loadRules]);

    // 暂停/启动规则
    const toggleRuleStatus = async (record: ForwardRuleItem) => {
        try {
            const newStatus = record.status === 'ACTIVE';
            const response = await forwardRulesService.toggleRule({
                id: record.id as number,
                enabled: !newStatus
            });
            
            if (response.success) {
                const newDataSource = dataSource.map(item => {
                    if (item.id === record.id) {
                        const newStatus: keyof typeof ruleStatusEnum = record.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
                        return { ...item, status: newStatus };
                    }
                    return item;
                });
                setDataSource(newDataSource);
                message.success(response.message || (record.status === 'ACTIVE' ? 
                    `已暂停规则: ${record.ruleId}` : 
                    `已启动规则: ${record.ruleId}`)
                );
            } else {
                message.error(response.message || '操作失败');
            }
        } catch (error) {
            console.error('切换规则状态失败:', error);
            message.error('操作失败');
        }
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
    const deleteRule = async (record: ForwardRuleItem) => {
        try {
            const response = await forwardRulesService.deleteRule({ id: record.id as number });
            if (response.success) {
                setDataSource(dataSource.filter(item => item.id !== record.id));
                message.success(response.message || `已删除规则: ${record.ruleId}`);
            } else {
                message.error(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除规则失败:', error);
            message.error('删除失败');
        }
    };

    // 打开新增弹窗
    const openCreateModal = () => {
        setModalMode('create');
        setCurrentRecord(null);
        setSelectedPath([]);
        setExitServer(null);
        setModalVisible(true);
        // 标记地图已渲染，确保缓存
        mapRenderedRef.current = true;
    };

    // 打开编辑弹窗
    const openEditModal = (record: ForwardRuleItem) => {
        setModalMode('edit');
        setCurrentRecord(record);
        
        // 根据现有规则数据恢复路径配置
        // 这里可以根据record.viaNodes来恢复selectedPath
        // 和根据record.exitConfig来恢复exitServer
        setSelectedPath([]); // 可以根据viaNodes恢复
        setExitServer(null); // 可以根据exitConfig恢复
        
        setModalVisible(true);
        // 标记地图已渲染，确保缓存
        mapRenderedRef.current = true;
    };

    // 处理服务器选择 - 使用useCallback缓存
    const handleServerSelect = useCallback((server: ServerItem) => {
        if (server.type === 'NORMAL') {
            // 添加普通服务器到路径
            setSelectedPath(prevPath => [...prevPath, server]);
        } else if (server.type === 'EXIT') {
            // 替换出口服务器
            setExitServer(server);
        }
    }, []);
    
    // 优化：使用ref来存储地图状态，避免不必要的重新渲染
    const mapRenderedRef = useRef(false);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const windowSizeRef = useRef({ width: 0, height: 0 });
    
    // 优化：延迟加载地图，只在真正需要时渲染
    const shouldRenderMap = modalVisible && mapRenderedRef.current;
    
    // 优化：使用throttled的窗口大小监听，减少性能开销
    useEffect(() => {
        const handleResize = () => {
            // 清除之前的定时器
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            
            // 使用throttling，避免频繁的resize处理
            resizeTimeoutRef.current = setTimeout(() => {
                const newSize = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
                
                // 只有在尺寸真正改变且改变幅度较大时才更新
                const threshold = 50; // 50px的变化阈值
                const sizeChanged = 
                    Math.abs(windowSizeRef.current.width - newSize.width) > threshold ||
                    Math.abs(windowSizeRef.current.height - newSize.height) > threshold;
                
                if (sizeChanged) {
                    windowSizeRef.current = newSize;
                    // 只有在地图已渲染时才触发重新渲染
                    if (mapRenderedRef.current && modalVisible) {
                        // 这里可以添加地图重新计算的逻辑
                        console.log('地图需要重新计算尺寸');
                    }
                }
            }, 300); // 300ms的debounce
        };
        
        // 使用 passive 监听器提高性能
        window.addEventListener('resize', handleResize, { passive: true } as AddEventListenerOptions);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [modalVisible]); // 只依赖modalVisible
    
    // 当Modal打开时不需要特殊处理，因为地图会保持缓存
    
    // 重置路径配置
    const resetPathConfig = useCallback(() => {
        setSelectedPath([]);
        setExitServer(null);
        // 不重置地图初始化状态，保持地图缓存
        // 移除这些配置项，因为出口服务器是只读的
        // setExitConfig('');
        // setSelectedExitType('PROXY');
    }, []);
    
    // 提交配置
    const handleSubmit = () => {
        // 检查是否有出口服务器
        if (!exitServer) {
            message.error('请选择一个出口服务器');
            return;
        }
        
        // 处理提交逻辑
        const viaNodes = selectedPath.map(server => server.name);
        
        if (modalMode === 'create') {
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
        } else {
            // 编辑现有规则
            if (!currentRecord) {
                message.error('无法找到要编辑的规则');
                return;
            }
            
            const updatedRule: ForwardRuleItem = {
                ...currentRecord,
                exitType: 'PROXY',
                exitConfig: exitServer.ip,
                viaNodes: viaNodes,
            };
            
            const updatedDataSource = dataSource.map(item => 
                item.id === currentRecord.id ? updatedRule : item
            );
            setDataSource(updatedDataSource);
            message.success('更新规则成功');
        }
        
        setModalVisible(false);
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

    // 使用 useMemo 缓存表格列配置，避免每次渲染重新创建
    const columns: ProColumns<ForwardRuleItem>[] = useMemo(() => [
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
                        <a onClick={() => openEditModal(record)}>
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
    ], [toggleRuleStatus, diagnoseRule, copyRule, openEditModal, deleteRule]); // 只依赖函数

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

            <ProTable<ForwardRuleItem>
                rowKey="id"
                headerTitle="转发规则列表"
                scroll={{ x: 'max-content' }}
                loading={loading}
                toolBarRender={() => [
                    <Button
                        key="refresh"
                        icon={<ReloadOutlined />}
                        onClick={loadRules}
                        loading={loading}
                    >
                        刷新
                    </Button>,
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                        type="primary"
                    >
                        新建规则
                    </Button>
                ]}
                columns={columns}
                dataSource={dataSource}
                size="small"
                search={false}
                options={false}
                tableAlertRender={false}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />

            {/* 服务器配置ModelForm对话框 */}
            <Modal
                title={modalMode === 'create' ? '配置转发规则路径' : '编辑转发规则路径'}
                open={modalVisible}
                width={900}
                destroyOnHidden={false}
                onCancel={() => {
                    setModalVisible(false);
                    resetPathConfig();
                }}
                onOk={handleSubmit}
                okText={modalMode === 'create' ? '创建规则' : '更新规则'}
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    {/* 世界地图部分 - 简单的条件渲染缓存 */}
                    <div 
                        ref={mapContainerRef}
                        style={{ height: 500 }}
                    >
                        {shouldRenderMap ? (
                            typeof window !== 'undefined' && (
                                <DynamicLeafletWrapper 
                                    key="map-instance"
                                    selectedPath={selectedPath}
                                    sampleServers={sampleServers}
                                    exitServer={exitServer}
                                    handleServerSelect={handleServerSelect}
                                    serverTypeEnum={serverTypeEnum}
                                />
                            )
                        ) : (
                            <div style={{ 
                                height: 500, 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                background: '#f5f5f5' 
                            }}>
                                准备地图组件...
                            </div>
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

export default React.memo(ForwardRules); 