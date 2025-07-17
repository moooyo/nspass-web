import { http, HttpResponse } from 'msw';
import { 
  // mockIptablesConfigs, 
  mockIptablesRebuildTasks,
  getIptablesConfigsByServerId,
  generateIptablesRebuildTask,
  // getIptablesStats,
  type IptablesConfig,
  type IptablesRebuildTask
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

// 用于追踪任务状态的全局变量
const runningTasks = new Map<string, NodeJS.Timeout>();

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
  }),

  // 重建服务器 iptables 配置 - 更新 URL
  http.post('/v1/servers/:serverId/iptables/rebuild', async ({ params, request }) => {
    const { serverId } = params;
    const body = await request.json() as { force?: boolean; dryRun?: boolean };
    
    console.log(`[IPTABLES MOCK] 启动服务器 ${serverId} 的 iptables 重建任务`, body);
    
    const task = generateIptablesRebuildTask(serverId as string);
    
    console.log(`[IPTABLES MOCK] 创建重建任务: ${task.taskId}`);
    
    // 模拟异步更新任务状态
    setTimeout(() => {
      task.status = 'IPTABLES_REBUILD_STATUS_RUNNING';
      task.processedRules = Math.floor(task.totalRules * 0.3);
      console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 进入运行状态，处理进度: ${task.processedRules}/${task.totalRules}`);
    }, 1000);
    
    setTimeout(() => {
      task.processedRules = Math.floor(task.totalRules * 0.7);
      console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 处理进度更新: ${task.processedRules}/${task.totalRules}`);
    }, 2000);
    
    const taskUpdateTimeout3 = setTimeout(() => {
      // 90% 概率成功，10% 概率失败
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        task.status = 'IPTABLES_REBUILD_STATUS_SUCCESS';
        task.processedRules = task.totalRules;
        task.failedRules = 0;
        task.completedAt = Math.floor(Date.now() / 1000).toString();
        console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 成功完成`);
      } else {
        task.status = 'IPTABLES_REBUILD_STATUS_FAILED';
        task.processedRules = task.totalRules - 1;
        task.failedRules = 1;
        task.errorMessage = '模拟错误：规则执行失败，可能存在端口冲突';
        task.completedAt = Math.floor(Date.now() / 1000).toString();
        console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 执行失败:`, task.errorMessage);
      }
      
      // 清理定时器
      runningTasks.delete(task.taskId);
    }, 4000);
    
    // 保存定时器引用
    runningTasks.set(task.taskId, taskUpdateTimeout3);
    
    return HttpResponse.json({
      status: {
        success: true,
        message: `重建任务已启动，任务ID: ${task.taskId}`,
        code: 'SUCCESS'
      },
      data: task
    });
  }),

  // 获取重建任务状态
  http.get('/v1/iptables/rebuild-tasks/:taskId', ({ params }) => {
    const { taskId } = params;
    
    console.log(`[IPTABLES MOCK] 获取重建任务状态: ${taskId}`);
    
    const task = mockIptablesRebuildTasks.find((t: IptablesRebuildTask) => t.taskId === taskId);
    
    if (!task) {
      return HttpResponse.json({
        status: {
          success: false,
          message: `任务 ${taskId} 不存在`,
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
      data: task
    });
  }),

  // 批量重建多个服务器 iptables 配置
  http.post('/v1/iptables/batch-rebuild', async ({ request }) => {
    const body = await request.json() as { serverIds: string[]; force?: boolean; dryRun?: boolean };
    
    console.log(`[IPTABLES MOCK] 批量重建 iptables 配置`, body);
    
    const tasks = body.serverIds.map(serverId => generateIptablesRebuildTask(serverId));
    
    // 模拟批量任务的进度更新
    tasks.forEach(task => {
      setTimeout(() => {
        task.status = 'IPTABLES_REBUILD_STATUS_RUNNING';
        task.processedRules = Math.floor(task.totalRules * 0.5);
      }, Math.random() * 2000 + 1000);
      
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% 成功率
        if (isSuccess) {
          task.status = 'IPTABLES_REBUILD_STATUS_SUCCESS';
          task.processedRules = task.totalRules;
          task.completedAt = Math.floor(Date.now() / 1000).toString();
        } else {
          task.status = 'IPTABLES_REBUILD_STATUS_FAILED';
          task.failedRules = 1;
          task.errorMessage = '批量重建过程中出现错误';
          task.completedAt = Math.floor(Date.now() / 1000).toString();
        }
      }, Math.random() * 3000 + 3000);
    });
    
    return HttpResponse.json({
      status: {
        success: true,
        message: `批量重建任务已启动，共 ${tasks.length} 个任务`,
        code: 'SUCCESS'
      },
      data: tasks
    });
  })
];
