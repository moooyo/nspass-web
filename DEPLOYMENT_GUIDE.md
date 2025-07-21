# 📘 NSPass Web 部署指南

将 NSPass Web 静态站点部署到 Cloudflare Workers 的完整指南。

## ✨ 优势

### 相比复杂 Workers 方案：
- 📝 **代码减少 80%** - 从 200+ 行减少到 60 行
- 🧹 **配置简化** - 删除了复杂的环境配置
- 🚀 **部署简化** - 一个命令完成构建和部署
- 🛠️ **维护简单** - 易于理解和修改

### 相比 Cloudflare Pages：
- 🎯 **更灵活** - 可以自定义逻辑（如 API 代理）
- ⚡ **更快冷启动** - Workers 启动更快
- 🔧 **更可控** - 完全控制请求处理逻辑

## 🏗️ 架构说明

### 文件结构
```
src/index.js          # 极简 Workers 入口（60行代码）
out/                  # Next.js 构建输出的静态文件
wrangler.toml         # 简化的 Workers 配置
```

### 工作原理
1. **静态文件** - 直接从 KV 存储获取并返回
2. **SPA 路由** - 非文件路径自动返回 `index.html`
3. **API 代理** - `/api/*` 请求代理到后端 API
4. **智能缓存** - HTML 文件不缓存，其他资源长期缓存

## 📁 核心文件

### `src/index.js` (60行)
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // API 代理
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = url.pathname.replace('/api', 'https://api.nspass.xforward.de')
      const response = await fetch(new Request(apiUrl + url.search, request))
      const newResponse = new Response(response.body, response)
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      return newResponse
    }
    
    // 静态文件处理
    let filePath = url.pathname.slice(1) || 'index.html'
    if (!filePath.includes('.')) filePath = 'index.html' // SPA 路由
    
    const file = await env.__STATIC_CONTENT.get(filePath)
    if (!file) {
      const indexFile = await env.__STATIC_CONTENT.get('index.html')
      return new Response(indexFile, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }
    
    return new Response(file, {
      headers: {
        'Content-Type': getContentType(filePath),
        'Cache-Control': filePath.endsWith('.html') 
          ? 'public, max-age=0, must-revalidate' 
          : 'public, max-age=31536000'
      }
    })
  }
}
```

### `wrangler.toml` (9行)
```toml
name = "nspass-web"
main = "src/index.js"
compatibility_date = "2024-01-01"

[site]
bucket = "./out"

[vars]
NODE_ENV = "production"
```

### `package.json` 脚本
```json
{
  "worker:build": "npm run build",
  "worker:deploy": "npm run build && wrangler deploy",
  "worker:tail": "wrangler tail nspass-web --format pretty"
}
```

## 🚀 使用方法

### 一键部署
```bash
npm run worker:deploy
```

### 实时日志
```bash
npm run worker:tail
```

### 本地开发
```bash
npm run worker:dev
```

## ⚙️ 功能特性

- ✅ **静态文件服务** - 自动 MIME 类型检测
- ✅ **SPA 路由支持** - 客户端路由无缝工作
- ✅ **API 代理** - 统一的 API 接口访问
- ✅ **智能缓存** - 差异化缓存策略
- ✅ **CORS 支持** - 自动处理跨域请求
- ✅ **错误处理** - 优雅的 404 回退

## 📊 对比表

| 特性 | 复杂 Workers | 简化 Workers | Cloudflare Pages |
|------|-------------|-------------|------------------|
| 代码行数 | 200+ | 60 | 0 |
| 配置复杂度 | 高 | 低 | 最低 |
| 部署步骤 | 多步骤 | 一键 | 一键 |
| 自定义能力 | 完全 | 基础 | 有限 |
| 维护成本 | 高 | 低 | 最低 |
| 启动速度 | 快 | 快 | 较快 |
| 成本 | 低 | 低 | 免费 |

## 🎯 适用场景

这个简化方案最适合：
- 🏷️ **静态站点** - 能构建成静态文件的项目
- 🔄 **SPA 应用** - 需要客户端路由支持
- 🌐 **需要 API 代理** - 统一接口访问
- ⚡ **追求性能** - 需要极快的响应速度
- 🧹 **简单维护** - 希望最小化维护成本

## 🚀 生产访问

**网站地址**: https://nspass-web.lengyuchn.workers.dev

## 📝 总结

通过这个极简方案，我们获得了：
- **最佳的开发体验** - 简单直接
- **最小的维护成本** - 代码量极少
- **最优的性能** - Cloudflare 全球边缘网络
- **最大的灵活性** - 可按需扩展功能

这就是静态站点 + Workers 的最佳实践！🎊
