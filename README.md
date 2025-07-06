# NSPass Web

> 一个基于 Next.js 和 Ant Design 的现代化网络管理平台

## 🚀 项目简介

NSPass Web 是一个功能完善的网络管理平台，提供用户管理、路由配置、DNS 设置、服务器监控等核心功能。项目采用现代化的技术栈，具有美观的用户界面和良好的用户体验。

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

## 🛠️ 技术栈

### 前端框架
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript

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

### 开发工具
- **ESLint** - 代码检查
- **TypeScript** - 类型检查
- **Protocol Buffers** - 接口定义
- **Chokidar** - 文件监听

## 📦 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd nspass-web

# 安装依赖
npm install

# 初始化 MSW
npm run msw:init
```

## 🚀 开发

```bash
# 启动开发服务器
npm run dev

# 快速启动（跳过 proto 检查）
npm run dev:fast

# 启动开发服务器（使用 Turbopack）
npm run dev:turbo

# 清理并重新启动
npm run dev:clean
```

## 🏗️ 构建

```bash
# 构建生产版本
npm run build

# 构建并分析包大小
npm run build:analyze

# 启动生产服务器
npm start
```

## 🔧 Protocol Buffers

```bash
# 生成类型定义
npm run proto:generate

# 清理生成的类型
npm run proto:clean

# 监听 proto 文件变化
npm run proto:watch

# 开发模式（自动监听）
npm run proto:dev
```

## 🎭 Mock 服务

```bash
# 重置 MSW 配置
npm run msw:reset

# 强制重置（清理缓存）
npm run msw:force-reset

# 修复 MSW 问题
npm run fix:msw
```

## 📋 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |
| `npm run lint:fix` | 修复代码问题 |
| `npm run type-check` | 类型检查 |
| `npm run clean` | 清理缓存 |
| `npm run clean:all` | 完全清理并重新安装 |

## 🏗️ 项目结构

```
nspass-web/
├── app/                      # Next.js 应用目录
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
└── scripts/                 # 构建脚本
```

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
- CSRF 保护

## 🎨 主题系统

项目支持亮色和暗色主题切换，主题配置位于 `app/config/theme.config.ts`：

- 自动适配系统主题
- 主题状态持久化
- 自定义主题色彩
- 组件级主题定制

## 🔧 开发配置

### 环境变量

创建 `.env.local` 文件：

```env
# API 配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000

# 功能开关
NEXT_PUBLIC_ENABLE_MOCK=true
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

### TypeScript 配置

项目使用严格的 TypeScript 配置，确保类型安全：

- 严格空值检查
- 严格函数类型
- 严格属性初始化
- 禁止隐式 any

## 📱 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

此项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**开发者**: moooyo  
**版本**: 0.1.0  
**最后更新**: 2025-07-06
