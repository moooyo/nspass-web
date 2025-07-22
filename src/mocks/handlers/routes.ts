import { http, HttpResponse } from 'msw';
import { RouteItem, CreateRouteData, UpdateRouteData } from '@/services/routes';
import { RouteType, Protocol } from '@/types/generated/model/route';
import { mockCustomRoutes, mockSystemRoutes, mockConfigs } from '@/mocks/data/routes';

// 创建可变的mock数据副本
let customRoutes = [...mockCustomRoutes];
let systemRoutes = [...mockSystemRoutes];
let nextId = 200;

// 获取指定类型的线路
function getRoutesByType(type?: string): RouteItem[] {
  if (type === RouteType.ROUTE_TYPE_CUSTOM) {
    return customRoutes;
  } else if (type === RouteType.ROUTE_TYPE_SYSTEM) {
    return systemRoutes;
  }
  return [...customRoutes, ...systemRoutes];
}

// 查找线路（从所有线路中查找）
function findRoute(id: string | number): RouteItem | undefined {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  return [...customRoutes, ...systemRoutes].find(r => r.id === numId);
}

export const routeHandlers = [
  // 获取线路列表 - 匹配swagger接口 GET /v1/routes
  http.get('/v1/routes', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('pagination.page') || '1');
    const pageSize = parseInt(url.searchParams.get('pagination.pageSize') || '10');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const protocol = url.searchParams.get('protocol');

    let filteredRoutes = getRoutesByType(type || undefined);

    // 按状态筛选
    if (status && status !== 'ROUTE_STATUS_UNSPECIFIED') {
      // 这里可以添加状态筛选逻辑
      // filteredRoutes = filteredRoutes.filter(route => route.status === status);
    }

    // 按协议筛选
    if (protocol && protocol !== 'PROTOCOL_UNSPECIFIED') {
      filteredRoutes = filteredRoutes.filter(route => route.protocol === protocol);
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRoutes = filteredRoutes.slice(start, end);

    return HttpResponse.json({
      success: true,
      message: '获取线路列表成功',
      data: paginatedRoutes,
      pagination: {
        current: page,
        pageSize,
        total: filteredRoutes.length,
        totalPages: Math.ceil(filteredRoutes.length / pageSize)
      }
    });
  }),

  // 创建线路 - 匹配swagger接口 POST /v1/routes
  http.post('/v1/routes', async ({ request }) => {
    const body = await request.json() as CreateRouteData;

    // 验证必填字段
    if (!body.routeName || !body.entryPoint || !body.protocol || !body.protocolParams) {
      return HttpResponse.json({
        success: false,
        message: '缺少必填字段：线路名称、入口地址、协议、协议参数为必填项',
        errorCode: 'INVALID_INPUT'
      }, { status: 400 });
    }

    // 验证协议参数
    if (body.protocol === Protocol.PROTOCOL_SHADOWSOCKS && !body.protocolParams.shadowsocks?.password) {
      return HttpResponse.json({
        success: false,
        message: 'Shadowsocks协议需要密码参数',
        errorCode: 'INVALID_INPUT'
      }, { status: 400 });
    }

    if (body.protocol === Protocol.PROTOCOL_SNELL && !body.protocolParams.snell?.psk) {
      return HttpResponse.json({
        success: false,
        message: 'Snell协议需要PSK参数',
        errorCode: 'INVALID_INPUT'
      }, { status: 400 });
    }

    const newRoute: RouteItem = {
      id: nextId,
      routeName: body.routeName,
      entryPoint: body.entryPoint,
      port: body.port || (body.protocol === Protocol.PROTOCOL_SHADOWSOCKS ? 8388 : 6333),
      protocol: body.protocol,
      protocolParams: body.protocolParams,
      description: body.description,
      metadata: body.metadata,
    };

    customRoutes.push(newRoute);
    nextId++;

    return HttpResponse.json({
      success: true,
      message: '线路创建成功',
      data: newRoute
    });
  }),

  // 获取单个线路 - 匹配swagger接口 GET /v1/routes/{id}
  http.get('/v1/routes/:id', ({ params }) => {
    const id = params.id as string;
    const route = findRoute(id);

    if (!route) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      message: '获取线路成功',
      data: route
    });
  }),

  // 更新线路 - 匹配swagger接口 PUT /v1/routes/{id}
  http.put('/v1/routes/:id', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json() as UpdateRouteData;
    
    // 只能更新自定义线路
    const routeIndex = customRoutes.findIndex(r => r.id === parseInt(id));

    if (routeIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在或不允许编辑',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    // 更新线路
    const route = customRoutes[routeIndex];
    Object.assign(route, body);

    return HttpResponse.json({
      success: true,
      message: '线路更新成功',
      data: route
    });
  }),

  // 删除线路 - 匹配swagger接口 DELETE /v1/routes/{id}
  http.delete('/v1/routes/:id', ({ params }) => {
    const id = params.id as string;
    
    // 只能删除自定义线路
    const routeIndex = customRoutes.findIndex(r => r.id === parseInt(id));

    if (routeIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在或不允许删除',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    const deletedRoute = customRoutes.splice(routeIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      message: `线路 ${deletedRoute.routeName} 删除成功`
    });
  }),

  // 批量删除线路 - 匹配swagger接口 POST /v1/routes/batch/delete
  http.post('/v1/routes/batch/delete', async ({ request }) => {
    const body = await request.json() as { ids: number[] };
    let deletedCount = 0;
    const deletedRoutes: string[] = [];

    body.ids.forEach(id => {
      const index = customRoutes.findIndex(r => r.id === id);
      if (index !== -1) {
        const deletedRoute = customRoutes.splice(index, 1)[0];
        deletedRoutes.push(deletedRoute.routeName ?? 'Unknown Route');
        deletedCount++;
      }
    });

    return HttpResponse.json({
      success: true,
      message: `成功删除 ${deletedCount} 个线路: ${deletedRoutes.join(', ')}`
    });
  }),

  // 批量更新线路状态 - 匹配swagger接口 POST /v1/routes/batch/status
  http.post('/v1/routes/batch/status', async ({ request }) => {
    const body = await request.json() as { ids: number[]; status: string };
    const updatedRoutes: RouteItem[] = [];

    body.ids.forEach(id => {
      const index = customRoutes.findIndex(r => r.id === id);
      if (index !== -1) {
        // 这里可以添加状态更新逻辑
        // customRoutes[index].status = body.status;
        updatedRoutes.push(customRoutes[index]);
      }
    });

    return HttpResponse.json({
      success: true,
      message: `成功更新 ${updatedRoutes.length} 个线路状态`,
      data: updatedRoutes
    });
  }),

  // 搜索线路 - 匹配swagger接口 GET /v1/routes/search
  http.get('/v1/routes/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const fields = url.searchParams.getAll('fields');
    const page = parseInt(url.searchParams.get('pagination.page') || '1');
    const pageSize = parseInt(url.searchParams.get('pagination.pageSize') || '10');
    const type = url.searchParams.get('type');

    let filteredRoutes = getRoutesByType(type || undefined);

    // 搜索逻辑
    if (query && query.trim()) {
      const searchQuery = query.toLowerCase();
      filteredRoutes = filteredRoutes.filter(route => {
        const searchTarget = fields.length > 0 ? fields : ['routeName', 'entryPoint'];
        return searchTarget.some(field => {
          const value = route[field as keyof RouteItem];
          return value !== undefined && value !== null && String(value).toLowerCase().includes(searchQuery);
        });
      });
    }

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRoutes = filteredRoutes.slice(start, end);

    return HttpResponse.json({
      success: true,
      message: '搜索完成',
      data: paginatedRoutes,
      pagination: {
        current: page,
        pageSize,
        total: filteredRoutes.length,
        totalPages: Math.ceil(filteredRoutes.length / pageSize)
      }
    });
  }),

  // 生成线路配置 - 匹配swagger接口 GET /v1/routes/{id}/config
  http.get('/v1/routes/:id/config', ({ params, request }) => {
    const id = params.id as string;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const route = findRoute(id);

    if (!route) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    let config = '';

    try {
      if (route.protocol && (route.protocol === Protocol.PROTOCOL_SHADOWSOCKS || route.protocol === Protocol.PROTOCOL_SNELL)) {
        const protocolConfigs = mockConfigs[route.protocol];
        if (protocolConfigs) {
          const configFunc = protocolConfigs[format as keyof typeof protocolConfigs];
          if (configFunc) {
            config = configFunc(route);
          }
        }
      }

      if (!config) {
        return HttpResponse.json({
          success: false,
          message: `不支持的配置格式: ${format}`,
          errorCode: 'UNSUPPORTED_FORMAT'
        }, { status: 400 });
      }

      return HttpResponse.json({
        success: true,
        message: '配置生成成功',
        data: {
          config,
          format
        }
      });      } catch {
        return HttpResponse.json({
        success: false,
        message: '配置生成失败',
        errorCode: 'CONFIG_GENERATION_ERROR'
      }, { status: 500 });
    }
  }),

  // 更新线路状态 - 匹配swagger接口 PUT /v1/routes/{id}/status
  http.put('/v1/routes/:id/status', async ({ params, request }) => {
    const id = params.id as string;
    const _body = await request.json() as { status: string };
    
    const routeIndex = customRoutes.findIndex(r => r.id === parseInt(id));

    if (routeIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    // 这里可以添加状态更新逻辑
    // customRoutes[routeIndex].status = body.status;

    return HttpResponse.json({
      success: true,
      message: '线路状态更新成功',
      data: customRoutes[routeIndex]
    });
  }),

  // 验证线路连通性 - 匹配swagger接口 POST /v1/routes/{id}/validate
  http.post('/v1/routes/:id/validate', async ({ params, request }) => {
    const id = params.id as string;
    const _body = await request.json() as { timeoutSeconds?: number };
    const route = findRoute(id);

    if (!route) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    // 模拟连通性测试
    const isReachable = Math.random() > 0.2; // 80%的成功率
    const latencyMs = isReachable ? Math.floor(Math.random() * 300) + 20 : undefined;
    const errorMessage = isReachable ? undefined : '网络不可达或超时';

    // 模拟延迟（实际测试需要时间）
    await new Promise(resolve => setTimeout(resolve, 1000));

    return HttpResponse.json({
      success: true,
      message: '连通性测试完成',
      data: {
        isReachable,
        latencyMs,
        errorMessage
      }
    });
  }),

  // 重置mock数据（开发用）
  http.post('/v1/routes/reset-mock', () => {
    customRoutes = [...mockCustomRoutes];
    systemRoutes = [...mockSystemRoutes];
    nextId = 200;

    return HttpResponse.json({
      success: true,
      message: 'Mock数据已重置'
    });
  })
]; 