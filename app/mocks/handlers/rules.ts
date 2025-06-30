import { http, HttpResponse } from 'msw';
import type {
  ForwardRule,
  CreateRuleRequest,
  UpdateRuleRequest,
  RuleTrafficStats
} from '@/types/generated/api/rules/rule_management';
import {
  ForwardRuleType,
  EgressMode,
  RuleStatus
} from '@/types/generated/api/rules/rule_management';

// 模拟规则数据
const mockRules: ForwardRule[] = [
  {
    id: 1,
    userId: 1,
    serverId: 1,
    name: 'HTTP代理规则',
    egressMode: EgressMode.EGRESS_MODE_PROXY,
    type: ForwardRuleType.FORWARD_RULE_TYPE_HTTP,
    sourcePort: 8080,
    targetAddress: 'example.com',
    targetPort: 80,
    password: 'password123',
    supportUDP: false,
    status: RuleStatus.RULE_STATUS_ACTIVE,
    createTime: '2024-01-01T00:00:00Z',
    updateTime: '2024-01-07T10:00:00Z',
    uploadTraffic: 1250.8,
    downloadTraffic: 2467.3
  },
  {
    id: 2,
    userId: 1,
    serverId: 2,
    name: 'SOCKS5代理',
    egressMode: EgressMode.EGRESS_MODE_DIRECT,
    type: ForwardRuleType.FORWARD_RULE_TYPE_TCP,
    sourcePort: 1080,
    targetAddress: '192.168.1.100',
    targetPort: 1080,
    password: 'socks123',
    supportUDP: true,
    status: RuleStatus.RULE_STATUS_ACTIVE,
    createTime: '2024-01-02T00:00:00Z',
    updateTime: '2024-01-06T15:30:00Z',
    uploadTraffic: 856.4,
    downloadTraffic: 1923.7
  },
  {
    id: 3,
    userId: 1,
    serverId: 1,
    name: 'UDP转发规则',
    egressMode: EgressMode.EGRESS_MODE_DIRECT,
    type: ForwardRuleType.FORWARD_RULE_TYPE_UDP,
    sourcePort: 53,
    targetAddress: '8.8.8.8',
    targetPort: 53,
    password: '',
    supportUDP: true,
    status: RuleStatus.RULE_STATUS_INACTIVE,
    createTime: '2024-01-03T00:00:00Z',
    updateTime: '2024-01-05T12:00:00Z',
    uploadTraffic: 45.2,
    downloadTraffic: 89.6
  }
];

let nextId = 4;

