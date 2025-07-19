import { 
  IptablesConfig as IptablesConfigType, 
  IptablesServerConfig,
  IptablesGeneratedRule,
  IptablesScript,
  IptablesConfigInfo
} from '@/types/generated/model/iptables';

// 模拟 iptables 配置数据
export const mockIptablesConfigs: IptablesConfigType[] = [
  {
    id: 1,
    serverId: 'server-1',
    tableName: 'nat',
    chainName: 'PREROUTING',
    ruleAction: 'DNAT',
    sourceIp: undefined,
    sourcePort: undefined,
    destIp: '192.168.1.100',
    destPort: '8080',
    protocol: 'tcp',
    interface: 'eth0',
    ruleComment: 'Web服务端口转发',
    priority: 10,
    isEnabled: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    updatedAt: Math.floor(Date.now() / 1000) - 3600,
    targetServerId: 'target-server-1',
    targetServerName: '后端服务器1',
    targetEgressId: undefined,
    targetEgressName: undefined,
  },
  {
    id: 2,
    serverId: 'server-1',
    tableName: 'filter',
    chainName: 'INPUT',
    ruleAction: 'ACCEPT',
    sourceIp: '192.168.1.0/24',
    sourcePort: undefined,
    destIp: undefined,
    destPort: '22',
    protocol: 'tcp',
    interface: undefined,
    ruleComment: 'SSH访问允许',
    priority: 5,
    isEnabled: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
    updatedAt: Math.floor(Date.now() / 1000) - 1800,
    targetServerId: undefined,
    targetServerName: undefined,
    targetEgressId: undefined,
    targetEgressName: undefined,
  },
  {
    id: 3,
    serverId: 'server-1',
    tableName: 'filter',
    chainName: 'INPUT',
    ruleAction: 'DROP',
    sourceIp: undefined,
    sourcePort: undefined,
    destIp: undefined,
    destPort: '80',
    protocol: 'tcp',
    interface: undefined,
    ruleComment: '禁止外部HTTP访问',
    priority: 20,
    isEnabled: false,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
    updatedAt: Math.floor(Date.now() / 1000) - 900,
    targetServerId: undefined,
    targetServerName: undefined,
    targetEgressId: undefined,
    targetEgressName: undefined,
  },
  {
    id: 4,
    serverId: 'server-2',
    tableName: 'nat',
    chainName: 'POSTROUTING',
    ruleAction: 'MASQUERADE',
    sourceIp: '10.0.0.0/8',
    sourcePort: undefined,
    destIp: undefined,
    destPort: undefined,
    protocol: 'all',
    interface: 'eth1',
    ruleComment: 'NAT规则',
    priority: 15,
    isEnabled: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 1,
    updatedAt: Math.floor(Date.now() / 1000) - 1200,
    targetServerId: undefined,
    targetServerName: undefined,
    targetEgressId: 'egress-1',
    targetEgressName: '美国西部出口',
  },
  {
    id: 5,
    serverId: 'server-2',
    tableName: 'filter',
    chainName: 'FORWARD',
    ruleAction: 'ACCEPT',
    sourceIp: '10.0.0.0/8',
    sourcePort: undefined,
    destIp: '192.168.1.0/24',
    destPort: undefined,
    protocol: 'all',
    interface: undefined,
    ruleComment: '内网转发允许',
    priority: 8,
    isEnabled: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
    updatedAt: Math.floor(Date.now() / 1000) - 600,
    targetServerId: undefined,
    targetServerName: undefined,
    targetEgressId: undefined,
    targetEgressName: undefined,
  },
  {
    id: 6,
    serverId: 'server-3',
    tableName: 'filter',
    chainName: 'INPUT',
    ruleAction: 'ACCEPT',
    sourceIp: undefined,
    sourcePort: undefined,
    destIp: undefined,
    destPort: '443',
    protocol: 'tcp',
    interface: undefined,
    ruleComment: 'HTTPS访问允许',
    priority: 5,
    isEnabled: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 1,
    updatedAt: Math.floor(Date.now() / 1000) - 300,
    targetServerId: 'target-server-2',
    targetServerName: 'Web服务器',
    targetEgressId: undefined,
    targetEgressName: undefined,
  },
];

// 根据服务器ID获取 iptables 配置
export const getIptablesConfigsByServerId = (serverId: string): IptablesConfigType[] => {
  return mockIptablesConfigs.filter(config => config.serverId === serverId);
};

