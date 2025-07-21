import { http, HttpResponse } from 'msw';
import { 
  getIptablesConfigsByServerId,
  getIptablesServerOverview,
  getIptablesGeneratedRules,
  getIptablesScript,
  getIptablesConfigInfo,
  type IptablesConfig
} from '../data/iptables';

export const iptablesHandlers = [
  // 获取服务器 iptables 配置列表 - 支持分页和过滤
  http.get('/v1/servers/:serverId/iptables/configs', ({ params, request }) => {
    const { serverId } = params;
    const url = new URL(request.url);
    
    // 获取查询参数
    const tableType = url.searchParams.get('tableType');
    const chainType = url.searchParams.get('chainType');
    const protocol = url.searchParams.get('protocol');
    const isEnabled = url.searchParams.get('isEnabled');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    
    console.log(`[IPTABLES MOCK] 获取服务器 ${serverId} 的 iptables 配置，过滤条件:`, {
      tableType, chainType, protocol, isEnabled, page, pageSize
    });
    
    let configs = getIptablesConfigsByServerId(serverId as string);
    
    // 应用过滤条件
    if (tableType && tableType !== 'IPTABLES_TABLE_TYPE_UNSPECIFIED') {
      const filterTable = tableType.replace('IPTABLES_TABLE_TYPE_', '').toLowerCase();
      configs = configs.filter((config: IptablesConfig) => config.tableName === filterTable);
    }
    
    if (chainType && chainType !== 'IPTABLES_CHAIN_TYPE_UNSPECIFIED') {
      const filterChain = chainType.replace('IPTABLES_CHAIN_TYPE_', '');
      configs = configs.filter((config: IptablesConfig) => config.chainName?.toUpperCase() === filterChain);
    }
    
    if (protocol && protocol !== 'IPTABLES_PROTOCOL_UNSPECIFIED') {
      const filterProtocol = protocol.replace('IPTABLES_PROTOCOL_', '').toLowerCase();
      if (filterProtocol !== 'all') {
        configs = configs.filter((config: IptablesConfig) => config.protocol === filterProtocol);
      }
    }
    
    if (isEnabled !== null && isEnabled !== undefined) {
      const enabledFilter = isEnabled === 'true';
      configs = configs.filter((config: IptablesConfig) => config.isEnabled === enabledFilter);
    }
    
    // 应用分页
    const total = configs.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedConfigs = configs.slice(startIndex, endIndex);
    
    return HttpResponse.json({
      status: {
        success: true,
        message: '', // 获取操作成功时不返回消息
        code: 'SUCCESS'
      },
      data: paginatedConfigs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    });
  }),

  // 获取单个 iptables 配置
  http.get('/v1/servers/:serverId/iptables/configs/:configId', ({ params }) => {
    const { serverId, configId } = params;
    
    console.log(`[IPTABLES MOCK] 获取服务器 ${serverId} 的配置 ${configId}`);
    
    const configs = getIptablesConfigsByServerId(serverId as string);
    const config = configs.find((c: IptablesConfig) => c.id?.toString() === configId);
    
    if (!config) {
      return HttpResponse.json({
        status: {
          success: false,
          message: `配置 ${configId} 不存在`,
          code: 'NOT_FOUND'
        }
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      status: {
        success: true,
        message: '', // 获取操作成功时不返回消息
        code: 'SUCCESS'
      },
      data: config
    });
  }),

  // 获取服务器 iptables 概览
  http.get('/v1/servers/:serverId/iptables/overview', ({ params }) => {
    const { serverId } = params;
    
    console.log(`[IPTABLES MOCK] 获取服务器 ${serverId} 的 iptables 概览`);
    
    const overview = getIptablesServerOverview(serverId as string);
    
    return HttpResponse.json({
      status: {
        success: true,
        message: '',
        code: 'SUCCESS'
      },
      data: overview
    });
  }),

  // 获取服务器 iptables 生成的规则
  http.get('/v1/servers/:serverId/iptables/rules', ({ params, request }) => {
    const { serverId } = params;
    const url = new URL(request.url);
    const onlyEnabled = url.searchParams.get('onlyEnabled') === 'true';
    
    console.log(`[IPTABLES MOCK] 获取服务器 ${serverId} 的 iptables 规则，仅启用: ${onlyEnabled}`);
    
    const rules = getIptablesGeneratedRules(serverId as string, onlyEnabled);
    const totalRules = rules.length;
    const validRules = rules.filter(rule => rule.isValid).length;
    const invalidRules = totalRules - validRules;
    
    return HttpResponse.json({
      status: {
        success: true,
        message: '',
        code: 'SUCCESS'
      },
      data: rules,
      totalRules,
      validRules,
      invalidRules
    });
  }),

  // 获取服务器 iptables 脚本
  http.get('/v1/servers/:serverId/iptables/script', ({ params, request }) => {
    const { serverId } = params;
    const url = new URL(request.url);
    const onlyEnabled = url.searchParams.get('onlyEnabled') === 'true';
    const format = url.searchParams.get('format') || 'shell';
    
    console.log(`[IPTABLES MOCK] 获取服务器 ${serverId} 的 iptables 脚本，仅启用: ${onlyEnabled}，格式: ${format}`);
    
    const script = getIptablesScript(serverId as string, onlyEnabled, format);
    
    return HttpResponse.json({
      status: {
        success: true,
        message: '',
        code: 'SUCCESS'
      },
      data: script
    });
  }),

  // 获取转发路径规则iptables配置（兼容旧API）
  http.get('/v1/forward-path-rules/:id/iptables', ({ params }) => {
    const { id } = params;
    
    console.log(`[IPTABLES MOCK] 获取转发路径规则 ${id} 的 iptables 配置`);
    
    // 模拟返回一些配置信息
    const iptablesConfigs = getIptablesConfigInfo('server-1');
    
    return HttpResponse.json({
      status: {
        success: true,
        message: '获取iptables配置成功',
        code: 'SUCCESS'
      },
      data: iptablesConfigs.slice(0, 2) // 返回前两个配置
    });
  }),
];
