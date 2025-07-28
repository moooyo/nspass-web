import { http, HttpResponse } from 'msw';
import { RouteItem } from '@/services/routes';
import { RouteType, Protocol } from '@/types/generated/model/route';
import { mockSystemRoutes, mockConfigs } from '@/mocks/data/routes';

// 只保留系统线路数据
let systemRoutes = [...mockSystemRoutes];

// 获取指定类型的线路（仅系统线路）
function getRoutesByType(type?: string): RouteItem[] {
  if (type === RouteType.ROUTE_TYPE_SYSTEM || !type) {
    return systemRoutes;
  }
  return []; // 不再支持自定义线路
}

// 查找线路（仅从系统线路中查找）
function findRoute(id: string | number): RouteItem | undefined {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  return systemRoutes.find(r => r.id === numId);
}

export const routeHandlers = [
  // 获取线路列表 - 只返回系统线路
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

  // 获取单个线路 - 只支持系统线路
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

  // 搜索线路 - 只搜索系统线路
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

  // 生成线路配置 - 支持系统线路
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
      });
    } catch {
      return HttpResponse.json({
        success: false,
        message: '配置生成失败',
        errorCode: 'CONFIG_GENERATION_ERROR'
      }, { status: 500 });
    }
  }),

  // 验证线路连通性 - 支持系统线路
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

  // 不支持的操作 - 创建线路
  http.post('/v1/routes', () => {
    return HttpResponse.json({
      success: false,
      message: '不支持创建自定义线路，系统仅支持系统生成的线路',
      errorCode: 'OPERATION_NOT_SUPPORTED'
    }, { status: 403 });
  }),

  // 不支持的操作 - 更新线路
  http.put('/v1/routes/:id', () => {
    return HttpResponse.json({
      success: false,
      message: '不支持编辑线路，系统线路为只读',
      errorCode: 'OPERATION_NOT_SUPPORTED'
    }, { status: 403 });
  }),

  // 不支持的操作 - 删除线路
  http.delete('/v1/routes/:id', () => {
    return HttpResponse.json({
      success: false,
      message: '不支持删除线路，系统线路为只读',
      errorCode: 'OPERATION_NOT_SUPPORTED'
    }, { status: 403 });
  }),

  // 不支持的操作 - 批量删除线路
  http.post('/v1/routes/batch/delete', () => {
    return HttpResponse.json({
      success: false,
      message: '不支持批量删除线路，系统线路为只读',
      errorCode: 'OPERATION_NOT_SUPPORTED'
    }, { status: 403 });
  }),

  // 不支持的操作 - 批量更新线路状态
  http.post('/v1/routes/batch/status', () => {
    return HttpResponse.json({
      success: false,
      message: '不支持批量更新线路状态，系统线路为只读',
      errorCode: 'OPERATION_NOT_SUPPORTED'
    }, { status: 403 });
  }),

  // 不支持的操作 - 更新线路状态
  http.put('/v1/routes/:id/status', () => {
    return HttpResponse.json({
      success: false,
      message: '不支持更新线路状态，系统线路为只读',
      errorCode: 'OPERATION_NOT_SUPPORTED'
    }, { status: 403 });
  })
]; 