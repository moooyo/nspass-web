import { http, HttpResponse } from 'msw';
import type {
  ForwardPathRule,
  CreateForwardPathRuleRequest,
  UpdateForwardPathRuleRequest
} from '@/services/forwardPathRules';
import {
  ForwardPathRuleType,
  ForwardPathRuleStatus
} from '@/services/forwardPathRules';

// 模拟转发路径规则数据
const mockForwardPathRules: ForwardPathRule[] = [
  {
    id: 'fpr-001',
    userId: 1,
    name: 'HTTP代理路径规则',
    type: ForwardPathRuleType.FORWARD_PATH_RULE_TYPE_HTTP,
    status: ForwardPathRuleStatus.FORWARD_PATH_RULE_STATUS_ACTIVE,
    path: [
      {
        serverId: 'server-001',
        serverName: '中继服务器1',
        port: 8080,
        order: 1
      },
      {
        serverId: 'server-002',
        serverName: '中继服务器2',
        port: 8081,
        order: 2
      }
    ],
    egressId: 'exit-server-001',
    egressName: '出口规则1',
    trafficUp: 1024000,
    trafficDown: 2048000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'fpr-002',
    userId: 1,
    name: 'SOCKS5代理路径规则',
    type: ForwardPathRuleType.FORWARD_PATH_RULE_TYPE_TCP,
    status: ForwardPathRuleStatus.FORWARD_PATH_RULE_STATUS_INACTIVE,
    path: [
      {
        serverId: 'server-003',
        serverName: '中继服务器3',
        port: 1080,
        order: 1
      }
    ],
    egressId: 'exit-server-002',
    egressName: '出口规则2',
    trafficUp: 512000,
    trafficDown: 1024000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

let nextId = 3;

export const forwardPathRulesHandlers = [
  // 获取转发路径规则列表
  http.get('/v1/forward-path-rules', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status');

    let filteredRules = mockForwardPathRules;

    // 按状态筛选
    if (status && status !== 'FORWARD_PATH_RULE_STATUS_UNSPECIFIED') {
      filteredRules = filteredRules.filter(rule => rule.status === status);
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRules = filteredRules.slice(start, end);

    return HttpResponse.json({
      success: true,
      message: '获取转发路径规则列表成功',
      data: {
        rules: paginatedRules,
        total: filteredRules.length,
        page,
        pageSize
      }
    });
  }),

  // 创建转发路径规则
  http.post('/v1/forward-path-rules', async ({ request }) => {
    const body = await request.json() as CreateForwardPathRuleRequest;

    // 验证必填字段
    if (!body.name || !body.type || !body.egressId) {
      return HttpResponse.json({
        success: false,
        message: '缺少必填字段：规则名称、转发类型、出口规则ID为必填项',
        errorCode: 'INVALID_INPUT'
      }, { status: 400 });
    }

    if (!body.pathServerIds || body.pathServerIds.length === 0) {
      return HttpResponse.json({
        success: false,
        message: '至少需要选择一个路径服务器',
        errorCode: 'INVALID_INPUT'
      }, { status: 400 });
    }

    // 创建新规则
    const newRule: ForwardPathRule = {
      id: `fpr-${nextId.toString().padStart(3, '0')}`,
      userId: 1,
      name: body.name,
      type: body.type,
      status: ForwardPathRuleStatus.FORWARD_PATH_RULE_STATUS_INACTIVE, // 新建规则默认为非活跃状态
      path: body.pathServerIds.map((serverId, index) => ({
        serverId,
        serverName: `服务器-${serverId}`,
        port: 8080 + index,
        order: index + 1
      })),
      egressId: body.egressId,
      egressName: `出口规则-${body.egressId}`,
      trafficUp: 0,
      trafficDown: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    mockForwardPathRules.push(newRule);
    nextId++;

    return HttpResponse.json({
      success: true,
      message: '转发路径规则创建成功',
      data: newRule
    });
  }),

  // 获取单个转发路径规则
  http.get('/v1/forward-path-rules/:id', ({ params }) => {
    const id = params.id as string;
    const rule = mockForwardPathRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      message: '获取转发路径规则成功',
      data: {
        response: {
          success: true,
          message: '获取转发路径规则成功'
        },
        rule
      }
    });
  }),

  // 更新转发路径规则
  http.put('/v1/forward-path-rules/:id', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json() as Omit<UpdateForwardPathRuleRequest, 'id'>;
    const ruleIndex = mockForwardPathRules.findIndex(r => r.id === id);

    if (ruleIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    // 更新规则
    const rule = mockForwardPathRules[ruleIndex];
    if (body.name) rule.name = body.name;
    if (body.type) rule.type = body.type;
    if (body.status) rule.status = body.status;
    if (body.egressId) rule.egressId = body.egressId;
    if (body.pathServerIds) {
      rule.path = body.pathServerIds.map((serverId, index) => ({
        serverId,
        serverName: `服务器-${serverId}`,
        port: 8080 + index,
        order: index + 1
      }));
    }
    rule.updatedAt = Date.now();

    return HttpResponse.json({
      success: true,
      message: '转发路径规则更新成功',
      data: rule
    });
  }),

  // 删除转发路径规则
  http.delete('/v1/forward-path-rules/:id', ({ params }) => {
    const id = params.id as string;
    const ruleIndex = mockForwardPathRules.findIndex(r => r.id === id);

    if (ruleIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    const deletedRule = mockForwardPathRules.splice(ruleIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      message: `转发路径规则 ${deletedRule.name} 删除成功`,
      data: {
        response: {
          success: true,
          message: `转发路径规则 ${deletedRule.name} 删除成功`
        }
      }
    });
  }),

  // 启用转发路径规则
  http.post('/v1/forward-path-rules/:id/enable', ({ params }) => {
    const id = params.id as string;
    const rule = mockForwardPathRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    rule.status = ForwardPathRuleStatus.FORWARD_PATH_RULE_STATUS_ACTIVE;
    rule.updatedAt = Date.now();

    return HttpResponse.json({
      success: true,
      message: '转发路径规则已启用',
      data: {
        response: {
          success: true,
          message: '转发路径规则已启用'
        }
      }
    });
  }),

  // 禁用转发路径规则
  http.post('/v1/forward-path-rules/:id/disable', ({ params }) => {
    const id = params.id as string;
    const rule = mockForwardPathRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    rule.status = ForwardPathRuleStatus.FORWARD_PATH_RULE_STATUS_INACTIVE;
    rule.updatedAt = Date.now();

    return HttpResponse.json({
      success: true,
      message: '转发路径规则已禁用',
      data: {
        response: {
          success: true,
          message: '转发路径规则已禁用'
        }
      }
    });
  }),

  // 获取转发路径规则流量统计
  http.get('/v1/forward-path-rules/:id/traffic', ({ params, request }) => {
    const id = params.id as string;
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    const rule = mockForwardPathRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    // 生成模拟的日流量数据
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        upload: (Math.random() * 1000000).toFixed(0),
        download: (Math.random() * 2000000).toFixed(0)
      });
    }

    return HttpResponse.json({
      success: true,
      message: '获取流量统计成功',
      data: {
        response: {
          success: true,
          message: '获取流量统计成功'
        },
        totalUpload: rule.trafficUp || '0',
        totalDownload: rule.trafficDown || '0',
        dailyStats
      }
    });
  }),

  // 获取转发路径规则iptables配置
  http.get('/v1/forward-path-rules/:id/iptables', ({ params }) => {
    const id = params.id as string;
    const rule = mockForwardPathRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    // 模拟iptables配置
    const iptablesConfigs = [
      {
        id: '1',
        serverId: rule.egressId,
        serverName: rule.egressName,
        configType: 'FORWARD',
        rules: [
          'iptables -t nat -A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.100:80',
          'iptables -t nat -A POSTROUTING -p tcp -d 192.168.1.100 --dport 80 -j MASQUERADE'
        ],
        status: 'ACTIVE',
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt
      }
    ];

    return HttpResponse.json({
      success: true,
      message: '获取iptables配置成功',
      data: {
        status: {
          success: true,
          message: '获取iptables配置成功'
        },
        data: iptablesConfigs
      }
    });
  }),

  // 重建转发路径规则iptables配置
  http.post('/v1/forward-path-rules/:ruleId/iptables/rebuild', async ({ params, request }) => {
    const ruleId = params.ruleId as string;
    const body = await request.json() as { forceRebuild?: boolean; backupExisting?: boolean };
    
    const rule = mockForwardPathRules.find(r => r.id === ruleId);

    if (!rule) {
      return HttpResponse.json({
        success: false,
        message: '转发路径规则不存在',
        errorCode: 'RULE_NOT_FOUND'
      }, { status: 404 });
    }

    // 模拟重建任务
    const rebuildTask = {
      taskId: `rebuild-${Date.now()}`,
      ruleId,
      status: 'COMPLETED',
      forceRebuild: body.forceRebuild || false,
      backupExisting: body.backupExisting || false,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      affectedServers: rule.path?.map(p => p.serverId || '').concat([rule.egressId || '']) || []
    };

    return HttpResponse.json({
      success: true,
      message: 'iptables配置重建完成',
      data: {
        status: {
          success: true,
          message: 'iptables配置重建完成'
        },
        data: rebuildTask
      }
    });
  })
];
