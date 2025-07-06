// iptables 相关模拟数据
import { mockServers } from './servers';

// iptables 配置项类型
export interface IptablesConfig {
  id: string;
  serverId: string;
  tableName: string;
  chainName: string;
  configName: string;
  ruleContent: string;
  ruleAction: string;
  ruleTarget: string;
  ruleComment: string;
  ruleOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 扩展字段
  sourceIP?: string;
  destinationIP?: string;
  sourcePort?: string;
  destinationPort?: string;
  protocol?: string;
  interfaceName?: string;
  packetCount?: number;
  byteCount?: number;
}

// iptables 重建任务类型
export interface IptablesRebuildTask {
  taskId: string;
  serverId: string;
  status: string;
  totalRules: number;
  processedRules: number;
  failedRules: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  createdBy?: string;
  taskType: string;
}

// 生成 iptables 配置的辅助函数
const generateIptablesConfig = (
  id: string,
  serverId: string,
  tableName: string,
  chainName: string,
  configName: string,
  ruleContent: string,
  ruleAction: string,
  ruleTarget: string,
  ruleComment: string,
  ruleOrder: number,
  extraProps?: Partial<IptablesConfig>
): IptablesConfig => {
  const now = new Date();
  const createdAt = Math.floor(now.getTime() / 1000 - Math.random() * 86400 * 30).toString();
  const updatedAt = Math.floor(now.getTime() / 1000 - Math.random() * 86400 * 7).toString();
  
  return {
    id,
    serverId,
    tableName,
    chainName,
    configName,
    ruleContent,
    ruleAction,
    ruleTarget,
    ruleComment,
    ruleOrder,
    isActive: true,
    createdAt,
    updatedAt,
    packetCount: Math.floor(Math.random() * 10000),
    byteCount: Math.floor(Math.random() * 1000000),
    ...extraProps
  };
};

