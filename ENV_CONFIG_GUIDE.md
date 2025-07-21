# 环境变量配置指南

## 问题描述

部署到 Cloudflare Pages 后，API 请求仍然指向 localhost，导致接口调用失败。

## 根本原因

1. **环境变量未正确设置**: `NEXT_PUBLIC_API_BASE_URL` 环境变量在 Cloudflare Pages 中未正确配置
2. **构建时环境变量处理**: Next.js 在构建时需要正确处理环境变量
3. **MSW Provider 干扰**: 开发时的 Mock Service Worker 可能覆盖了生产环境的 API URL

## 解决方案

### 1. 在 Cloudflare Pages 控制台中设置环境变量

1. 登录 Cloudflare Pages 控制台
2. 选择你的项目 (`nspass-web`)
3. 进入 **Settings** > **Environment variables**
4. 添加以下环境变量:

```
NEXT_PUBLIC_API_BASE_URL = https://your-api-domain.com
```

**注意**: 
- 必须使用完整的 URL (包含 `https://`)
- 不要使用 `localhost` 或 `127.0.0.1`
- 确保在 **Production** 和 **Preview** 环境中都设置

### 2. 本地开发环境配置

创建 `.env.local` 文件:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 3. 验证配置

#### 方法 1: 使用部署前检查脚本

```bash
npm run pre-deploy-check
```

#### 方法 2: 查看浏览器控制台

部署后，打开浏览器控制台，查看以下输出:

```
🚀 Layout加载完成，JavaScript执行正常
🔍 Environment Debug:
  NODE_ENV: production
  NEXT_PUBLIC_API_BASE_URL: https://your-api-domain.com
  Build time: 2025-01-XX...

🔧 Environment Initializer
🔧 使用环境变量 NEXT_PUBLIC_API_BASE_URL: https://your-api-domain.com
✅ API Base URL 验证通过: https://your-api-domain.com
🔗 HTTP Client Base URL: https://your-api-domain.com
```

如果看到 `localhost` 或 `undefined`，说明环境变量未正确设置。

### 4. 常见问题排查

#### 问题 1: 环境变量显示为 `undefined`

**原因**: Cloudflare Pages 中未设置环境变量

**解决**: 在 Cloudflare Pages 控制台中正确设置 `NEXT_PUBLIC_API_BASE_URL`

#### 问题 2: API 仍然指向 localhost

**原因**: MSW Provider 或缓存问题

**解决**: 
1. 清除浏览器缓存
2. 检查 MSW 是否在生产环境中禁用
3. 强制重新部署

#### 问题 3: 环境变量设置正确但构建时未生效

**原因**: Next.js 构建配置问题

**解决**: 确保使用正确的构建命令:

```bash
npm run build:cloudflare
```

### 5. 部署流程

1. **设置环境变量**: 在 Cloudflare Pages 控制台中设置
2. **运行检查脚本**: `npm run pre-deploy-check`
3. **提交代码**: 推送到 Git 仓库
4. **自动部署**: Cloudflare Pages 自动构建和部署
5. **验证部署**: 检查浏览器控制台输出

### 6. 调试工具

#### 浏览器控制台调试

```javascript
// 检查当前 API 配置
console.log('API Base URL:', httpClient.getCurrentBaseURL());

// 检查环境变量
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
});
```

#### 网络请求监控

在浏览器开发者工具的 **Network** 标签中，查看 API 请求的实际 URL。

### 7. 项目文件修改说明

以下文件已被修改以解决环境变量问题:

- `next.config.ts`: 添加环境变量处理
- `wrangler.toml`: 添加 Cloudflare 配置
- `app/utils/http-client.ts`: 增强调试输出
- `app/utils/env-debug.ts`: 新增环境变量调试工具
- `app/components/EnvInitializer.tsx`: 新增环境变量初始化组件
- `app/layout.tsx`: 添加调试输出和初始化组件
- `scripts/pre-deploy-check.sh`: 新增部署前检查脚本

### 8. 后续维护

定期检查:
1. Cloudflare Pages 中的环境变量设置
2. API 域名是否发生变化
3. 新环境部署时的配置

如果问题仍然存在，请提供浏览器控制台的完整输出以便进一步诊断。
