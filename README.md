# 🚀 Modern Frontend Development with MSW

基于 Next.js + TypeScript + Ant Design + MSW 的现代化前端开发项目，展示如何使用 Mock Service Worker 进行高效的API开发和测试。

## ✨ 特性

- 🎯 **现代化技术栈**: Next.js 15 + TypeScript + React 19
- 🎨 **优雅UI组件**: Ant Design 5.x + TailwindCSS 
- 🌐 **智能API模拟**: MSW (Mock Service Worker) 拦截网络请求
- 📦 **完整类型支持**: 端到端 TypeScript 类型安全
- 🔄 **实时开关**: 一键切换真实API和模拟数据
- 🛠️ **开发友好**: 热重载、代码分割、性能优化
- 📱 **响应式设计**: 支持多设备自适应

## 🏗️ 项目架构

```
nspass-web/
├── app/                     # Next.js App Router
│   ├── components/          # 可复用组件
│   │   └── MSWProvider.tsx  # MSW 提供者组件
│   ├── config/              # 配置文件
│   │   └── api-config.ts    # API 配置管理
│   ├── services/            # API 服务层
│   │   └── user-service.ts  # 用户相关 API
│   ├── utils/               # 工具函数
│   │   └── http-client.ts   # HTTP 客户端
│   ├── msw-demo/           # MSW 演示页面
│   └── layout.tsx          # 根布局
├── src/
│   └── mocks/              # MSW 配置
│       ├── handlers.ts     # API 处理器
│       └── browser.ts      # 浏览器端配置
├── docs/
│   └── MSW_GUIDE.md        # MSW 详细使用指南
└── public/
    └── mockServiceWorker.js # MSW Service Worker
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问演示页面

打开浏览器访问：

- 🏠 **主页**: [http://localhost:3000](http://localhost:3000)
- 🧪 **MSW演示**: [http://localhost:3000/msw-demo](http://localhost:3000/msw-demo)

### 4. 观察MSW工作

在浏览器开发者工具的Console中，你会看到：
```
🚀 MSW (Mock Service Worker) 已启动
```

## 🎯 核心功能演示

### 📊 MSW API模拟

项目展示了如何使用MSW模拟完整的REST API：

```typescript
// 这些请求都会被MSW拦截并返回模拟数据
fetch('https://api.example.com/users')           // 获取用户列表
fetch('https://api.example.com/products')        // 获取产品列表  
fetch('https://api.example.com/auth/login')      // 用户登录
```

### 🎛️ 实时控制

- **右上角MSW开关**: 实时开启/关闭API模拟
- **开启状态**: 所有API请求被拦截，返回模拟数据
- **关闭状态**: API请求发送到真实服务器

### 🔧 完整的API功能

- ✅ **用户管理**: 增删改查、分页、筛选
- ✅ **状态管理**: 数据在会话期间保持
- ✅ **错误处理**: 模拟各种API响应状态
- ✅ **类型安全**: 完整的TypeScript支持

## 📚 技术栈

### 核心框架
- **Next.js 15**: React全栈框架，App Router
- **React 19**: 最新的React版本
- **TypeScript 5**: 类型安全

### UI组件
- **Ant Design 5.x**: 企业级UI组件库
- **TailwindCSS 4**: 实用优先的CSS框架

### API开发
- **MSW 2.x**: Mock Service Worker API模拟
- **类型化API**: 完整的类型定义和客户端

### 开发工具
- **ESLint**: 代码质量检查
- **Turbopack**: 极速构建工具

## 🛠️ 脚本命令

```bash
# 开发
npm run dev          # 启动开发服务器 (with Turbopack)

# 构建
npm run build        # 生产构建
npm run start        # 启动生产服务器

