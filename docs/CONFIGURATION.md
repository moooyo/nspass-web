# 📋 项目配置说明

## 🔧 环境变量

如果需要自定义配置，可以创建 `.env.local` 文件：

```bash
# API配置
# 生产环境API地址（可选，默认使用 MSW 模拟）
NEXT_PUBLIC_API_URL=https://api.example.com

# MSW配置  
# 是否启用模拟数据（可选，开发环境默认启用）
NEXT_PUBLIC_ENABLE_MOCK=true

# Next.js配置
# 开发环境端口（可选，默认3000）
PORT=3000
```

## ⚙️ 配置文件

### API配置 (`app/config/api-config.ts`)

```typescript
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  isDevelopment: process.env.NODE_ENV === 'development',
  enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true',
};
```

### MSW配置 (`src/mocks/`)

- `handlers.ts` - 定义API处理器
- `browser.ts` - 浏览器端MSW配置

## 🚀 部署配置

### Vercel

项目已配置为开箱即用的Vercel部署：

1. 连接GitHub仓库到Vercel
2. 自动检测Next.js项目
3. 一键部署

### 环境变量设置

在Vercel项目设置中添加：

```
NEXT_PUBLIC_API_URL=https://your-production-api.com
```

## 📱 开发配置

### VSCode推荐扩展

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### TypeScript配置

项目使用严格的TypeScript配置，确保类型安全。

## 🎛️ MSW运行模式

### 开发环境
- 自动启动MSW
- 拦截所有API请求
- 返回模拟数据

### 生产环境
- MSW自动禁用
- 直接请求真实API
- 无额外性能开销 