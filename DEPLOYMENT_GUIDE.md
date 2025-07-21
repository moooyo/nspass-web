# Cloudflare Pages 部署指南

## 🚨 重要更新

已实现**智能环境变量检测**系统，即使 Cloudflare Pages 构建时环境变量未正确传递，应用也能正常工作。

## � 工作原理

1. **动态环境变量加载器** - 在运行时检测和设置API地址
2. **多层检测机制** - 构建时变量 → 域名推断 → 默认fallback
3. **兼容性优先** - 确保在任何情况下应用都能启动

## �🚀 部署步骤

### 1. 环境变量设置（推荐但非必需）

在 Cloudflare Pages 控制台中设置：

**Settings > Environment variables > Production:**
```
NEXT_PUBLIC_API_BASE_URL = https://your-api-domain.com
```

**Settings > Environment variables > Preview:**
```  
NEXT_PUBLIC_API_BASE_URL = https://your-api-domain.com
```

### 2. 构建配置设置

在 Cloudflare Pages 控制台中设置：

**Settings > Build and deployments > Build configuration:**

- **Framework preset**: `None` 或 `Next.js`
- **Build command**: `npm run build:cloudflare`
- **Build output directory**: `out`
- **Root directory**: `/` (默认)

### 3. 部署验证

部署后，打开浏览器控制台应该看到：

**如果环境变量设置正确：**
```
🚀 正在加载 Cloudflare Pages 环境变量...
✅ 使用构建时环境变量: https://your-api-domain.com
� Cloudflare Pages 运行时配置已加载: {NEXT_PUBLIC_API_BASE_URL: "https://your-api-domain.com", ...}
```

**如果环境变量未设置（自动fallback）：**
```
🚀 正在加载 Cloudflare Pages 环境变量...
🎯 推断的API地址: https://api.nspass.xforward.de
📦 Cloudflare Pages 运行时配置已加载: {NEXT_PUBLIC_API_BASE_URL: "https://api.nspass.xforward.de", ...}
```

## ✅ 优势

1. **容错性强** - 即使环境变量设置有问题，应用也能正常工作
2. **智能检测** - 根据域名自动推断正确的API地址
3. **构建稳定** - 不会因为环境变量问题导致构建失败
4. **调试友好** - 清晰的控制台日志显示检测过程

## ⚠️ 注意事项

1. **推荐设置环境变量** - 虽然不是必需的，但设置正确的环境变量可以确保最佳性能
2. **检查控制台日志** - 部署后检查浏览器控制台确认API地址是否正确
3. **域名推断规则** - 目前针对 `nspass` 相关域名进行了优化

现在你的 Cloudflare Pages 部署应该可以稳定工作了！🎉
