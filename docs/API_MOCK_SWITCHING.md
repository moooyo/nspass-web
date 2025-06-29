# API Mock 动态切换配置说明

## 📋 概述

项目支持在开发环境下动态切换 Mock 服务和真实后端 API，无需重启开发服务器。

## 🔧 配置方式

### 1. 环境变量配置

创建 `.env.local` 文件并配置：

```bash
# 开发环境下的真实后端地址
# 当停止 Mock 服务时，会自动切换到这个地址
NEXT_PUBLIC_REAL_API_URL=http://localhost:8080

# 或者使用其他后端地址
# NEXT_PUBLIC_REAL_API_URL=http://192.168.1.100:8080
# NEXT_PUBLIC_REAL_API_URL=https://dev-api.yourcompany.com
```

### 2. 动态切换机制

- **启动 Mock 服务**：API baseURL 自动设置为 `/api`（相对路径）
- **停止 Mock 服务**：API baseURL 自动切换到 `NEXT_PUBLIC_REAL_API_URL` 配置的地址

## 🎯 使用场景

### 场景 1: 纯 Mock 开发
```bash
# 不配置任何环境变量
npm run dev
```
- Mock 开启时：使用模拟数据
- Mock 关闭时：切换到默认后端 `http://localhost:8080`

### 场景 2: 连接本地后端
```bash
# .env.local
NEXT_PUBLIC_REAL_API_URL=http://localhost:8080
```
- Mock 开启时：使用模拟数据
- Mock 关闭时：连接本地后端服务器

### 场景 3: 连接远程开发服务器
```bash
# .env.local
NEXT_PUBLIC_REAL_API_URL=https://dev-api.yourcompany.com
```
- Mock 开启时：使用模拟数据
- Mock 关闭时：连接远程开发服务器

## 🚀 操作步骤

1. **配置环境变量**（可选）
   ```bash
   # 创建 .env.local 文件
   echo "NEXT_PUBLIC_REAL_API_URL=http://localhost:8080" > .env.local
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **动态切换**
   - 点击页面右下角的 Mock 开关按钮
   - 开启：使用模拟数据
   - 关闭：自动切换到真实后端

## 📊 状态监控

控制台会显示详细的切换日志：

```
🚀 Mock服务已启动
HTTP客户端 baseURL 已更新为: /api
```

```
⏹️ Mock服务已停止
HTTP客户端 baseURL 已更新为: http://localhost:8080
```

## 🔍 调试技巧

### 检查当前 baseURL
```javascript
// 在浏览器控制台执行
import { httpClient } from '@/utils/http-client';
console.log('当前 baseURL:', httpClient.getCurrentBaseURL());
```

### 手动切换 baseURL
```javascript
// 在浏览器控制台执行
import { httpClient } from '@/utils/http-client';
httpClient.updateBaseURL('http://your-api-server:8080');
```

## ⚙️ 高级配置

### 优先级顺序

1. `NEXT_PUBLIC_API_BASE_URL` - 最高优先级
2. `NEXT_PUBLIC_API_URL` - 向后兼容
3. `NEXT_PUBLIC_REAL_API_URL` - 开发环境切换专用
4. 默认值 - `http://localhost:8080`

### 完整环境变量示例

```bash
# .env.local

# ===========================================
# API 配置
# ===========================================

# 主要 API 地址 (优先级最高，会覆盖所有其他配置)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# 向后兼容的 API 地址
# NEXT_PUBLIC_API_URL=http://localhost:8080

# 开发环境下的真实后端地址 (仅在 Mock 停止时使用)
NEXT_PUBLIC_REAL_API_URL=http://localhost:8080

# ===========================================
# OAuth2 配置 (可选)
# ===========================================

# GitHub OAuth2
# NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Google OAuth2
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Microsoft OAuth2
# NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

## 🎯 注意事项

1. **环境变量生效**：修改环境变量后需要重启开发服务器
2. **CORS 配置**：确保真实后端服务器支持跨域请求
3. **网络可达性**：确保配置的后端地址可以正常访问
4. **动态切换**：只在开发环境下支持，生产环境使用固定配置

## 🐛 常见问题

### Q: 停止 Mock 后仍然是 localhost:3000？
A: 检查 `.env.local` 中的 `NEXT_PUBLIC_REAL_API_URL` 配置

### Q: 环境变量不生效？
A: 确保重启了开发服务器，并且变量名以 `NEXT_PUBLIC_` 开头

### Q: 切换后出现网络错误？
A: 检查后端服务器是否运行，并且支持 CORS

### Q: 如何回到 Mock 模式？
A: 点击 Mock 开关按钮重新启用即可 