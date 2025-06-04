# 🚀 MSW (Mock Service Worker) 使用指南

## 🎯 什么是MSW？

MSW (Mock Service Worker) 是一个现代化的API模拟工具，它通过Service Worker在网络层拦截请求，返回模拟数据。这是目前最流行和推荐的前端API测试方案。

## ✨ 为什么选择MSW？

### 🆚 对比传统方案

| 特性 | MSW | 传统API路由 | JSON Server |
|------|-----|------------|------------|
| **代码一致性** | ✅ 与生产环境完全一致 | ❌ 需要不同的API地址 | ❌ 需要不同的API地址 |
| **网络拦截** | ✅ 真实的网络请求拦截 | ❌ 需要暴露API端点 | ❌ 需要额外的服务器 |
| **开发体验** | ✅ 即开即用，支持热重载 | ⚠️ 需要重启服务器 | ⚠️ 需要单独启动服务 |
| **灵活性** | ✅ 支持复杂逻辑和状态管理 | ⚠️ 受限于框架API路由 | ❌ 功能相对简单 |
| **生产切换** | ✅ 无缝切换，零代码改动 | ❌ 需要修改API地址 | ❌ 需要修改API地址 |

### 🎁 MSW的主要优势

1. **🌐 真实网络拦截**: 拦截`fetch`、`XMLHttpRequest`等真实网络请求
2. **🔄 零配置切换**: 开发/生产环境无缝切换，无需修改业务代码
3. **🎯 精确模拟**: 可以模拟任何API行为，包括错误状态、延迟等
4. **🛠️ 开发友好**: 支持TypeScript，提供优秀的开发体验
5. **📱 跨平台**: 支持浏览器、Node.js、React Native等

## 🏗️ 项目结构

```
src/
├── mocks/
│   ├── handlers.ts        # API处理器定义
│   └── browser.ts         # 浏览器端MSW配置
app/
├── components/
│   └── MSWProvider.tsx    # MSW提供者组件
├── services/
│   └── user-service.ts    # API服务层
└── utils/
    └── http-client.ts     # HTTP客户端
```

## 🚀 快速开始

### 1. 启动项目

```bash
npm run dev
```

### 2. 访问演示页面

打开浏览器访问：`http://localhost:3000/msw-demo`

### 3. 观察控制台

你会看到MSW启动的日志：
```
🚀 MSW (Mock Service Worker) 已启动
```

### 4. 测试API

页面右上角有MSW控制开关，你可以：
- ✅ 开启MSW：所有API请求被拦截并返回模拟数据
- ❌ 关闭MSW：API请求发送到真实服务器（会失败，因为服务器不存在）

## 🔧 配置说明

### API处理器 (handlers.ts)

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET 请求处理
  http.get('https://api.example.com/users', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page');
    // ... 处理逻辑
    return HttpResponse.json({ data: mockUsers });
  }),

  // POST 请求处理
  http.post('https://api.example.com/users', async ({ request }) => {
    const userData = await request.json();
    // ... 处理逻辑
    return HttpResponse.json({ success: true, data: newUser });
  }),
];
```

### MSW提供者 (MSWProvider.tsx)

这个组件负责：
- 🚀 在开发环境自动启动MSW
- 🎛️ 提供可视化的开关控制
- 📊 显示MSW状态

## 💻 使用示例

### 1. 基础API调用

```typescript
// 这个请求会被MSW拦截
const response = await fetch('https://api.example.com/users');
const users = await response.json();
```

### 2. 使用服务类

```typescript
import { userService } from '../services/user-service';

// 获取用户列表
const response = await userService.getUsers({
  page: 1,
  pageSize: 10,
  status: 'active'
});

// 创建新用户
const newUser = await userService.createUser({
  name: '张三',
  email: 'zhangsan@example.com',
  role: 'user'
});
```

### 3. 复杂场景模拟

```typescript
// 模拟登录
http.post('https://api.example.com/auth/login', async ({ request }) => {
  const { username, password } = await request.json();
  
  // 模拟验证逻辑
  if (username === 'admin' && password === '123456') {
    return HttpResponse.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: { id: 1, name: '管理员' }
    });
  }
  
  // 模拟错误响应
  return HttpResponse.json(
    { success: false, message: '用户名或密码错误' },
    { status: 401 }
  );
});
```

## 🎛️ 高级功能

### 1. 动态开关MSW

```typescript
// 运行时开启MSW
import { startMSW } from '../src/mocks/browser';
await startMSW();

// 运行时关闭MSW
import { stopMSW } from '../src/mocks/browser';
stopMSW();
```

### 2. 模拟网络延迟

```typescript
http.get('https://api.example.com/users', async () => {
  // 模拟300ms延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return HttpResponse.json({ data: users });
});
```

### 3. 模拟错误状态

```typescript
http.get('https://api.example.com/users', () => {
  // 模拟服务器错误
  return HttpResponse.json(
    { error: '服务器内部错误' },
    { status: 500 }
  );
});
```

### 4. 状态管理

```typescript
// 全局状态
let mockUsers = [...initialUsers];

http.post('https://api.example.com/users', async ({ request }) => {
  const userData = await request.json();
  const newUser = { id: Date.now(), ...userData };
  
  // 更新模拟数据状态
  mockUsers.push(newUser);
  
  return HttpResponse.json({ success: true, data: newUser });
});
```

## 🔄 生产环境切换

当需要连接真实API时，有几种方式：

### 方式1: 环境变量

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://real-api.yourcompany.com
```

### 方式2: 构建时禁用

```typescript
// 在生产构建时，MSW不会被包含
if (process.env.NODE_ENV === 'development') {
  const { startMSW } = await import('../src/mocks/browser');
  await startMSW();
}
```

### 方式3: 手动开关

使用页面右上角的MSW控制开关即时切换。

## 🐛 调试技巧

### 1. 检查MSW状态

打开浏览器开发者工具，查看Console：
- ✅ `🚀 MSW (Mock Service Worker) 已启动`
- ❌ MSW启动失败的错误信息

### 2. 验证请求拦截

在Network标签页中，被MSW拦截的请求会显示：
- Status: `200` (from service worker)
- Initiator: `service worker`

### 3. 添加日志

```typescript
http.get('https://api.example.com/users', ({ request }) => {
  console.log('MSW: 拦截到用户列表请求', request.url);
  return HttpResponse.json({ data: users });
});
```

## 📚 扩展建议

### 1. 数据持久化

```typescript
// 使用localStorage保持数据状态
const getStoredUsers = () => {
  const stored = localStorage.getItem('mockUsers');
  return stored ? JSON.parse(stored) : defaultUsers;
};

const setStoredUsers = (users) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};
```

### 2. 场景切换

```typescript
// 不同的数据场景
const scenarios = {
  normal: normalUsers,
  empty: [],
  error: null, // 触发错误状态
};

let currentScenario = 'normal';
```

### 3. 响应拦截器

```typescript
// 全局响应处理
http.all('*', ({ request }) => {
  console.log(`[MSW] ${request.method} ${request.url}`);
});
```

## 🎉 总结

MSW是目前最现代化、最优雅的API模拟解决方案：

✅ **无需真实API服务器** - 完全在浏览器端运行  
✅ **代码零修改** - 与生产环境完全一致  
✅ **功能强大** - 支持所有HTTP方法和复杂逻辑  
✅ **开发友好** - 热重载、TypeScript支持  
✅ **灵活控制** - 可以随时开启/关闭  

这样你就可以专注于前端开发，而不用担心后端API的可用性！ 