# 代码质量
npm run lint         # ESLint 检查
```

## 📖 使用指南

### 🚀 MSW快速使用

1. **查看演示**: 访问 `/msw-demo` 页面
2. **阅读文档**: 查看 `docs/MSW_GUIDE.md` 详细指南  
3. **实际开发**: 按照真实API地址编写代码，MSW自动拦截

### 🔌 添加新的API

#### 1. 定义API处理器

```typescript
// src/mocks/handlers.ts
export const handlers = [
  http.get('https://api.example.com/your-endpoint', () => {
    return HttpResponse.json({ data: mockData });
  }),
];
```

#### 2. 创建服务类

```typescript
// app/services/your-service.ts
class YourService {
  async getData() {
    return httpClient.get('/your-endpoint');
  }
}
```

#### 3. 在组件中使用

```typescript
import { yourService } from '../services/your-service';

const data = await yourService.getData();
```

## 🌟 项目亮点

### 🎯 为什么选择MSW？

| 特性 | MSW | 传统方案 |
|------|-----|----------|
| **代码一致性** | ✅ 与生产环境完全一致 | ❌ 需要不同的API配置 |
| **网络拦截** | ✅ 真实的网络层拦截 | ❌ 需要mock函数或服务器 |
| **开发体验** | ✅ 即开即用，热重载 | ⚠️ 配置复杂 |
| **生产切换** | ✅ 零代码修改 | ❌ 需要修改配置 |

### 🔄 开发到生产的无缝切换

```typescript
// 开发环境: MSW拦截并返回模拟数据
// 生产环境: 直接请求真实API
const users = await fetch('https://api.example.com/users');
```

**完全相同的代码，不同环境自动切换！**

## 🚀 部署

### Vercel (推荐)

```bash
# 连接到Vercel
vercel

# 或使用GitHub集成自动部署
```

### 其他平台

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- 📚 [MSW 官方文档](https://mswjs.io/)
- 🎨 [Ant Design 文档](https://ant.design/)
- ⚡ [Next.js 文档](https://nextjs.org/docs)
- 🎯 [TypeScript 文档](https://www.typescriptlang.org/)

---

**🎉 享受现代化的前端开发体验！**

# nspass-web

Next.js Web应用，使用TypeScript和protobuf进行类型管理。

## 🚀 技术栈

- **Next.js 15** - React框架
- **TypeScript** - 类型安全
- **ts-proto** - 现代化的protobuf TypeScript生成器
- **Tailwind CSS** - 样式框架

## 📦 Protobuf类型管理

本项目使用 `ts-proto` 来生成类型安全的TypeScript代码：

### 安装和配置

```bash
# 安装依赖
npm install ts-proto --save-dev

# 生成类型
npm run proto:generate

# 监控proto文件变化并自动生成
npm run proto:watch
```

### 特性

- ✅ **字符串枚举** - 更直观的枚举值
- ✅ **camelCase字段** - 符合JavaScript约定
- ✅ **纯TypeScript接口** - 无复杂的protobuf类
- ✅ **类型安全** - 完整的TypeScript支持
- ✅ **开发者友好** - 优秀的IDE体验

### 使用示例

```typescript
import { EgressItem, EgressMode } from './app/types/generated/egress';

// 直接使用生成的类型，无需适配器
const egress: EgressItem = {
  egressId: 'egress-001',          // camelCase ✅
  serverId: 'server-001',          // camelCase ✅  
  egressMode: EgressMode.EGRESS_MODE_DIRECT, // 字符串枚举 ✅
  targetAddress: '192.168.1.100'
};
```

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 生成protobuf类型
npm run proto:generate

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 📁 项目结构

```
├── app/
│   ├── types/generated/        # ts-proto生成的类型文件
│   │   ├── egress.ts
│   │   └── common.ts
│   └── services/               # 业务服务层
├── proto/                      # protobuf定义文件
│   ├── egress.proto
│   └── common.proto
└── examples/                   # 使用示例
```

## 🎯 核心优势

相比传统的protobuf-js方案，ts-proto提供了：

1. **无适配器需求** - 直接生成开发者友好的代码
2. **更好的类型体验** - 纯TypeScript接口
3. **现代化约定** - camelCase + 字符串枚举
4. **优秀的IDE支持** - 完美的自动补全和类型检查
