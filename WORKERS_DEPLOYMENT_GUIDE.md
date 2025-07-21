# NSPass Web - Cloudflare Workers 部署指南

本项目已从 Cloudflare Pages 迁移到 Cloudflare Workers，以获得更好的 API 配置控制和边缘计算能力。

## 🏗️ 项目架构

- **前端**: Next.js 静态站点导出
- **后端代理**: Cloudflare Workers 处理 API 请求代理
- **部署平台**: Cloudflare Workers + KV Storage

## 🚀 快速开始

### 1. 环境准备

确保你已经安装了以下工具：

```bash
# 安装 Node.js (推荐 v18+)
node --version

# 安装项目依赖
npm install

# 安装或更新 Wrangler CLI
npm install -g wrangler
# 或者使用项目本地版本
npx wrangler --version
```

### 2. 本地开发

```bash
# 启动 Next.js 开发服务器
npm run dev

# 启动 Cloudflare Workers 本地开发环境
npm run worker:dev
```

### 3. 构建项目

```bash
# 构建用于 Workers 部署的项目
npm run worker:build
```

构建完成后会生成：
- `out/` - Next.js 静态站点文件
- `src/index.js` - Cloudflare Workers 入口文件

## 📦 部署到 Cloudflare Workers

### 1. 登录 Cloudflare

```bash
# 登录到你的 Cloudflare 账户
npx wrangler login

# 验证登录状态
npx wrangler whoami
```

### 2. 配置环境变量

在 Cloudflare Workers 控制台或通过 wrangler 命令设置环境变量：

```bash
# 设置 API 基础 URL（可选，会自动根据域名推断）
npx wrangler secret put API_BASE_URL
# 输入: https://your-api-server.com

# 查看当前环境变量
npx wrangler secret list
```

### 3. 部署

```bash
# 部署到生产环境
npm run worker:deploy

# 部署到预演环境
npm run worker:deploy:staging
```

### 4. 配置自定义域名

在 Cloudflare Workers 控制台中：

1. 进入你的 Worker 页面
2. 点击 "Triggers" 标签
3. 添加 Custom Domain
4. 输入你的域名（如 `app.nspass.com`）

## ⚙️ 配置说明

### wrangler.toml

```toml
# Worker 基本配置
name = "nspass-web"
main = "src/index.js"
compatibility_date = "2023-10-30"

# 静态资源配置
[site]
bucket = "./out"

# 环境变量
[vars]
NODE_ENV = "production"

# 生产环境配置
[env.production]
name = "nspass-web"

# 预演环境配置
[env.staging]
name = "nspass-web-staging"
```

### API 代理配置

Workers 会自动代理 `/api/*` 路径到你的后端 API 服务器。API 服务器地址的解析顺序：

1. 环境变量 `API_BASE_URL`
2. 根据域名自动映射：
   - `nspass.com` → `https://api.nspass.com`
   - `localhost` → `http://localhost:8080`
3. 默认 fallback: `https://api.nspass.com`

## 🔧 高级配置

### 自定义 API 映射

编辑 `src/index.js` 中的 `getApiBaseUrl` 函数来添加自定义域名映射：

```javascript
const apiMappings = {
  'your-domain.com': 'https://api.your-domain.com',
  'staging.your-domain.com': 'https://api-staging.your-domain.com',
};
```

### 缓存策略

- **静态资源**: 缓存 1 天
- **HTML 文件**: 不缓存，确保 SPA 路由正常工作
- **API 请求**: 不缓存，直接代理到后端

### CORS 设置

Workers 自动为所有 API 请求添加 CORS 头：

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## 🚨 故障排除

### 1. 构建失败

```bash
# 清理缓存后重新构建
npm run clean
npm run worker:build
```

### 2. Workers 部署失败

```bash
# 检查 wrangler 配置
npx wrangler config list

# 重新登录
npx wrangler logout
npx wrangler login
```

### 3. API 代理不工作

检查浏览器开发者工具的网络标签，确认：
- API 请求路径以 `/api/` 开头
- 检查 Workers 日志：`npx wrangler tail`

### 4. 静态资源 404

确保：
- `out/` 目录存在且包含构建文件
- `wrangler.toml` 中 `site.bucket` 指向正确路径

## 📊 监控和日志

```bash
# 查看 Workers 实时日志
npx wrangler tail

# 查看特定环境的日志
npx wrangler tail --env production

# 查看 Workers 统计信息
npx wrangler dev --local=false --inspect
```

## 🔐 安全注意事项

1. **API Key 管理**: 使用 `wrangler secret` 管理敏感信息
2. **CORS 策略**: 根据需要调整 CORS 设置
3. **域名绑定**: 确保只有授权域名可以访问你的应用

## 📈 性能优化

1. **静态资源**: 使用 Cloudflare CDN 全球分发
2. **API 缓存**: 根据业务需求添加适当的 API 缓存
3. **压缩**: Cloudflare 自动提供 Gzip/Brotli 压缩

## 🆘 获取帮助

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目 Issues](https://github.com/your-repo/issues)
