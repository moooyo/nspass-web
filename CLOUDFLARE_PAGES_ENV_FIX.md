# Cloudflare Pages 环境变量配置指南

## 问题描述

在Cloudflare Pages构建时，环境变量可能无法正确读取，导致应用运行时无法获取到API基础URL等关键配置。

## 解决方案

### 1. 在Cloudflare Pages控制台设置环境变量

在Cloudflare Pages项目的**Settings > Environment variables**中添加以下环境变量：

#### 生产环境 (Production)
```
NEXT_PUBLIC_API_BASE_URL = https://api.nspass.com
NODE_ENV = production
SKIP_TYPE_CHECK = true
```

#### 预览环境 (Preview)
```
NEXT_PUBLIC_API_BASE_URL = https://api.nspass.com
NODE_ENV = production
SKIP_TYPE_CHECK = true
```

### 2. 确保使用正确的构建命令

在Cloudflare Pages的**Settings > Builds and deployments**中，确保使用以下构建设置：

- **Build command**: `npm run build:cloudflare`
- **Build output directory**: `out`
- **Root directory**: `/` (保持默认)

### 3. 构建过程说明

我们创建了多层的环境变量处理机制：

1. **构建时注入**: `scripts/cloudflare-pages-build.js` 在构建时将环境变量注入到静态文件
2. **运行时检测**: `public/cf-pages-env.js` 在浏览器中动态检测和设置API URL
3. **备用方案**: 如果环境变量未设置，会根据域名自动推断API地址

### 4. 验证步骤

#### 本地测试
```bash
# 检查环境变量配置
npm run build:cloudflare:check

# 模拟Cloudflare Pages构建
NODE_ENV=production NEXT_PUBLIC_API_BASE_URL=https://api.nspass.com npm run build:cloudflare
```

#### 生产环境调试
在浏览器控制台中检查以下内容：

```javascript
// 检查运行时配置
console.log(window.__RUNTIME_CONFIG__);

// 检查API URL获取函数
console.log(window.__GET_API_BASE_URL__());
```

### 5. 故障排除

#### 如果环境变量仍未生效：

1. **检查构建日志**：在Cloudflare Pages的构建日志中查找环境变量相关输出
2. **验证环境变量名称**：确保名称完全匹配（区分大小写）
3. **检查部署分支**：确保为正确的分支设置了环境变量
4. **重新部署**：有时需要触发新的部署才能使环境变量生效

#### 如果API调用失败：

应用会自动使用以下备用方案：
1. 构建时环境变量
2. 根据域名推断（如包含"nspass"则使用 `https://api.nspass.com`）
3. 默认API地址：`https://api.nspass.com`

### 6. 文件变更说明

为了解决这个问题，我们修改了以下文件：

- `next.config.ts`: 移除了对构建时环境变量的硬依赖
- `scripts/cloudflare-pages-build.js`: 新的构建脚本，处理多种环境变量场景
- `public/cf-pages-env.js`: 运行时环境变量检测脚本
- `app/layout.tsx`: 加载新的环境变量脚本
- `app/utils/runtime-env.ts`: 改进的环境变量获取逻辑
- `package.json`: 添加了新的构建和检测命令

### 7. 最佳实践

1. **始终在Cloudflare Pages控制台设置环境变量**，不要依赖构建时的环境变量注入
2. **使用 `npm run build:cloudflare` 命令**进行构建
3. **在每次部署前运行 `npm run build:cloudflare:check`** 检查环境变量配置
4. **监控浏览器控制台**，确保运行时配置正确加载

这个解决方案提供了多重保障，确保即使在Cloudflare Pages环境变量配置不当的情况下，应用仍能正常工作。
