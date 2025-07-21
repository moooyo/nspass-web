# 环境变量配置指南 - 更新版

## 问题描述

部署到 Cloudflare Pages 后，API 请求仍然指向 localhost，导致接口调用失败。

## 根本原因

**Cloudflare Pages 静态导出模式的限制**：

1. **环境变量时机问题**: `output: 'export'` 模式下，环境变量必须在构建时确定
2. **运行时环境变量不可用**: Cloudflare Pages 的环境变量是运行时设置的，但Next.js已经构建完成
3. **MSW Provider 干扰**: 开发时的 Mock Service Worker 可能覆盖了生产环境的 API URL

## 🔧 最新解决方案

我已经实现了一套**运行时环境变量获取系统**，通过以下步骤解决问题：

### 1. 多级环境变量获取策略

新的系统会按以下顺序获取API URL：

1. **window.__ENV__** (运行时注入的环境变量)
2. **process.env.NEXT_PUBLIC_API_BASE_URL** (构建时环境变量)
3. **localStorage** (用户手动配置)
4. **域名推断** (根据当前域名自动推断)
5. **默认回退** (开发环境用localhost，生产环境用默认API)

### 2. 在 Cloudflare Pages 中正确设置环境变量

1. 登录 Cloudflare Pages 控制台
2. 选择项目 `nspass-web`
3. 进入 **Settings** > **Environment variables**
4. 在 **Production** 环境中添加:
   ```
   NEXT_PUBLIC_API_BASE_URL = https://api.nspass.xforward.de
   ```
   (使用你的实际API域名)

5. 在 **Preview** 环境中也添加相同配置

### 3. 验证部署结果

部署完成后，打开浏览器控制台，应该看到：

```
🚀 Layout加载完成，JavaScript执行正常
🌍 运行时环境变量已注入: {NEXT_PUBLIC_API_BASE_URL: "https://api.nspass.xforward.de", NODE_ENV: "production"}
🔧 Environment Initializer
� 环境变量检查结果:
  window.__ENV__: {NEXT_PUBLIC_API_BASE_URL: "https://api.nspass.xforward.de", NODE_ENV: "production"}
  process.env.NEXT_PUBLIC_API_BASE_URL: undefined
  最终选择的API URL: https://api.nspass.xforward.de
  HTTP Client Base URL: https://api.nspass.xforward.de
✅ API URL 配置正确: https://api.nspass.xforward.de
```

### 4. 故障排除

#### 如果仍显示 `localhost`：

1. **清除缓存**: 强制刷新页面 (Ctrl+Shift+R)
2. **检查环境变量**: 确保在正确的环境（Production/Preview）中设置
3. **重新部署**: 在 Cloudflare Pages 控制台手动重新部署
4. **检查控制台**: 查看是否有运行时错误

#### 如果控制台显示警告：

```
⚠️ 生产环境警告: API URL 仍指向 localhost
```

这表明环境变量未正确传递，需要：
1. 重新检查 Cloudflare Pages 的环境变量设置
2. 确保变量名完全匹配：`NEXT_PUBLIC_API_BASE_URL`
3. 重新部署项目

### 5. 新增功能

#### 运行时调试
- **开发环境**: 右上角显示当前API地址状态
- **生产环境**: 如果检测到配置错误，会显示警告横幅

#### 手动配置支持（备用方案）
如果环境变量仍有问题，可以使用代码中的 `setApiBaseUrl()` 函数：

```javascript
// 在浏览器控制台中执行
setApiBaseUrl('https://api.nspass.xforward.de');
```

### 6. 部署检查清单

- [ ] 在 Cloudflare Pages 控制台设置 `NEXT_PUBLIC_API_BASE_URL`
- [ ] 推送代码触发重新部署
- [ ] 检查浏览器控制台输出
- [ ] 验证网络请求指向正确的API地址
- [ ] 如果有问题，查看控制台错误信息

### 7. 修改的文件列表

以下文件已被修改/新增：

- ✅ `app/utils/runtime-env.ts` - 运行时环境变量获取
- ✅ `app/utils/http-client.ts` - 支持运行时API URL获取
- ✅ `app/components/EnvInitializer.tsx` - 环境变量初始化和调试
- ✅ `app/components/ApiConfigModal.tsx` - 手动API配置界面(备用)
- ✅ `app/layout.tsx` - 运行时环境变量注入
- ✅ `next.config.ts` - 构建配置优化
- ✅ `wrangler.toml` - Cloudflare Pages 配置

## 🚀 立即行动

1. **确认环境变量设置**: 检查 Cloudflare Pages 控制台
2. **重新部署**: 推送代码或手动重新部署
3. **验证结果**: 检查浏览器控制台输出

如果按照以上步骤操作后问题仍然存在，请提供浏览器控制台的完整输出，以便进一步诊断。