// 模拟 iptables 配置数据
export const mockIptablesConfigs: IptablesConfig[] = [
  // 服务器01 的 iptables 配置
  generateIptablesConfig(
    'ipt_001',
    '1',
    'filter',
    'INPUT',
    'ssh_access',
    '-A INPUT -p tcp --dport 22 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    'SSH 访问规则',
    1,
    { protocol: 'tcp', destinationPort: '22' }
  ),
  generateIptablesConfig(
    'ipt_002',
    '1',
    'filter',
    'INPUT',
    'web_access',
    '-A INPUT -p tcp --dport 80 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    'HTTP 访问规则',
    2,
    { protocol: 'tcp', destinationPort: '80' }
  ),
  generateIptablesConfig(
    'ipt_003',
    '1',
    'filter',
    'INPUT',
    'https_access',
    '-A INPUT -p tcp --dport 443 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    'HTTPS 访问规则',
    3,
    { protocol: 'tcp', destinationPort: '443' }
  ),
  generateIptablesConfig(
    'ipt_004',
    '1',
    'nat',
    'PREROUTING',
    'port_forward_10001',
    '-A PREROUTING -p tcp --dport 10001 -j DNAT --to-destination 192.168.1.10:8001',
    'DNAT',
    'DNAT',
    '端口转发规则 10001 -> 192.168.1.10:8001',
    10,
    { protocol: 'tcp', destinationPort: '10001', destinationIP: '192.168.1.10' }
  ),
  generateIptablesConfig(
    'ipt_005',
    '1',
    'nat',
    'POSTROUTING',
    'masquerade_out',
    '-A POSTROUTING -o eth0 -j MASQUERADE',
    'MASQUERADE',
    'MASQUERADE',
    '出站网络地址转换',
    20,
    { interfaceName: 'eth0' }
  ),
  generateIptablesConfig(
    'ipt_006',
    '1',
    'filter',
    'FORWARD',
    'forward_allow',
    '-A FORWARD -i eth0 -o eth1 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    '转发允许规则',
    30,
    { interfaceName: 'eth0' }
  ),

  // 服务器02 的 iptables 配置
  generateIptablesConfig(
    'ipt_007',
    '2',
    'filter',
    'INPUT',
    'ssh_access',
    '-A INPUT -p tcp --dport 22 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    'SSH 访问规则',
    1,
    { protocol: 'tcp', destinationPort: '22' }
  ),
  generateIptablesConfig(
    'ipt_008',
    '2',
    'filter',
    'INPUT',
    'custom_port_8001',
    '-A INPUT -p tcp --dport 8001 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    '自定义端口 8001 访问规则',
    5,
    { protocol: 'tcp', destinationPort: '8001' }
  ),
  generateIptablesConfig(
    'ipt_009',
    '2',
    'nat',
    'PREROUTING',
    'port_forward_8080',
    '-A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.2.20:80',
    'DNAT',
    'DNAT',
    '端口转发规则 8080 -> 192.168.2.20:80',
    10,
    { protocol: 'tcp', destinationPort: '8080', destinationIP: '192.168.2.20' }
  ),
  generateIptablesConfig(
    'ipt_010',
    '2',
    'filter',
    'INPUT',
    'block_suspicious',
    '-A INPUT -s 192.168.100.0/24 -j DROP',
    'DROP',
    'DROP',
    '阻止可疑网段访问',
    100,
    { sourceIP: '192.168.100.0/24' }
  ),

  // 服务器03 的 iptables 配置
  generateIptablesConfig(
    'ipt_011',
    '3',
    'filter',
    'INPUT',
    'ssh_access',
    '-A INPUT -p tcp --dport 22 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    'SSH 访问规则',
    1,
    { protocol: 'tcp', destinationPort: '22' }
  ),
  generateIptablesConfig(
    'ipt_012',
    '3',
    'filter',
    'INPUT',
    'game_port_15001',
    '-A INPUT -p tcp --dport 15001 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    '游戏端口 15001 访问规则',
    5,
    { protocol: 'tcp', destinationPort: '15001' }
  ),
  generateIptablesConfig(
    'ipt_013',
    '3',
    'filter',
    'INPUT',
    'game_port_15002',
    '-A INPUT -p udp --dport 15002 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    '游戏端口 15002 访问规则 (UDP)',
    6,
    { protocol: 'udp', destinationPort: '15002' }
  ),
  generateIptablesConfig(
    'ipt_014',
    '3',
    'nat',
    'PREROUTING',
    'range_forward_15003_15005',
    '-A PREROUTING -p tcp --dport 15003:15005 -j DNAT --to-destination 192.168.3.30',
    'DNAT',
    'DNAT',
    '端口范围转发规则 15003-15005 -> 192.168.3.30',
    15,
    { protocol: 'tcp', destinationPort: '15003:15005', destinationIP: '192.168.3.30' }
  ),
  generateIptablesConfig(
    'ipt_015',
    '3',
    'nat',
    'POSTROUTING',
    'snat_outbound',
    '-A POSTROUTING -s 192.168.3.0/24 -o eth0 -j SNAT --to-source 192.168.1.3',
    'SNAT',
    'SNAT',
    '出站源地址转换',
    25,
    { sourceIP: '192.168.3.0/24', interfaceName: 'eth0' }
  ),

  // 服务器04 的 iptables 配置（测试服务器，规则较少）
  generateIptablesConfig(
    'ipt_016',
    '4',
    'filter',
    'INPUT',
    'ssh_access',
    '-A INPUT -p tcp --dport 22 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    'SSH 访问规则',
    1,
    { protocol: 'tcp', destinationPort: '22' }
  ),
  generateIptablesConfig(
    'ipt_017',
    '4',
    'filter',
    'INPUT',
    'test_port_12001',
    '-A INPUT -p tcp --dport 12001 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    '测试端口 12001 访问规则',
    5,
    { protocol: 'tcp', destinationPort: '12001' }
  ),

  // 服务器05 的 iptables 配置
  generateIptablesConfig(
    'ipt_018',
    '5',
    'filter',
    'INPUT',
    'ssh_access',
    '-A INPUT -p tcp --dport 22 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    'SSH 访问规则',
    1,
    { protocol: 'tcp', destinationPort: '22' }
  ),
  generateIptablesConfig(
    'ipt_019',
    '5',
    'filter',
    'INPUT',
    'proxy_port_9001',
    '-A INPUT -p tcp --dport 9001 -j ACCEPT',
    'ACCEPT',
    'ACCEPT',
    '代理端口 9001 访问规则',
    5,
    { protocol: 'tcp', destinationPort: '9001' }
  ),
  generateIptablesConfig(
    'ipt_020',
    '5',
    'mangle',
    'PREROUTING',
    'mark_packets',
    '-A PREROUTING -p tcp --dport 9001 -j MARK --set-mark 1',
    'MARK',
    'MARK',
    '数据包标记规则',
    10,
    { protocol: 'tcp', destinationPort: '9001' }
  ),
];

