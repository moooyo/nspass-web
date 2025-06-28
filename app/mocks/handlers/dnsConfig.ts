import { http, HttpResponse } from 'msw';
import { mockDnsConfigs } from '@mock/data/dnsConfigs';

// 创建深拷贝函数
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 可变的数据源
let dnsConfigs = deepClone(mockDnsConfigs);

export const dnsConfigHandlers = [
  // 获取DNS配置列表
  http.get('/api/v1/dns/configs', ({ request }) => {
    const url = new URL(request.url);
    const configName = url.searchParams.get('configName');
    const provider = url.searchParams.get('provider');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    // 筛选数据
    let filteredConfigs = [...dnsConfigs];
    
    if (configName) {
      filteredConfigs = filteredConfigs.filter(config => 
        config.configName.toLowerCase().includes(configName.toLowerCase())
      );
    }
    
    if (provider) {
      filteredConfigs = filteredConfigs.filter(config => config.provider === provider);
    }

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedConfigs = filteredConfigs.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: paginatedConfigs,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: filteredConfigs.length,
      },
    };

    return HttpResponse.json(response);
  }),

  // 创建DNS配置
  http.post('/api/v1/dns/configs', async ({ request }) => {
    const body = await request.json() as any;
    
    const newConfig = {
      id: Math.max(...dnsConfigs.map(c => Number(c.id))) + 1,
      configName: body.configName,
      provider: body.provider,
      domain: body.domain,
      configParams: body.configParams,
      createdAt: new Date().toISOString(),
    };

    dnsConfigs.push(newConfig);

    return HttpResponse.json({
      success: true,
      data: newConfig,
    });
  }),

  // 更新DNS配置
  http.put('/api/v1/dns/configs/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json() as any;
    
    const configIndex = dnsConfigs.findIndex(config => Number(config.id) === id);
    
    if (configIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: 'DNS配置不存在',
      }, { status: 404 });
    }

    // 更新配置
    const updatedConfig = {
      ...dnsConfigs[configIndex],
      ...body,
    };
    
    dnsConfigs[configIndex] = updatedConfig;

    return HttpResponse.json({
      success: true,
      data: updatedConfig,
    });
  }),

  // 删除DNS配置
  http.delete('/api/v1/dns/configs/:id', ({ params }) => {
    const id = Number(params.id);
    
    const configIndex = dnsConfigs.findIndex(config => Number(config.id) === id);
    
    if (configIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: 'DNS配置不存在',
      }, { status: 404 });
    }

    dnsConfigs.splice(configIndex, 1);

    return HttpResponse.json({
      success: true,
      data: true,
    });
  }),

  // 测试DNS配置
  http.post('/api/v1/dns/configs/:id/test', ({ params }) => {
    const id = Number(params.id);
    
    const config = dnsConfigs.find(config => Number(config.id) === id);
    
    if (!config) {
      return HttpResponse.json({
        success: false,
        message: 'DNS配置不存在',
      }, { status: 404 });
    }

    // 模拟测试逻辑，这里简单返回成功
    return HttpResponse.json({
      success: true,
      data: true,
      message: 'DNS配置测试成功',
    });
  }),
]; 