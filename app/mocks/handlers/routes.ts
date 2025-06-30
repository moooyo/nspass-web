import { http, HttpResponse } from 'msw';
import { RouteItem, CreateRouteData, UpdateRouteData } from '@/services/routes';
import { RouteType } from '@/types/generated/model/route';
import { mockCustomRoutes, mockSystemRoutes, mockAllRoutes, mockConfigs } from '@/mocks/data/routes';

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
function findRoute(id: string): RouteItem | undefined {
  return [...customRoutes, ...systemRoutes].find(r => r.id === id || r.routeId === id);
}

export const routeHandlers = [
  // 获取线路列表
  http.get('/api/routes', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const routeId = url.searchParams.get('routeId');
    const routeName = url.searchParams.get('routeName');
    const type = url.searchParams.get('type');
    const protocol = url.searchParams.get('protocol');

    let filteredRoutes = getRoutesByType(type || undefined);

    // 按线路ID筛选
    if (routeId) {
      filteredRoutes = filteredRoutes.filter(route => 
        route.routeId.toLowerCase().includes(routeId.toLowerCase())
      );
    }

    // 按线路名筛选
    if (routeName) {
      filteredRoutes = filteredRoutes.filter(route => 
        route.routeName.toLowerCase().includes(routeName.toLowerCase())
      );
    }

    // 按协议筛选
    if (protocol) {
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
      total: filteredRoutes.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredRoutes.length / pageSize)
    });
  }),

  // 创建线路
  http.post('/api/routes', async ({ request }) => {
    const body = await request.json() as CreateRouteData;

    // 验证必填字段
    if (!body.routeName || !body.entryPoint || !body.protocol || !body.password) {
      return HttpResponse.json({
        success: false,
        message: '缺少必填字段：线路名称、入口地址、协议、密码为必填项',
        errorCode: 'INVALID_INPUT'
      }, { status: 400 });
    }

    // 检查线路ID冲突
    if (body.routeId) {
      const existingRoute = findRoute(body.routeId);
      if (existingRoute) {
        return HttpResponse.json({
          success: false,
          message: '线路ID已被使用',
          errorCode: 'ROUTE_ID_CONFLICT'
        }, { status: 409 });
      }
    }

    // 生成线路ID（如果没有提供）
    const routeId = body.routeId || `route${nextId.toString().padStart(3, '0')}`;

    const newRoute: RouteItem = {
      id: nextId.toString(),
      routeId,
      routeName: body.routeName,
      entryPoint: body.entryPoint,
      protocol: body.protocol,
      udpSupport: body.udpSupport || false,
      tcpFastOpen: body.tcpFastOpen || false,
      password: body.password,
      otherParams: body.otherParams || '{}',
      port: body.port || (body.protocol === 'shadowsocks' ? '8388' : '6333'),
      method: body.method,
      snellVersion: body.snellVersion,
    };

    customRoutes.push(newRoute);
    nextId++;

    return HttpResponse.json({
      success: true,
      message: '线路创建成功',
      data: newRoute
    });
  }),

  // 获取单个线路
  http.get('/api/routes/:id', ({ params }) => {
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

  // 更新线路
  http.put('/api/routes/:id', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json() as UpdateRouteData;
    
    // 只能更新自定义线路
    const routeIndex = customRoutes.findIndex(r => r.id === id || r.routeId === id);

    if (routeIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在或不允许编辑',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    // 检查新的线路ID是否冲突
    if (body.routeId && body.routeId !== customRoutes[routeIndex].routeId) {
      const existingRoute = findRoute(body.routeId);
      if (existingRoute) {
        return HttpResponse.json({
          success: false,
          message: '线路ID已被使用',
          errorCode: 'ROUTE_ID_CONFLICT'
        }, { status: 409 });
      }
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

  // 删除线路
  http.delete('/api/routes/:id', ({ params }) => {
    const id = params.id as string;
    
    // 只能删除自定义线路
    const routeIndex = customRoutes.findIndex(r => r.id === id || r.routeId === id);

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

  // 批量删除线路
  http.post('/api/routes/batch-delete', async ({ request }) => {
    const body = await request.json() as { ids: string[] };
    let deletedCount = 0;
    const deletedRoutes: string[] = [];

    body.ids.forEach(id => {
      const index = customRoutes.findIndex(r => r.id === id || r.routeId === id);
      if (index !== -1) {
        const deletedRoute = customRoutes.splice(index, 1)[0];
        deletedRoutes.push(deletedRoute.routeName);
        deletedCount++;
      }
    });

    return HttpResponse.json({
      success: true,
      message: `成功删除 ${deletedCount} 个线路: ${deletedRoutes.join(', ')}`
    });
  }),

  // 测试线路连接
  http.post('/api/routes/:id/test', ({ params }) => {
    const id = params.id as string;
    const route = findRoute(id);

    if (!route) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    // 模拟测试结果
    const isReachable = Math.random() > 0.3; // 70%的成功率
    const latency = isReachable ? Math.floor(Math.random() * 200) + 50 : 0; // 50-250ms延迟

    return HttpResponse.json({
      success: true,
      message: '测试完成',
      data: {
        success: isReachable,
        latency,
        error: isReachable ? undefined : '连接超时'
      }
    });
  }),

  // 生成线路配置
  http.post('/api/routes/:id/config', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json() as { format: string };
    const route = findRoute(id);

    if (!route) {
      return HttpResponse.json({
        success: false,
        message: '线路不存在',
        errorCode: 'ROUTE_NOT_FOUND'
      }, { status: 404 });
    }

    const format = body.format || 'json';
    let config = '';

    try {
      if (route.protocol === 'shadowsocks') {
        config = mockConfigs.shadowsocks[format as keyof typeof mockConfigs.shadowsocks]?.(route) || '';
      } else if (route.protocol === 'snell') {
        config = mockConfigs.snell[format as keyof typeof mockConfigs.snell]?.(route) || '';
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
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        message: '配置生成失败',
        errorCode: 'CONFIG_GENERATION_ERROR'
      }, { status: 500 });
    }
  }),

  // 验证线路连通性
  http.post('/api/routes/:id/connectivity', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json() as { timeoutSeconds?: number };
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
  http.post('/api/routes/reset-mock', () => {
    customRoutes = [...mockCustomRoutes];
    systemRoutes = [...mockSystemRoutes];
    nextId = 200;

    return HttpResponse.json({
      success: true,
      message: 'Mock数据已重置'
    });
  })
]; 