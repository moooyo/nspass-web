# MSW 生产环境禁用指南

本文档描述了如何在生产环境中彻底禁用 Mock Service Worker (MSW) 功能。

## 概述

为了确保生产环境的安全性和性能，我们实现了一套完整的MSW禁用机制，确保在生产部署时MSW功能被彻底禁用。

## 环境变量配置

### 新增环境变量

- `VITE_ENABLE_MSW`: 控制是否启用MSW功能
  - `"true"`: 启用MSW（默认在开发环境）
  - `"false"`: 禁用MSW（默认在生产环境）

### 自动环境检测

系统会根据 `NODE_ENV` 自动设置MSW状态：
- 开发环境 (`NODE_ENV=development`): 默认启用MSW
- 生产环境 (`NODE_ENV=production`): 默认禁用MSW

## 构建命令

### 生产构建（MSW禁用）
```bash
npm run build
```
或明确指定：
```bash
NODE_ENV=production VITE_ENABLE_MSW=false npm run build
```

### 开发构建（MSW启用）
```bash
npm run build:dev
```

### 部署到Cloudflare Workers
```bash
npm run worker:deploy
```

## 技术实现

### 1. 编译时禁用

在 `rolldown.config.ts` 中：
- 根据环境变量设置 `VITE_ENABLE_MSW`
- 在生产环境中将MSW相关模块标记为external，减少bundle大小
- 排除所有handlers相关的文件，包括：
  - `src/mocks/handlers` 目录下的所有文件
  - `handlers.ts` 文件本身
  - MSW核心模块 (`msw`, `msw/browser`, `msw/node`)
  - 所有handler相关的依赖模块

### 2. 运行时检查

#### main.tsx
- 只在开发环境且 `VITE_ENABLE_MSW=true` 时初始化MSW
- 生产环境下跳过MSW初始化

#### handlers.ts
- 在生产环境下导出空的handlers数组
- 避免导入任何handler相关的模块
- 使用条件require()语句确保handlers模块在生产环境中不被加载
- 实现完全的handlers隔离，确保mock数据不会影响生产环境

#### browser.ts
- 在生产环境下不创建MSW worker
- 所有MSW相关函数都会进行环境检查

#### MSWProvider.tsx
- 在生产环境下提供简化的context
- 避免加载MSW相关代码

#### MockToggle.tsx
- 在生产环境下返回null，不渲染Mock切换器

#### init-msw.ts
- 在函数开始就检查环境，生产环境直接返回false

#### index.ts
- initMockServiceWorker函数在生产环境下不执行任何操作

### 3. 类型安全

在 `env.d.ts` 中添加了 `VITE_ENABLE_MSW` 的类型定义，确保TypeScript支持。

## 部署配置

### wrangler.toml
生产环境配置：
```toml
[vars]
NODE_ENV = "production"
VITE_API_BASE_URL = "https://api.nspass.xforward.de"
VITE_ENABLE_MSW = "false"
```

## 验证MSW禁用

### 开发环境验证
1. 运行 `npm run dev`
2. 检查控制台是否有 "MSW initialized in development mode" 消息
3. 查看是否显示Mock切换器

### 生产环境验证
1. 运行 `npm run build`
2. 检查dist目录，MSW相关代码应该被排除
   - 使用 `find dist -name "*handlers*" -o -name "*msw*" -o -name "*mock*"` 验证
   - 确保没有handlers文件被包含在生产构建中
3. 运行 `npm run preview`
4. 检查控制台应该显示 "MSW disabled in production mode"
5. Mock切换器不应该显示

## 最佳实践

1. **永远不要在生产环境启用MSW**
   - 确保生产部署时 `VITE_ENABLE_MSW=false`

2. **使用正确的构建命令**
   - 生产部署使用 `npm run build`
   - 开发调试使用 `npm run dev`

3. **环境隔离**
   - 开发、测试、生产环境明确分离
   - 使用不同的环境变量配置

4. **监控和日志**
   - 生产环境应该记录MSW禁用状态
   - 监控应用性能确保MSW代码未被包含

## 故障排除

### 问题：生产环境仍然包含MSW代码
- 检查 `NODE_ENV` 是否设置为 `production`
- 检查 `VITE_ENABLE_MSW` 是否设置为 `false`
- 重新运行构建命令

### 问题：开发环境MSW无法启动
- 检查 `VITE_ENABLE_MSW` 是否设置为 `true`
- 检查 `NODE_ENV` 是否为 `development`
- 查看浏览器控制台错误信息

### 问题：TypeScript类型错误
- 确保 `src/env.d.ts` 包含 `VITE_ENABLE_MSW` 类型定义
- 运行 `npm run type-check` 检查类型

## 相关文件

- `rolldown.config.ts`: 构建配置
- `src/main.tsx`: 应用入口点
- `src/components/MSWProvider.tsx`: MSW上下文提供器
- `src/components/MockToggle.tsx`: Mock切换器组件
- `src/init-msw.ts`: MSW初始化逻辑
- `src/mocks/handlers.ts`: Mock handlers集合（生产环境条件性禁用）
- `src/mocks/browser.ts`: MSW浏览器工作器设置
- `src/env.d.ts`: 环境变量类型定义
- `wrangler.toml`: Cloudflare Workers配置
- `package.json`: 构建脚本
