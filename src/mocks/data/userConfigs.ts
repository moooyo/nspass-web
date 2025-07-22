// 用户配置相关模拟数据

export const mockUserConfigs = [
  {
    id: 1,
    userId: 'user001',
    username: '张三',
    userGroup: 'admin',
    expireTime: '2024-12-31',
    trafficLimit: 10240, // 10GB
    trafficResetType: 'MONTHLY',
    ruleLimit: 50,
    banned: false,
  },
  {
    id: 2,
    userId: 'user002',
    username: '李四',
    userGroup: 'user',
    expireTime: '2024-10-15',
    trafficLimit: 5120, // 5GB
    trafficResetType: 'WEEKLY',
    ruleLimit: 20,
    banned: false,
  },
  {
    id: 3,
    userId: 'user003',
    username: '王五',
    userGroup: 'guest',
    expireTime: '2024-06-30',
    trafficLimit: 1024, // 1GB
    trafficResetType: 'NONE',
    ruleLimit: 10,
    banned: true,
  },
  {
    id: 4,
    userId: 'user004',
    username: '赵六',
    userGroup: 'user',
    expireTime: '2024-08-20',
    trafficLimit: 3072, // 3GB
    trafficResetType: 'DAILY',
    ruleLimit: 15,
    banned: false,
  },
  {
    id: 5,
    userId: 'user005',
    username: '钱七',
    userGroup: 'admin',
    expireTime: '2025-01-31',
    trafficLimit: 20480, // 20GB
    trafficResetType: 'MONTHLY',
    ruleLimit: 100,
    banned: false,
  },
]; 