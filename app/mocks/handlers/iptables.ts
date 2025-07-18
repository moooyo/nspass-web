import { http, HttpResponse } from 'msw';
import { 
  // mockIptablesConfigs, 
  getIptablesConfigsByServerId,
  // getIptablesStats,
  type IptablesConfig
} from '../data/iptables';

// 生成 iptables 命令的辅助函数
const _generateIptablesCommand = (config: IptablesConfig): string => {
  const { tableName, chainName, ruleAction, sourceIp, sourcePort, destIp, destPort, protocol, interface: iface } = config;
  
  let command = `iptables`;
  if (tableName !== 'filter') {
    command += ` -t ${tableName}`;
  }
  command += ` -A ${chainName}`;
  
  if (protocol) {
    command += ` -p ${protocol}`;
  }
  if (sourceIp) {
    command += ` -s ${sourceIp}`;
  }
  if (sourcePort) {
    command += ` --sport ${sourcePort}`;
  }
  if (destIp) {
    command += ` -d ${destIp}`;
  }
  if (destPort) {
    command += ` --dport ${destPort}`;
  }
  if (iface) {
    if (chainName === 'INPUT' || chainName === 'FORWARD') {
      command += ` -i ${iface}`;
    } else if (chainName === 'OUTPUT' || chainName === 'POSTROUTING') {
      command += ` -o ${iface}`;
    }
  }
  
  command += ` -j ${ruleAction}`;
  
  if (ruleAction === 'DNAT' && destIp) {
    command += ` --to-destination ${destIp}`;
    if (destPort && destPort !== '80' && destPort !== '443') {
      command += `:${destPort}`;
    }
  }
  
  return command;
};

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
      configs = configs.filter((config: IptablesConfig) => config.chainName.toUpperCase() === filterChain);
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
  http.get('/v1/servers/:serverId/iptables/configs/:configName', ({ params }) => {
    const { serverId, configName } = params;
    
    console.log(`[IPTABLES MOCK] 获取服务器 ${serverId} 的配置 ${configName}`);
    
    const configs = getIptablesConfigsByServerId(serverId as string);
    const config = configs.find((c: IptablesConfig) => c.configName === configName);
    
    if (!config) {
      return HttpResponse.json({
        status: {
          success: false,
          message: `配置 ${configName} 不存在`,
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
  })
];