// 生成iptables规则命令
const generateIptablesRule = (config: IptablesConfigType): string => {
  const { tableName, chainName, ruleAction, sourceIp, sourcePort, destIp, destPort, protocol, interface: iface } = config;
  
  let command = `iptables`;
  if (tableName && tableName !== 'filter') {
    command += ` -t ${tableName}`;
  }
  command += ` -A ${chainName}`;
  
  if (protocol && protocol !== 'all') {
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

// 获取服务器 iptables 概览
export const getIptablesServerOverview = (serverId: string): IptablesServerConfig => {
  const configs = getIptablesConfigsByServerId(serverId);
  const activeConfigs = configs.filter(config => config.isEnabled).length;
  const errorConfigs = 0; // 模拟数据中没有错误配置
  
  return {
    serverId,
    serverName: `Server ${serverId}`,
    configs,
    totalConfigs: configs.length,
    activeConfigs,
    errorConfigs,
    lastUpdated: Math.floor(Date.now() / 1000) - 300,
  };
};

// 获取服务器 iptables 生成的规则
export const getIptablesGeneratedRules = (serverId: string, onlyEnabled?: boolean): IptablesGeneratedRule[] => {
  let configs = getIptablesConfigsByServerId(serverId);
  
  if (onlyEnabled) {
    configs = configs.filter(config => config.isEnabled);
  }
  
  return configs.map(config => ({
    configId: config.id,
    ruleCommand: generateIptablesRule(config),
    priority: config.priority,
    isValid: true,
    errorMessage: undefined,
  }));
};

// 获取服务器 iptables 脚本
export const getIptablesScript = (serverId: string, onlyEnabled?: boolean, format?: string): IptablesScript => {
  const rules = getIptablesGeneratedRules(serverId, onlyEnabled);
  
  // 按优先级排序
  rules.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  
  let scriptContent = '';
  if (format === 'bash') {
    scriptContent = '#!/bin/bash\n\n# Generated iptables script\n\n';
  } else {
    scriptContent = '# Generated iptables script\n\n';
  }
  
  // 添加清理命令
  scriptContent += '# Clear existing rules\n';
  scriptContent += 'iptables -F\n';
  scriptContent += 'iptables -t nat -F\n';
  scriptContent += 'iptables -t mangle -F\n';
  scriptContent += 'iptables -t raw -F\n\n';
  
  // 添加规则
  scriptContent += '# Add rules\n';
  rules.forEach(rule => {
    scriptContent += `${rule.ruleCommand}\n`;
  });
  
  return {
    serverId,
    scriptContent,
    rules,
    generatedAt: Math.floor(Date.now() / 1000),
  };
};

// 获取 iptables 配置信息（用于前端显示）
export const getIptablesConfigInfo = (serverId: string): IptablesConfigInfo[] => {
  const configs = getIptablesConfigsByServerId(serverId);
  
  return configs.map(config => ({
    ...config,
    serverName: `Server ${serverId}`,
    generatedRule: generateIptablesRule(config),
    targetServerId: config.targetServerId,
    targetServerName: config.targetServerName,
    targetEgressId: config.targetEgressId,
    targetEgressName: config.targetEgressName,
  }));
};

// 获取 iptables 统计信息
export const getIptablesStats = (serverId?: string) => {
  let configs = mockIptablesConfigs;
  if (serverId) {
    configs = getIptablesConfigsByServerId(serverId);
  }
  
  const totalConfigs = configs.length;
  const enabledConfigs = configs.filter(config => config.isEnabled).length;
  const disabledConfigs = totalConfigs - enabledConfigs;
  
  // 按表分组统计
  const tableStats = configs.reduce((acc, config) => {
    const table = config.tableName || 'unknown';
    if (!acc[table]) {
      acc[table] = { total: 0, enabled: 0, disabled: 0 };
    }
    acc[table].total++;
    if (config.isEnabled) {
      acc[table].enabled++;
    } else {
      acc[table].disabled++;
    }
    return acc;
  }, {} as Record<string, { total: number; enabled: number; disabled: number }>);
  
  return {
    totalConfigs,
    enabledConfigs,
    disabledConfigs,
    tableStats,
  };
};

// 用于兼容旧版本的导出
export type IptablesConfig = IptablesConfigType;
export const mockIptablesRebuildTasks: any[] = []; // 保持向后兼容
export const generateIptablesRebuildTask = () => null; // 保持向后兼容
