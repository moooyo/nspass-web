# API Base URL 自定义配置实现总结

## ✅ 已完成的功能

### 1. 统一的API Base URL配置

- **修改了 `app/utils/http-client.ts`**，实现了灵活的base URL配置逻辑
- **环境变量优先级**：
  1. `NEXT_PUBLIC_API_BASE_URL` (新的推荐环境变量)
  2. `NEXT_PUBLIC_API_URL` (向后兼容)
  3. 开发环境默认：`/api` (支持Mock Service Worker)
  4. 生产环境默认：`http://localhost:8080`

### 2. 统一所有Service的API调用方式

#### 已修改的服务文件：
- **`app/services/auth.ts`** - 认证服务，从直接fetch改为httpClient
- **`app/services/servers.ts`** - 服务器管理，从直接fetch改为httpClient  
- **`app/services/userInfo.ts`** - 用户信息服务，已优化文件上传处理
- **`app/services/dnsConfig.ts`** - DNS配置服务，从直接fetch改为httpClient

#### httpClient增强功能：
- **支持FormData文件上传**，自动处理Content-Type
- **统一的错误处理**
- **查询参数处理**
- **JSON和FormData自动识别**

### 3. Mock功能保持完整

- **MSW (Mock Service Worker)** 功能完全保留
- **路径匹配机制**不依赖base URL
- **开发环境默认使用 `/api`** 确保mock正常工作
- **Mock开关功能**保持不变

## 🔧 使用方式

### 开发环境 (默认使用Mock)
```bash
npm run dev
# API Base URL: /api (支持Mock Service Worker)
```

### 开发环境连接本地后端
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
# API Base URL: http://localhost:8080
```

### 生产环境构建
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com npm run build
# API Base URL: https://api.your-domain.com
```

### Docker部署
```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com .
# 或运行时设置
docker run -e NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com your-app
```

## 📝 技术细节

### Base URL配置逻辑 (`app/utils/http-client.ts`)
```typescript
const getApiBaseUrl = (): string => {
  // 1. 优先使用构建时传入的环境变量
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 2. 兼容旧的环境变量名
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 3. 开发环境默认值 (支持mock)
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  
  // 4. 生产环境默认值
  return 'http://localhost:8080';
};
```

### 统一的API调用方式
所有服务现在都使用 `httpClient` 进行API调用：

```typescript
// 之前：直接使用fetch
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// 现在：使用httpClient
const response = await httpClient.post('/v1/auth/login', data);
```

## ✅ 验证结果

- **构建成功** ✅
- **所有环境变量配置测试通过** ✅
- **向后兼容性保持** ✅
- **Mock功能正常** ✅
- **文件上传支持** ✅

## 📚 相关文档

- [API_CONFIG.md](./API_CONFIG.md) - 详细的配置说明
- [README.md](./README.md) - 项目总体说明

## 🎯 实现目标对比

| 要求 | 状态 | 说明 |
|------|------|------|
| 自定义API base URL | ✅ | 支持环境变量和构建时传入 |
| 默认值 http://localhost:8080 | ✅ | 生产环境默认值 |
| 构建时传入支持 | ✅ | 通过 NEXT_PUBLIC_API_BASE_URL |
| 环境变量支持 | ✅ | 支持新旧两种环境变量名 |
| 可复用的逻辑 | ✅ | 统一使用 httpClient |
| 不破坏Mock功能 | ✅ | 开发环境默认使用 /api |
| 只在构建时设置 | ✅ | Next.js环境变量在构建时确定 |

**🎉 所有功能已完美实现！** 