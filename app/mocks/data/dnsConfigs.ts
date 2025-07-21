// DNS配置相关模拟数据

export const mockDnsConfigs = [
  {
    id: 1,
    configName: '主域名Cloudflare配置',
    provider: 'CLOUDFLARE',
    domain: 'example.com',
    configParams: JSON.stringify({
      apiToken: 'cf_token_abcd1234567890',
      zoneId: '1234567890abcdef1234567890abcdef',
      email: 'admin@example.com'
    }),
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    configName: '子域名配置',
    provider: 'CLOUDFLARE',
    domain: 'sub.example.com',
    configParams: '',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 3,
    configName: '测试环境配置',
    provider: 'CLOUDFLARE',
    domain: 'test.example.com',
    configParams: '',
    createdAt: '2024-02-01T09:15:00Z',
  },
  {
    id: 4,
    configName: '开发环境配置',
    provider: 'CLOUDFLARE',
    domain: 'dev.example.com',
    configParams: JSON.stringify({
      apiToken: '',
      zoneId: 'abcdef1234567890abcdef1234567890',
      email: 'dev@example.com'
    }),
    createdAt: '2024-02-10T16:45:00Z',
  },
  {
    id: 5,
    configName: '生产环境备份配置',
    provider: 'CLOUDFLARE',
    domain: 'backup.example.com',
    configParams: '',
    createdAt: '2024-02-15T11:20:00Z',
  },
]; 