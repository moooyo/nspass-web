import { http, HttpResponse } from 'msw';
import type { EgressItem } from '@/types/generated/model/egressItem';
import { EgressMode, ForwardType } from '@/types/generated/model/egress';
import { generateRandomPort } from '@/utils/passwordUtils';

// 模拟出口配置数据
const mockEgressData: EgressItem[] = [
    {
        id: '1',
        egressId: 'egress001',
        serverId: 'server01',
        egressMode: EgressMode.EGRESS_MODE_DIRECT,
        egressConfig: '目的地址: 203.0.113.1',
        targetAddress: '203.0.113.1',
    },
    {
        id: '2',
        egressId: 'egress002',
        serverId: 'server01',
        egressMode: EgressMode.EGRESS_MODE_IPTABLES,
        egressConfig: 'TCP转发至 192.168.1.1:8080',
        forwardType: ForwardType.FORWARD_TYPE_TCP,
        destAddress: '192.168.1.1',
        destPort: '8080',
    },
    {
        id: '3',
        egressId: 'egress003',
        serverId: 'server02',
        egressMode: EgressMode.EGRESS_MODE_IPTABLES,
        egressConfig: '全部转发至 10.0.0.1:443',
        forwardType: ForwardType.FORWARD_TYPE_ALL,
        destAddress: '10.0.0.1',
        destPort: '443',
    },
    {
        id: '4',
        egressId: 'egress004',
        serverId: 'server03',
        egressMode: EgressMode.EGRESS_MODE_SS2022,
        egressConfig: 'Shadowsocks-2022，端口: 25678，支持UDP',
        password: 'password123',
        supportUdp: true,
        port: 25678,
    },
];

let nextId = 5;