export const rulesHandlers = [
  // 获取规则列表
  http.get('/v1/rules', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const name = url.searchParams.get('name');
    const status = url.searchParams.get('status');

    let filteredRules = mockRules;

    // 按名称筛选
    if (name) {
      filteredRules = filteredRules.filter(rule => 
        rule.name?.toLowerCase().includes(name.toLowerCase())
      );
    }

    // 按状态筛选
    if (status) {
      const statusValue = parseInt(status) as unknown as RuleStatus;
      filteredRules = filteredRules.filter(rule => rule.status === statusValue);
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRules = filteredRules.slice(start, end);

    return HttpResponse.json({
      result: { success: true, message: '获取规则列表成功' },
      data: paginatedRules,
      pagination: {
        total: filteredRules.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredRules.length / pageSize)
      }
    });
  }),

  // 创建规则
  http.post('/v1/rules', async ({ request }) => {
    const body = await request.json() as CreateRuleRequest;

    // 验证必填字段
    if (!body.name || !body.sourcePort || !body.targetAddress || !body.targetPort || !body.serverId) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '缺少必填字段',
          errorCode: 'INVALID_INPUT'
        }
      }, { status: 400 });
    }

    // 检查端口冲突
    const existingRule = mockRules.find(rule => rule.sourcePort === body.sourcePort);
    if (existingRule) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '源端口已被使用',
          errorCode: 'PORT_CONFLICT'
        }
      }, { status: 409 });
    }

    const newRule: ForwardRule = {
      id: nextId++,
      userId: 1,
      serverId: body.serverId,
      name: body.name,
      egressMode: body.egressMode || EgressMode.EGRESS_MODE_DIRECT,
      type: body.type || ForwardRuleType.FORWARD_RULE_TYPE_TCP,
      sourcePort: body.sourcePort,
      targetAddress: body.targetAddress,
      targetPort: body.targetPort,
      password: body.password || '',
      supportUDP: body.supportUDP || false,
      status: RuleStatus.RULE_STATUS_ACTIVE,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      uploadTraffic: 0,
      downloadTraffic: 0
    };

    mockRules.push(newRule);

    return HttpResponse.json({
      result: { success: true, message: '规则创建成功' },
      data: newRule
    });
  }),

  // 获取单个规则
  http.get('/v1/rules/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const rule = mockRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '规则不存在',
          errorCode: 'RULE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    return HttpResponse.json({
      result: { success: true, message: '获取规则成功' },
      data: rule
    });
  }),

  // 更新规则
  http.put('/v1/rules/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as UpdateRuleRequest;
    const ruleIndex = mockRules.findIndex(r => r.id === id);

    if (ruleIndex === -1) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '规则不存在',
          errorCode: 'RULE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // 更新规则
    const rule = mockRules[ruleIndex];
    Object.assign(rule, {
      ...body,
      updateTime: new Date().toISOString()
    });

    return HttpResponse.json({
      result: { success: true, message: '规则更新成功' },
      data: rule
    });
  }),

  // 删除规则
  http.delete('/v1/rules/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const ruleIndex = mockRules.findIndex(r => r.id === id);

    if (ruleIndex === -1) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '规则不存在',
          errorCode: 'RULE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    mockRules.splice(ruleIndex, 1);

    return HttpResponse.json({
      result: { success: true, message: '规则删除成功' }
    });
  }),

  // 批量删除规则
  http.post('/v1/rules/batch-delete', async ({ request }) => {
    const body = await request.json() as { ids: number[] };
    let deletedCount = 0;

    body.ids.forEach(id => {
      const index = mockRules.findIndex(r => r.id === id);
      if (index !== -1) {
        mockRules.splice(index, 1);
        deletedCount++;
      }
    });

    return HttpResponse.json({
      result: { success: true, message: `成功删除 ${deletedCount} 个规则` },
      deletedCount
    });
  }),

  // 启用/禁用规则
  http.post('/v1/rules/:id/toggle', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { enabled: boolean };
    const rule = mockRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '规则不存在',
          errorCode: 'RULE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    rule.status = body.enabled ? RuleStatus.RULE_STATUS_ACTIVE : RuleStatus.RULE_STATUS_INACTIVE;
    rule.updateTime = new Date().toISOString();

    return HttpResponse.json({
      result: { success: true, message: `规则已${body.enabled ? '启用' : '禁用'}` },
      data: rule
    });
  }),

  // 获取规则流量统计
  http.get('/v1/rules/:id/traffic-stats', ({ params, request }) => {
    const id = parseInt(params.id as string);
    const rule = mockRules.find(r => r.id === id);

    if (!rule) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '规则不存在',
          errorCode: 'RULE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    // 生成模拟的每日统计数据
    const dailyStats = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      upload: Math.random() * 100 + 10,
      download: Math.random() * 200 + 20
    }));

    const trafficStats: RuleTrafficStats = {
      ruleId: rule.id,
      ruleName: rule.name,
      uploadTraffic: rule.uploadTraffic || 0,
      downloadTraffic: rule.downloadTraffic || 0,
      totalTraffic: (rule.uploadTraffic || 0) + (rule.downloadTraffic || 0),
      dailyStats
    };

    return HttpResponse.json({
      result: { success: true, message: '获取流量统计成功' },
      data: trafficStats
    });
  })
]; 