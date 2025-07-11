// iptables ??????????????????
// import { mockServers } from './servers';

// iptables ??????????????? - ???????????? swagger.json ??????
export interface IptablesConfig {
  id: number;
  serverId: string;
  configName: string;
  tableName: string;
  chainName: string;
  ruleAction: string;
  sourceIp: string;
  sourcePort: string;
  destIp: string;
  destPort: string;
  protocol: string;
  interface: string;
  ruleComment: string;
  priority: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// iptables ??????????????????
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

// ?????? iptables ?????????????????????
const generateIptablesConfig = (
  id: number,
  serverId: string,
  configName: string,
  tableName: string,
  chainName: string,
  ruleAction: string,
  ruleComment: string,
  priority: number,
  extraProps?: Partial<IptablesConfig>
): IptablesConfig => {
  const now = new Date();
  const createdAt = Math.floor(now.getTime() / 1000 - Math.random() * 86400 * 30).toString();
  const updatedAt = Math.floor(now.getTime() / 1000 - Math.random() * 86400 * 7).toString();
  
  return {
    id,
    serverId,
    configName,
    tableName,
    chainName,
    ruleAction,
    sourceIp: '',
    sourcePort: '',
    destIp: '',
    destPort: '',
    protocol: '',
    interface: '',
    ruleComment,
    priority,
    isEnabled: true,
    createdAt,
    updatedAt,
    ...extraProps
  };
};

// ?????? iptables ????????????
export const mockIptablesConfigs: IptablesConfig[] = [
  // ?????????01 ??? iptables ??????
  generateIptablesConfig(1, '1', 'ssh_access', 'filter', 'INPUT', 'ACCEPT', 'SSH ????????????', 1, 
    { protocol: 'tcp', destPort: '22' }),
  generateIptablesConfig(2, '1', 'web_access', 'filter', 'INPUT', 'ACCEPT', 'HTTP ????????????', 2, 
    { protocol: 'tcp', destPort: '80' }),
  generateIptablesConfig(3, '1', 'https_access', 'filter', 'INPUT', 'ACCEPT', 'HTTPS ????????????', 3, 
    { protocol: 'tcp', destPort: '443' }),
  generateIptablesConfig(4, '1', 'port_forward_10001', 'nat', 'PREROUTING', 'DNAT', '?????????????????? 10001 -> 192.168.1.10:8001', 10, 
    { protocol: 'tcp', destPort: '10001', destIp: '192.168.1.10' }),
  generateIptablesConfig(5, '1', 'masquerade_out', 'nat', 'POSTROUTING', 'MASQUERADE', '????????????????????????', 20, 
    { interface: 'eth0' }),
  generateIptablesConfig(6, '1', 'firewall_drop_invalid', 'filter', 'INPUT', 'DROP', '??????????????????', 30, 
    { interface: 'eth0' }),

  // ?????????02 ??? iptables ??????
  generateIptablesConfig(7, '2', 'ssh_access', 'filter', 'INPUT', 'ACCEPT', 'SSH ????????????', 1, 
    { protocol: 'tcp', destPort: '22' }),
  generateIptablesConfig(8, '2', 'app_forward_8001', 'nat', 'PREROUTING', 'DNAT', '?????????????????? 8001', 5, 
    { protocol: 'tcp', destPort: '8001' }),
  generateIptablesConfig(9, '2', 'proxy_forward_8080', 'nat', 'PREROUTING', 'DNAT', '?????????????????? 8080 -> 192.168.2.20:8080', 10, 
    { protocol: 'tcp', destPort: '8080', destIp: '192.168.2.20' }),
  generateIptablesConfig(10, '2', 'internal_net_access', 'filter', 'FORWARD', 'ACCEPT', '??????????????????', 100, 
    { sourceIp: '192.168.100.0/24' }),

  // ?????????03 ??? iptables ??????
  generateIptablesConfig(11, '3', 'ssh_access', 'filter', 'INPUT', 'ACCEPT', 'SSH ????????????', 1, 
    { protocol: 'tcp', destPort: '22' }),
  generateIptablesConfig(12, '3', 'game_server_15001', 'nat', 'PREROUTING', 'DNAT', '??????????????????????????? 15001', 5, 
    { protocol: 'tcp', destPort: '15001' }),
  generateIptablesConfig(13, '3', 'voice_server_15002', 'nat', 'PREROUTING', 'DNAT', '??????????????????????????? 15002', 6, 
    { protocol: 'udp', destPort: '15002' }),
  generateIptablesConfig(14, '3', 'cluster_forward_range', 'nat', 'PREROUTING', 'DNAT', '???????????????????????? 15003-15005 -> 192.168.3.30', 15, 
    { protocol: 'tcp', destPort: '15003:15005', destIp: '192.168.3.30' }),
  generateIptablesConfig(15, '3', 'cluster_masquerade', 'nat', 'POSTROUTING', 'MASQUERADE', '????????????????????????', 25, 
    { sourceIp: '192.168.3.0/24', interface: 'eth0' }),

  // ?????????04 ??? iptables ??????
  generateIptablesConfig(16, '4', 'ssh_access', 'filter', 'INPUT', 'ACCEPT', 'SSH ????????????', 1, 
    { protocol: 'tcp', destPort: '22' }),
  generateIptablesConfig(17, '4', 'backup_server_12001', 'nat', 'PREROUTING', 'DNAT', '??????????????????????????? 12001', 5, 
    { protocol: 'tcp', destPort: '12001' }),

  // ?????????05 ??? iptables ??????
  generateIptablesConfig(18, '5', 'ssh_access', 'filter', 'INPUT', 'ACCEPT', 'SSH ????????????', 1, 
    { protocol: 'tcp', destPort: '22' }),
  generateIptablesConfig(19, '5', 'monitor_server_9001', 'nat', 'PREROUTING', 'DNAT', '??????????????????????????? 9001', 5, 
    { protocol: 'tcp', destPort: '9001' }),
  generateIptablesConfig(20, '5', 'log_server_9001', 'nat', 'PREROUTING', 'DNAT', '??????????????????????????? 9001', 10, 
    { protocol: 'tcp', destPort: '9001' })
];

// ?????? iptables ??????????????????
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
    errorMessage: '?????? 8080 ?????????????????????????????????',
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
  }
];

// ??????????????? ID ?????? iptables ??????
export const getIptablesConfigsByServerId = (serverId: string): IptablesConfig[] => {
  return mockIptablesConfigs.filter(config => config.serverId === serverId);
};

// ???????????? iptables ????????????
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

// ?????? iptables ????????????
export const getIptablesStats = () => {
  const totalConfigs = mockIptablesConfigs.length;
  const enabledConfigs = mockIptablesConfigs.filter(config => config.isEnabled).length;
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

  return {
    overview: {
      totalConfigs,
      enabledConfigs,
      disabledConfigs: totalConfigs - enabledConfigs,
      totalTasks,
      successfulTasks,
      failedTasks,
      runningTasks,
      pendingTasks: totalTasks - successfulTasks - failedTasks - runningTasks
    },
    lastUpdateTime: Math.floor(Date.now() / 1000)
  };
};