export const egressHandlers = [
    // 获取出口配置列表
    http.get('/v1/egress', ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        const egressId = url.searchParams.get('egressId');
        const serverId = url.searchParams.get('serverId');
        const egressMode = url.searchParams.get('egressMode');

        let filteredData = [...mockEgressData];

        // 应用筛选条件
        if (egressId) {
            filteredData = filteredData.filter(item => item.egressId?.includes(egressId));
        }
        if (serverId) {
            filteredData = filteredData.filter(item => item.serverId === serverId);
        }
        if (egressMode) {
            filteredData = filteredData.filter(item => item.egressMode === egressMode);
        }

        // 分页
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return HttpResponse.json({
            success: true,
            data: paginatedData,
            pagination: {
                current: page,
                pageSize,
                total: filteredData.length,
                totalPages: Math.ceil(filteredData.length / pageSize)
            }
        });
    }),

    // 创建出口配置
    http.post('/v1/egress', async ({ request }) => {
        const data = await request.json() as EgressItem;
        
        const newEgress: EgressItem = {
            ...data,
            id: (nextId++).toString(),
            egressId: data.egressId || `egress${Date.now().toString().substr(-6)}`,
        };
        
        // 如果是shadowsocks-2022模式且没有提供端口，则生成随机端口
        if (data.egressMode === EgressMode.EGRESS_MODE_SS2022 && !data.port) {
            newEgress.port = generateRandomPort(20000, 50000);
            console.log(`[EGRESS MOCK] 为Shadowsocks配置生成随机端口: ${newEgress.port}`);
        }
        
        // 更新egressConfig以包含端口信息
        if (newEgress.egressMode === EgressMode.EGRESS_MODE_SS2022) {
            const portInfo = newEgress.port ? `，端口: ${newEgress.port}` : '';
            const udpInfo = newEgress.supportUdp ? '，支持UDP' : '';
            newEgress.egressConfig = `Shadowsocks-2022${portInfo}${udpInfo}`;
        }
        
        mockEgressData.push(newEgress);
        
        return HttpResponse.json({
            success: true,
            message: '出口配置创建成功',
            data: newEgress
        });
    }),

    // 获取单个出口配置
    http.get('/v1/egress/:id', ({ params }) => {
        const id = params.id as string;
        const egress = mockEgressData.find(item => item.id === id);

        if (!egress) {
            return HttpResponse.json({
                success: false,
                message: '出口配置不存在',
                errorCode: 'EGRESS_NOT_FOUND'
            }, { status: 404 });
        }

        return HttpResponse.json({
            success: true,
            message: '获取出口配置成功',
            data: egress
        });
    }),

    // 更新出口配置
    http.put('/v1/egress/:id', async ({ params, request }) => {
        const id = params.id as string;
        const updateData = await request.json() as Partial<EgressItem>;
        
        const index = mockEgressData.findIndex(item => item.id === id);
        if (index === -1) {
            return HttpResponse.json({
                success: false,
                message: '出口配置不存在',
                errorCode: 'EGRESS_NOT_FOUND'
            }, { status: 404 });
        }

        mockEgressData[index] = { ...mockEgressData[index], ...updateData };
        
        return HttpResponse.json({
            success: true,
            message: '出口配置更新成功',
            data: mockEgressData[index]
        });
    }),

    // 删除出口配置
    http.delete('/v1/egress/:id', ({ params }) => {
        const id = params.id as string;
        const index = mockEgressData.findIndex(item => item.id === id);
        
        if (index === -1) {
            return HttpResponse.json({
                success: false,
                message: '出口配置不存在',
                errorCode: 'EGRESS_NOT_FOUND'
            }, { status: 404 });
        }

        const deletedEgress = mockEgressData.splice(index, 1)[0];
        
        return HttpResponse.json({
            success: true,
            message: `出口配置 ${deletedEgress.egressId} 删除成功`
        });
    }),

    // 批量删除出口配置
    http.post('/v1/egress/batch-delete', async ({ request }) => {
        const { ids } = await request.json() as { ids: string[] };
        let deletedCount = 0;
        
        ids.forEach(id => {
            const index = mockEgressData.findIndex(item => item.id === id);
            if (index !== -1) {
                mockEgressData.splice(index, 1);
                deletedCount++;
            }
        });
        
        return HttpResponse.json({
            success: true,
            message: `成功删除 ${deletedCount} 个出口配置`
        });
    }),

    // 测试出口连接
    http.post('/v1/egress/:id/test', ({ params }) => {
        const id = params.id as string;
        const egress = mockEgressData.find(item => item.id === id);

        if (!egress) {
            return HttpResponse.json({
                success: false,
                message: '出口配置不存在',
                errorCode: 'EGRESS_NOT_FOUND'
            }, { status: 404 });
        }

        // 模拟测试结果
        const success = Math.random() > 0.2; // 80%成功率
        const latency = success ? Math.floor(Math.random() * 200) + 20 : 0;

        return HttpResponse.json({
            success: true,
            message: '连接测试完成',
            data: {
                success,
                latency,
                error: success ? undefined : '连接超时'
            }
        });
    }),

    // 获取出口统计信息
    http.get('/v1/egress/:id/stats', ({ params }) => {
        const id = params.id as string;
        const egress = mockEgressData.find(item => item.id === id);

        if (!egress) {
            return HttpResponse.json({
                success: false,
                message: '出口配置不存在',
                errorCode: 'EGRESS_NOT_FOUND'
            }, { status: 404 });
        }

        return HttpResponse.json({
            success: true,
            message: '获取出口统计成功',
            data: {
                connectionsCount: Math.floor(Math.random() * 100) + 10,
                bytesTransferred: Math.floor(Math.random() * 1000000) + 100000,
                lastActivity: new Date().toISOString()
            }
        });
    }),

    // 验证出口配置 - 匹配swagger接口 POST /v1/egress/validate-config
    http.post('/v1/egress/validate-config', async ({ request }) => {
        const data = await request.json() as EgressItem;
        
        // 模拟验证逻辑
        const errors: string[] = [];
        const warnings: string[] = [];
        
        if (!data.serverId) {
            errors.push('服务器ID不能为空');
        }
        if (!data.egressMode) {
            errors.push('出口模式不能为空');
        }
        
        if (data.egressMode === EgressMode.EGRESS_MODE_SS2022 && !data.password) {
            warnings.push('建议设置强密码以确保安全性');
        }
        
        return HttpResponse.json({
            success: true,
            message: '配置验证完成',
            data: {
                valid: errors.length === 0,
                errors,
                warnings
            }
        });
    }),

    // 获取可用服务器列表 - 匹配swagger接口 GET /v1/egress/available-servers
    http.get('/v1/egress/available-servers', () => {
        return HttpResponse.json({
            success: true,
            message: '获取可用服务器列表成功',
            data: [
                { id: 'server01', name: '服务器01', country: 'CN' },
                { id: 'server02', name: '服务器02', country: 'US' },
                { id: 'server03', name: '服务器03', country: 'JP' },
                { id: 'hk-server-01', name: '香港服务器', country: 'HK' },
                { id: 'jp-server-01', name: '日本服务器', country: 'JP' },
                { id: 'us-server-01', name: '美国服务器', country: 'US' },
            ]
        });
    }),
]; 