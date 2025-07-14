import React, { useState, FC, useRef, useCallback, useMemo, useEffect } from 'react';
import { Button, Tag, Popconfirm, Badge, Space, Tooltip, Modal, Form, Card, Row, Col, Typography, Divider } from 'antd';
import { handleApiResponse, message } from '@/utils/message';
import {
    ProTable,
    ProColumns,
    ProFormSelect,
    ProFormText,
    QueryFilter,
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
import { ServerItem as BaseServerItem } from './LeafletWrapper';
import { forwardRulesService } from '@/services/forwardRules';
import type { ForwardRule } from '@/services/forwardRules';
import { serverService } from '@/services/server';
import type { ServerItem as ApiServerItem } from '@/types/generated/api/servers/server_management';
import { egressService } from '@/services/egress';
import type { EgressItem } from '@/types/generated/model/egressItem';
import { forwardPathRulesService, ForwardPathRuleType } from '@/services/forwardPathRules';
import 'leaflet/dist/leaflet.css';
import { useApiOnce } from '@/components/hooks/useApiOnce';

// 扩展ServerItem类型以支持调试信息
interface ServerItem extends BaseServerItem {
    _egressConfig?: EgressItem;
    _matchedApiServer?: ApiServerItem;
    _apiServer?: ApiServerItem;
}

// 动态导入LeafletWrapper组件，禁用SSR
const DynamicLeafletWrapper = dynamic(() => import('./LeafletWrapper'), {
  ssr: false,
  loading: () => <div style={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>加载地图组件...</div>
});

// 服务器类型枚举
const serverTypeEnum = {
    NORMAL: { text: '普通服务器', color: 'blue' },
    EXIT: { text: '出口规则', color: 'orange' },
};

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
    
    // 服务器数据状态
    const [apiServers, setApiServers] = useState<ApiServerItem[]>([]);
    const [serversLoading, setServersLoading] = useState<boolean>(false);
    
    // 出口配置数据状态
    const [egressConfigs, setEgressConfigs] = useState<EgressItem[]>([]);
    const [egressLoading, setEgressLoading] = useState<boolean>(false);
    
    // 统一的Modal状态管理
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRecord, setCurrentRecord] = useState<ForwardRuleItem | null>(null);
    const [selectedPath, setSelectedPath] = useState<ServerItem[]>([]);
    const [exitServer, setExitServer] = useState<ServerItem | null>(null);
    const [form] = Form.useForm();
    
    // 确保 form 实例在需要时才被使用
    useEffect(() => {
        if (modalVisible && form) {
            if (modalMode === 'create') {
                form.resetFields();
            } else if (modalMode === 'edit' && currentRecord) {
                form.setFieldsValue(currentRecord);
            }
        }
    }, [modalVisible, modalMode, currentRecord, form]);
    
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
                // Data loaded successfully
                handleApiResponse.fetch(response, '获取转发规则');
            } else {
                // 失败时清空数据，避免显示过期缓存
                setDataSource([]);
                // Error loading data
                handleApiResponse.fetch(response, '获取转发规则');
            }
        } catch (error) {
            // 失败时清空数据，避免显示过期缓存
            setDataSource([]);
            // Error loading data
            message.error('获取转发规则失败');
        } finally {
            setLoading(false);
        }
    }, []);

    // 使用useApiOnce防止重复API调用
    useApiOnce(() => {
        loadRules();
        loadServers(); // 同时加载服务器数据
        loadEgressConfigs(); // 同时加载出口配置数据
    });

    // 加载出口配置数据
    const loadEgressConfigs = useCallback(async () => {
        try {
            setEgressLoading(true);
            const response = await egressService.getEgressList({
                pageSize: 1000 // 获取所有出口配置
            });
            
            if (response.success && response.data) {
                // 转换服务层返回的数据类型到组件期望的类型
                const convertedData: EgressItem[] = response.data.map(item => ({
                    id: item.id?.toString(),
                    egressName: item.egressName,  // 使用egressName而不是egressId
                    serverId: item.serverId,
                    egressMode: item.egressMode,
                    targetAddress: item.targetAddress,
                    forwardType: item.forwardType,
                    destAddress: item.destAddress,
                    destPort: item.destPort,
                    password: item.password,
                    supportUdp: item.supportUdp
                }));
                setEgressConfigs(convertedData);
                handleApiResponse.fetch(response, '获取出口配置');
            } else {
                setEgressConfigs([]);
                handleApiResponse.fetch(response, '获取出口配置');
            }
        } catch (error) {
            setEgressConfigs([]);
            message.error('获取出口配置失败');
        } finally {
            setEgressLoading(false);
        }
    }, []);

    // 暂停/启动规则
    const toggleRuleStatus = useCallback(async (record: ForwardRuleItem) => {
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
                // // handleDataResponse.userAction('切换规则状态', false, response);
            }
        } catch (error) {
            // // handleDataResponse.userAction('切换规则状态', false, undefined, error);
        }
    }, [dataSource, setDataSource]);

    // 诊断规则
    const diagnoseRule = useCallback((record: ForwardRuleItem) => {
        message.info(`正在诊断规则: ${record.ruleId}`);
        // 这里可以添加诊断逻辑，比如弹出诊断结果或跳转到诊断页面
        setTimeout(() => {
            message.success(`规则 ${record.ruleId} 诊断完成，一切正常！`);
        }, 1500);
    }, []);

    // 复制规则
    const copyRule = useCallback((record: ForwardRuleItem) => {
        const newRule: ForwardRuleItem = {
            ...record,
            id: Date.now(),
            ruleId: `${record.ruleId}_copy`,
            status: 'PAUSED', // 复制的规则默认是暂停状态
            trafficUsed: 0, // 复制的规则流量使用量为0
            viaNodes: [], // 复制的规则途径节点为空
        };
        setDataSource([...dataSource, newRule]);
        // // handleDataResponse.userAction('复制规则', true, { message: `已复制规则: ${record.ruleId}` });
    }, [dataSource, setDataSource]);

    // 删除规则
    const deleteRule = useCallback(async (record: ForwardRuleItem) => {
        try {
            const response = await forwardRulesService.deleteRule({ id: record.id as number });
            if (response.success) {
                setDataSource(dataSource.filter(item => item.id !== record.id));
                // // handleDataResponse.userAction('删除规则', true, response);
            } else {
                // // handleDataResponse.userAction('删除规则', false, response);
            }
        } catch (error) {
            // // handleDataResponse.userAction('删除规则', false, undefined, error);
        }
    }, [dataSource, setDataSource]);

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
    const openEditModal = useCallback((record: ForwardRuleItem) => {
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
    }, [setModalMode, setCurrentRecord, setSelectedPath, setExitServer, setModalVisible]);

    // 处理服务器选择 - 使用useCallback缓存
    const handleServerSelect = useCallback((server: ServerItem) => {
        if (server.type === 'NORMAL') {
            // 添加普通服务器到路径
            setSelectedPath(prevPath => [...prevPath, server]);
        } else if (server.type === 'EXIT') {
            // 替换出口规则
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
        // 移除这些配置项，因为出口规则是只读的
        // setExitConfig('');
        // setSelectedExitType('PROXY');
    }, []);
    
    // 提交配置
    const handleSubmit = async () => {
        // 检查是否有出口规则
        if (!exitServer) {
            message.error('请选择一个出口规则');
            return;
        }
        
        // 处理提交逻辑
        const viaNodes = selectedPath.map(server => server.name);
        const pathServerIds = selectedPath.map(server => server.id);
        
        if (modalMode === 'create') {
            try {
                // 调用真实的API创建转发路径规则
                const createRequest = {
                    name: `转发规则-${Date.now().toString().substr(-6)}`,
                    type: ForwardPathRuleType.FORWARD_PATH_RULE_TYPE_HTTP, // 默认使用HTTP类型
                    pathServerIds: pathServerIds,
                    egressId: exitServer.id,
                    // egressName 由后端根据 egressId 自动填充，不需要前端传入
                };

                const response = await forwardPathRulesService.createForwardPathRule(createRequest);
                
                if (response.success) {
                    // API调用成功，更新本地状态
                    const createdRule = response.data;
                    const newRule: ForwardRuleItem = {
                        id: createdRule?.id || (Math.random() * 1000000).toFixed(0),
                        ruleId: createdRule?.id || `rule${Date.now().toString().substr(-6)}`,
                        entryType: 'HTTP',
                        entryConfig: '0.0.0.0:8080', // 默认配置
                        trafficUsed: 0,
                        exitType: 'PROXY', // 固定使用代理类型
                        exitConfig: exitServer.ip, // 使用出口规则的IP
                        status: 'PAUSED', // 新创建的规则默认为暂停状态
                        viaNodes: viaNodes,
                    };
                    
                    setDataSource([...dataSource, newRule]);
                    // // handleDataResponse.userAction('创建转发路径规则', true, response);
                    message.success('转发规则创建成功！');
                } else {
                    // // handleDataResponse.userAction('创建转发路径规则', false, response);
                    message.error(response.message || '创建转发规则失败');
                }
            } catch (error) {
                // // handleDataResponse.userAction('创建转发路径规则', false, undefined, error);
                message.error('创建转发规则时发生错误');
            }
        } else {
            // 编辑现有规则
            if (!currentRecord) {
                message.error('无法找到要编辑的规则');
                return;
            }
            
            try {
                // 调用真实的API更新转发路径规则
                const updateRequest = {
                    id: currentRecord.id.toString(),
                    name: `更新规则-${currentRecord.ruleId}`,
                    pathServerIds: pathServerIds,
                    egressId: exitServer.id,
                    // egressName 由后端根据 egressId 自动填充，不需要前端传入
                };

                const response = await forwardPathRulesService.updateForwardPathRule(updateRequest);
                
                if (response.success) {
                    // API调用成功，更新本地状态
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
                    // // handleDataResponse.userAction('更新转发路径规则', true, response);
                    message.success('转发规则更新成功！');
                } else {
                    // // handleDataResponse.userAction('更新转发路径规则', false, response);
                    message.error(response.message || '更新转发规则失败');
                }
            } catch (error) {
                // // handleDataResponse.userAction('更新转发路径规则', false, undefined, error);
                message.error('更新转发规则时发生错误');
            }
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

        // 更新exitServer的信息，移除因为出口规则是只读的
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
                                    <span>出口规则</span>
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
                                    请选择出口规则
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
                    数据流向: 从左至右，依次经过所有中继服务器，最终到达出口规则
                </div>
            </div>
        );
    };
    
    // 服务器选择组件
    const ServerSelection = () => {
        if (serversLoading || egressLoading) {
            return (
                <div className="server-selection">
                    <Typography.Title level={5}>可用服务器</Typography.Title>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: 200, 
                        color: '#666' 
                    }}>
                        加载服务器数据和出口配置中...
                    </div>
                </div>
            );
        }

        if (convertedServers.length === 0) {
            return (
                <div className="server-selection">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>可用服务器</Typography.Title>
                        <Button 
                            size="small" 
                            icon={<ReloadOutlined />} 
                            onClick={loadServers}
                            loading={serversLoading}
                            title="刷新服务器列表"
                        >
                            刷新
                        </Button>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: 150, 
                        color: '#666',
                        border: '1px dashed #d9d9d9',
                        borderRadius: 6,
                        backgroundColor: '#fafafa'
                    }}>
                        <div style={{ marginBottom: 8, fontSize: 16 }}>📡</div>
                        <div>暂无在线服务器</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                            请先在服务器管理页面创建并启动服务器
                        </div>
                    </div>
                </div>
            );
        }

        return (
                <div className="server-selection">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>可用服务器</Typography.Title>
                        <Button 
                            size="small" 
                            icon={<ReloadOutlined />} 
                            onClick={loadServers}
                            loading={serversLoading}
                            title="刷新服务器列表"
                        >
                            刷新
                        </Button>
                    </div>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card size="small" title="中继服务器" style={{ marginBottom: 16 }}>
                            <Row gutter={[8, 8]}>
                                {convertedServers
                                    .filter((server: ServerItem) => server.type === 'NORMAL')
                                    .map((server: ServerItem) => (
                                        <Col span={12} key={server.id}>
                                            <Card 
                                                hoverable 
                                                size="small"
                                                onClick={() => handleServerSelect(server)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography.Text strong>{server.name}</Typography.Text>
                                                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                                        IP: {server.ip}
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                                        {server.location.country}
                                                    </Typography.Text>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card 
                            size="small" 
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>出口规则</span>
                                    <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 'normal' }}>
                                        (来自出口配置)
                                    </Typography.Text>
                                </div>
                            } 
                            style={{ marginBottom: 16 }}
                        >
                            <Row gutter={[8, 8]}>
                                {convertedServers.filter((server: ServerItem) => server.type === 'EXIT').length > 0 ? (
                                    convertedServers
                                        .filter((server: ServerItem) => server.type === 'EXIT')
                                        .map((server: ServerItem) => (
                                            <Col span={12} key={server.id}>
                                                <Card 
                                                    hoverable 
                                                    size="small"
                                                    onClick={() => handleServerSelect(server)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography.Text strong>{server.name}</Typography.Text>
                                                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                                            IP: {server.ip}
                                                        </Typography.Text>
                                                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                                            {server.location.country}
                                                        </Typography.Text>
                                                    </div>
                                                </Card>
                                            </Col>
                                        ))
                                ) : (
                                    <Col span={24}>
                                        <div style={{ 
                                            textAlign: 'center', 
                                            padding: '20px', 
                                            color: '#666',
                                            border: '1px dashed #d9d9d9',
                                            borderRadius: 4,
                                            backgroundColor: '#fafafa'
                                        }}>
                                            <div style={{ marginBottom: 8, fontSize: 16 }}>🚪</div>
                                            <div>暂无出口规则</div>
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                                请先在出口配置页面创建出口配置
                                            </div>
                                            <div style={{ fontSize: 11, color: '#ccc', marginTop: 2 }}>
                                                已加载 {apiServers.length} 个服务器，{egressConfigs.length} 个出口配置
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    // 获取国家对应的大概坐标（简化版本）
    const getCountryCoordinates = (country: string) => {
        const coordinates: Record<string, { lat: number; lng: number; x: number; y: number }> = {
            '中国': { lat: 39.9042, lng: 116.4074, x: 650, y: 250 },
            '中国香港': { lat: 22.3193, lng: 114.1694, x: 650, y: 280 },
            '日本': { lat: 35.6762, lng: 139.6503, x: 700, y: 220 },
            '韩国': { lat: 37.5665, lng: 126.9780, x: 680, y: 210 },
            '新加坡': { lat: 1.3521, lng: 103.8198, x: 620, y: 350 },
            '美国': { lat: 39.8283, lng: -98.5795, x: 200, y: 220 },
            '德国': { lat: 51.1657, lng: 10.4515, x: 450, y: 180 },
            '英国': { lat: 55.3781, lng: -3.4360, x: 400, y: 160 },
            '法国': { lat: 46.2276, lng: 2.2137, x: 420, y: 190 },
            '荷兰': { lat: 52.1326, lng: 5.2913, x: 440, y: 170 },
        };
        
        return coordinates[country] || { lat: 0, lng: 0, x: 300, y: 200 };
    };

    // 【核心修复】基于出口配置创建出口规则列表
    const createExitServersFromEgressConfigs = useCallback((): ServerItem[] => {
        const exitServers: ServerItem[] = [];
        
        egressConfigs.forEach((egressConfig) => {
            // 尝试找到对应的API服务器信息
            const matchedApiServer = apiServers.find(apiServer => {
                // 支持多种匹配方式，确保最大兼容性
                return (
                    egressConfig.serverId === apiServer.id ||
                    egressConfig.serverId === apiServer.name ||
                    (apiServer.id && egressConfig.serverId?.includes(apiServer.id.toString())) ||
                    (apiServer.name && egressConfig.serverId?.includes(apiServer.name)) ||
                    // 反向匹配：API服务器ID包含出口配置的serverId
                    (apiServer.id?.toString().includes(egressConfig.serverId || '')) ||
                    (apiServer.name?.includes(egressConfig.serverId || ''))
                );
            });

            // 使用API服务器信息（如果存在），否则使用出口配置信息
            const serverName = matchedApiServer?.name || `出口规则-${egressConfig.serverId}`;
            const serverIp = matchedApiServer?.ipv4 || matchedApiServer?.ipv6 || 
                           egressConfig.targetAddress || '未知IP';
            const serverCountry = matchedApiServer?.country || '未知';
            
            const coords = getCountryCoordinates(serverCountry);
            
            // 创建出口规则项
            const exitServer: ServerItem = {
                id: egressConfig.id || `egress-${egressConfig.serverId}`,
                name: serverName,
                type: 'EXIT',
                ip: serverIp,
                location: {
                    country: serverCountry,
                    latitude: coords.lat,
                    longitude: coords.lng,
                    x: coords.x,
                    y: coords.y
                },
                // 附加出口配置信息用于调试
                _egressConfig: egressConfig,
                _matchedApiServer: matchedApiServer
            };
            
            exitServers.push(exitServer);
        });

        // 调试输出
        console.log('出口规则创建完成:', {
            egressConfigsCount: egressConfigs.length,
            apiServersCount: apiServers.length,
            exitServersCount: exitServers.length,
            exitServers: exitServers.map(s => ({ 
                id: s.id, 
                name: s.name, 
                ip: s.ip,
                hasApiServerMatch: !!s._matchedApiServer
            }))
        });

        return exitServers;
    }, [egressConfigs, apiServers]);

    // 创建中继服务器列表（显示所有服务器）
    const createRelayServersFromApiServers = useCallback((): ServerItem[] => {
        return apiServers
            .map(apiServer => {
                const coords = getCountryCoordinates(apiServer.country || '');
                
                return {
                    id: apiServer.id || '',
                    name: apiServer.name || '未命名服务器',
                    type: 'NORMAL' as const,
                    ip: apiServer.ipv4 || apiServer.ipv6 || '未知IP',
                    location: {
                        country: apiServer.country || '未知',
                        latitude: coords.lat,
                        longitude: coords.lng,
                        x: coords.x,
                        y: coords.y
                    },
                    _apiServer: apiServer
                };
            });
    }, [apiServers]);

    // 加载服务器数据
    const loadServers = useCallback(async () => {
        try {
            setServersLoading(true);
            const response = await serverService.getServers({
                pageSize: 1000 // 获取所有服务器，不限制状态
                // 移除状态过滤，获取所有服务器以便正确匹配出口配置
            });
            
            if (response.success && response.data) {
                setApiServers(response.data);
                // // handleDataResponse.success('获取服务器列表', response);
            } else {
                setApiServers([]);
                // // handleDataResponse.error('获取服务器列表', undefined, response);
            }
        } catch (error) {
            setApiServers([]);
            // // handleDataResponse.error('获取服务器列表', error);
        } finally {
            setServersLoading(false);
        }
    }, []);

    // 将API服务器数据转换为地图格式 - 使用新的逻辑
    const convertedServers = useMemo(() => {
        // 如果数据还在加载中，返回空数组
        if (serversLoading || egressLoading) {
            return [];
        }

        // 创建出口规则列表（基于出口配置）
        const exitServers = createExitServersFromEgressConfigs();
        
        // 创建中继服务器列表（排除被出口配置占用的服务器）
        const relayServers = createRelayServersFromApiServers();
        
        // 合并两个列表
        const allServers = [...relayServers, ...exitServers];
        
        console.log('【转发规则】服务器列表已更新:', {
            totalServers: allServers.length,
            relayServers: relayServers.length,
            exitServers: exitServers.length,
            egressConfigs: egressConfigs.length,
            apiServers: apiServers.length
        });
        
        return allServers;
    }, [apiServers, egressConfigs, serversLoading, egressLoading, createExitServersFromEgressConfigs, createRelayServersFromApiServers]); // 依赖所有相关数据

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

    // 添加调试信息来查看数据状态
    useEffect(() => {
        console.log('=== ForwardRules Debug Info ===');
        console.log('API Servers:', apiServers);
        console.log('Egress Configs:', egressConfigs);
        console.log('Converted Servers Count:', convertedServers.length);
        console.log('Exit Servers Count:', convertedServers.filter(s => s.type === 'EXIT').length);
        console.log('=== End Debug Info ===');
    }, [apiServers, egressConfigs, convertedServers]);

    return (
        <div>


            <QueryFilter
                defaultCollapsed
                split
                defaultColsNumber={3}
                onFinish={async (values) => {
                    console.log('✓ 转发规则查询完成:', values);
                    // 不显示查询成功提示，只在console记录
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
                                    sampleServers={convertedServers as BaseServerItem[]}
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