// 模拟 iptables 重建任务数据
export const mockIptablesRebuildTasks: IptablesRebuildTask[] = [
  {
    taskId: 'task_001',
    serverId: '1',
    status: 'IPTABLES_REBUILD_STATUS_SUCCESS',
    totalRules: 6,
    processedRules: 6,
    failedRules: 0,
    startedAt: Math.floor(Date.now() / 1000 - 3600).toString(),
    completedAt: Math.floor(Date.now() / 1000 - 3500).toString(),
    createdBy: 'admin',
    taskType: 'SERVER_REBUILD'
  },
  {
    taskId: 'task_002',
    serverId: '2',
    status: 'IPTABLES_REBUILD_STATUS_FAILED',
    totalRules: 4,
    processedRules: 3,
    failedRules: 1,
    startedAt: Math.floor(Date.now() / 1000 - 1800).toString(),
    completedAt: Math.floor(Date.now() / 1000 - 1700).toString(),
    errorMessage: '端口 8080 配置冲突，无法应用规则',
    createdBy: 'admin',
    taskType: 'SERVER_REBUILD'
  },
  {
    taskId: 'task_003',
    serverId: '3',
    status: 'IPTABLES_REBUILD_STATUS_RUNNING',
    totalRules: 5,
    processedRules: 3,
    failedRules: 0,
    startedAt: Math.floor(Date.now() / 1000 - 300).toString(),
    createdBy: 'admin',
    taskType: 'SERVER_REBUILD'
  },
];

// 根据服务器 ID 获取 iptables 配置
export const getIptablesConfigsByServerId = (serverId: string): IptablesConfig[] => {
  return mockIptablesConfigs.filter(config => config.serverId === serverId);
};

// 生成新的 iptables 重建任务
export const generateIptablesRebuildTask = (serverId: string): IptablesRebuildTask => {
  const serverConfigs = getIptablesConfigsByServerId(serverId);
  const totalRules = serverConfigs.length;
  
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    taskId,
    serverId,
    status: 'IPTABLES_REBUILD_STATUS_PENDING',
    totalRules,
    processedRules: 0,
    failedRules: 0,
    startedAt: Math.floor(Date.now() / 1000).toString(),
    createdBy: 'admin',
    taskType: 'SERVER_REBUILD'
  };
};

// 获取 iptables 统计信息
export const getIptablesStats = () => {
  const totalConfigs = mockIptablesConfigs.length;
  const activeConfigs = mockIptablesConfigs.filter(config => config.isActive).length;
  const totalTasks = mockIptablesRebuildTasks.length;
  const successfulTasks = mockIptablesRebuildTasks.filter(task => 
    task.status === 'IPTABLES_REBUILD_STATUS_SUCCESS'
  ).length;
  const failedTasks = mockIptablesRebuildTasks.filter(task => 
    task.status === 'IPTABLES_REBUILD_STATUS_FAILED'
  ).length;
  const runningTasks = mockIptablesRebuildTasks.filter(task => 
    task.status === 'IPTABLES_REBUILD_STATUS_RUNNING'
  ).length;

  // 按服务器分组统计
  const serverStats = mockServers.map(server => {
    const serverConfigs = getIptablesConfigsByServerId(server.id.toString());
    const serverTasks = mockIptablesRebuildTasks.filter(task => task.serverId === server.id.toString());
    
    return {
      serverId: server.id.toString(),
      serverName: server.name,
      totalRules: serverConfigs.length,
      activeRules: serverConfigs.filter(config => config.isActive).length,
      totalTasks: serverTasks.length,
      latestTaskStatus: serverTasks.length > 0 ? 
        serverTasks.sort((a, b) => parseInt(b.startedAt) - parseInt(a.startedAt))[0].status : 
        'NONE'
    };
  });

  // 按表名分组统计
  const tableStats = mockIptablesConfigs.reduce((acc, config) => {
    const tableName = config.tableName;
    if (!acc[tableName]) {
      acc[tableName] = {
        tableName,
        totalRules: 0,
        activeRules: 0,
        chains: new Set<string>()
      };
    }
    acc[tableName].totalRules++;
    if (config.isActive) {
      acc[tableName].activeRules++;
    }
    acc[tableName].chains.add(config.chainName);
    return acc;
  }, {} as Record<string, any>);

  // 转换 chains Set 为数组
  Object.values(tableStats).forEach((stat: any) => {
    stat.chains = Array.from(stat.chains);
    stat.chainCount = stat.chains.length;
  });

  return {
    overview: {
      totalConfigs,
      activeConfigs,
      inactiveConfigs: totalConfigs - activeConfigs,
      totalTasks,
      successfulTasks,
      failedTasks,
      runningTasks,
      pendingTasks: totalTasks - successfulTasks - failedTasks - runningTasks
    },
    serverStats,
    tableStats: Object.values(tableStats),
    lastUpdateTime: Math.floor(Date.now() / 1000)
  };
};
