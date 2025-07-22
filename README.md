# NSPass Web

> 一个基于 React 和 Ant Design 的现代化网络管理平台，部署在 Cloudflare Workers 上

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/moooyo/nspass-web)
[![Rolldown](https://img.shields.io/badge/Rolldown-1.0.0--beta.29-rust)](https://rolldown.rs/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.26.3-red)](https://ant.design/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 项目简介

NSPass Web 是一个功能完善的网络管理平台，提供用户管理、路由配置、DNS 设置、服务器监控等核心功能。项目采用现代化的技术栈，部署在 Cloudflare Workers 上，享受全球边缘计算的极致性能。

## ✨ 主要特性

- 🎨 **现代化 UI** - 基于 Ant Design 5.x 的精美界面
- 🌙 **主题切换** - 支持亮色/暗色主题切换
- 📱 **响应式设计** - 适配各种设备屏幕
- 🔐 **身份验证** - 完整的用户认证系统
- 🌍 **国际化** - 多语言支持
- 🛡️ **类型安全** - 完整的 TypeScript 支持
- 🔧 **Protocol Buffers** - 基于 protobuf 的类型生成
- 🎭 **Mock 服务** - 集成 MSW 进行 API 模拟
- 📊 **数据可视化** - 丰富的图表和统计功能
- ⚡ **边缘计算** - 基于 Cloudflare Workers 的全球分发

## 🛠️ 技术栈

### 前端框架
- **Rolldown 1.0** - 基于 Rust 的高性能构建工具
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript

### 部署平台
- **Cloudflare Workers** - 边缘计算平台
- **Cloudflare KV** - 键值对存储
- **Wrangler** - Cloudflare 开发工具

### UI 组件
- **Ant Design 5** - 企业级 UI 组件库
- **Ant Design Pro Components** - 高级业务组件
- **Ant Design Charts** - 数据可视化组件
- **Tailwind CSS 4** - 原子化 CSS 框架

### 状态管理与工具
- **MSW** - API 模拟服务
- **React DnD** - 拖拽功能
- **Leaflet** - 地图组件
- **bcryptjs** - 密码加密

## 📦 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd nspass-web

# 安装依赖
npm install
```

## 🚀 开发

### 启动开发服务器

```bash
# 安全的开发模式 (推荐)
npm run dev

# 仅启动 Rolldown watch 模式 (不启动服务器)
npm run dev:watch

# 启动 Cloudflare Workers 本地开发环境
npm run worker:dev
```

### 开发服务器特性

- **安全进程管理**: 使用PID文件跟踪进程，避免杀死VS Code remote server等重要进程
- **自动端口检测**: 智能检测端口占用并安全清理冲突进程
- **优雅退出**: Ctrl+C时自动清理所有相关进程
- **实时重建**: 文件变化时自动重新构建

### 清理开发进程

如果开发服务器异常退出，可以使用以下命令清理遗留进程：

```bash
npm run cleanup-dev
```

## 🏗️ 构建和部署

### 本地构建

```bash
# 构建静态文件
npm run build
```

### 部署到 Cloudflare Workers

```bash
# 登录 Cloudflare 账户
npx wrangler login

# 一键部署（构建 + 部署）
npm run worker:deploy

# 查看实时日志
npm run worker:tail
```

📘 **详细部署指南**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 🚀 快速部署

### 方式一：一键部署按钮

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/moooyo/nspass-web)

### 方式二：命令行部署

```bash
# 1. 克隆并安装
git clone <your-repo-url>
cd nspass-web
npm install

# 2. 一键部署
npm run worker:deploy
```

# 2. 登录 Cloudflare
npx wrangler login

# 3. 一键构建和部署
npm run worker:deploy
```

## 🔧 开发命令

```bash
# 本地开发
npm run dev

# 本地测试 Workers 环境
npm run worker:dev

# 查看 Workers 实时日志
npm run worker:tail

# Protocol Buffers 类型生成
npm run proto:generate
```

## 🎭 Mock 服务

项目集成了 MSW (Mock Service Worker) 用于API模拟：

- 开发环境自动启动 MSW
- 支持实时切换 Mock/真实API
- 完整的数据模拟和响应处理

## 📋 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动 Rolldown 开发服务器 |
| `npm run worker:dev` | 启动 Cloudflare Workers 本地开发 |
| `npm run worker:build` | 构建用于 Workers 部署 |
| `npm run worker:deploy` | 部署到 Cloudflare Workers |
| `npm run build` | 构建静态站点 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 代码检查 |
| `npm run lint:fix` | 修复代码问题 |
| `npm run type-check` | 类型检查 |

## 🏗️ 项目结构

```
nspass-web/
├── src/                      # Cloudflare Workers 源码
│   └── index.js             # Workers 入口文件
├── src/                      # React 应用源码
│   ├── components/           # 组件目录
│   │   ├── common/          # 通用组件
│   │   ├── content/         # 页面内容组件
│   │   └── hooks/           # 自定义钩子
│   ├── config/              # 配置文件
│   ├── mocks/               # Mock 数据和处理器
│   ├── services/            # API 服务
│   ├── types/               # 类型定义
│   │   └── generated/       # 自动生成的类型
│   └── utils/               # 工具函数
├── proto/                   # Protocol Buffers 定义
│   ├── api/                 # API 定义
│   └── model/               # 数据模型
├── public/                  # 静态资源
├── out/                     # 构建输出（静态站点）
├── scripts/                 # 构建脚本
└── wrangler.toml            # Cloudflare Workers 配置
```

## ⚡ Cloudflare Workers 架构

### 请求处理流程

1. **静态资源** (`/assets/*`, `*.css`, `*.js`) → 直接从边缘缓存提供
2. **API 请求** (`/api/*`) → 代理到后端 API 服务器
3. **SPA 路由** (`/dashboard`, `/login`, etc.) → 返回 `index.html`

### API 代理配置

Workers 自动代理所有 `/api/*` 请求到后端 API。API 地址解析顺序：

1. **环境变量**: `API_BASE_URL`
2. **域名映射**:
   - `nspass.com` → `https://api.nspass.com`
   - `localhost` → `http://localhost:8080`
3. **默认**: `https://api.nspass.com`

### 缓存策略

- **静态资源**: 1天边缘缓存 + 1天浏览器缓存
- **HTML文件**: 不缓存，确保 SPA 路由正常
- **API请求**: 不缓存，实时代理

## 🌟 主要功能

### 🏠 首页仪表板
- 系统概览
- 实时监控数据
- 快速操作入口

### 👤 用户管理
- 用户信息管理
- 权限控制
- 用户组管理

### 🔀 路由配置
- 转发规则管理
- 路由策略配置
- 出站规则设置

### 🌐 DNS 配置
- DNS 服务器设置
- 域名解析配置
- DNS 缓存管理

### 🖥️ 服务器管理
- 服务器状态监控
- 配置管理
- 性能统计

### 📊 数据可视化
- 流量统计图表
- 性能监控面板
- 用户活动分析

## 🔒 安全特性

- JWT 令牌认证
- 密码加密存储
- 会话超时保护
- 登录尝试限制
- CORS 自动配置
- CSP 安全策略

## 🎨 主题系统

项目支持亮色和暗色主题切换，主题配置位于 `app/config/theme.config.ts`：

- 自动适配系统主题
- 主题状态持久化
- 自定义主题色彩
- 组件级主题定制

## 🔧 环境配置

### Cloudflare Workers 环境变量

```bash
# 设置 API 基础 URL（可选）
npx wrangler secret put API_BASE_URL
# 输入: https://your-api-server.com

# 查看环境变量
npx wrangler secret list
```

### 本地开发环境变量

创建 `.env.local` 文件：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000

# 功能开关
VITE_ENABLE_MOCK=true
```

## 📊 性能优化

### Cloudflare Workers 优势

- **全球边缘分发** - 200+ 个数据中心
- **零冷启动时间** - V8 引擎直接运行
- **自动缩放** - 按需分配资源
- **内置 CDN** - 静态资源全球缓存

### 优化措施

- 静态资源压缩和缓存
- API 请求代理优化
- SPA 路由智能处理
- 图片和资源懒加载

## 📱 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 🚨 故障排除

### 常见问题

1. **构建失败**
   ```bash
   npm run clean
   npm run worker:build
   ```

2. **Workers 部署失败**
   ```bash
   npx wrangler logout
   npx wrangler login
   ```

3. **API 代理不工作**
   ```bash
   # 查看 Workers 日志
   npx wrangler tail
   ```

### 监控和调试

```bash
# 实时日志监控
npx wrangler tail

# 本地调试模式
npm run worker:dev

# 检查 Workers 状态
npx wrangler dev --inspect
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📚 相关文档

- [📘 Cloudflare Workers 部署指南](WORKERS_DEPLOYMENT_GUIDE.md)
- [🔧 Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [⚡ Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [🎨 Ant Design 文档](https://ant.design/)
- [⚛️ Next.js 文档](https://nextjs.org/docs)

## 📄 许可证

此项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**开发者**: moooyo  
**版本**: 0.1.0  
**最后更新**: 2025-07-21  
**部署平台**: Cloudflare Workers
