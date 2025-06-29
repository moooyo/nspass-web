# API Base URL 配置说明

本项目支持灵活配置API的base URL，可以在构建时传入或从环境变量中获取。

## 配置方式

### 1. 环境变量配置

#### 推荐方式（优先级最高）
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

#### 向后兼容方式
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. 构建时传入

```bash
# 开发环境
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 npm run dev

# 构建
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com npm run build

# Docker 构建
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com .
```

## 默认值逻辑

1. **优先使用 `NEXT_PUBLIC_API_BASE_URL`** 环境变量
2. **向后兼容 `NEXT_PUBLIC_API_URL`** 环境变量
3. **开发环境默认值**: `/api` (支持 Mock Service Worker)
4. **生产环境默认值**: `http://localhost:8080`

## 使用示例

### 开发环境 (支持 Mock)
```bash
# 不设置任何环境变量，将使用 '/api' 支持 mock
npm run dev
```

### 本地后端
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
```

### 远程API
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com npm run build
```

### Docker部署
```bash
docker run -e NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com your-app
```

## Mock 功能

- Mock Service Worker (MSW) 会拦截所有匹配的API请求，无论base URL如何设置
- 在开发环境中，推荐使用默认的 `/api` 路径以确保mock功能正常工作
- Mock功能通过路径匹配，不依赖于base URL的具体值

## 注意事项

1. 环境变量必须以 `NEXT_PUBLIC_` 开头才能在客户端访问
2. 修改环境变量后需要重启开发服务器
3. 构建时的环境变量会被打包到最终的应用中，无法在运行时修改
4. 确保API服务器支持跨域请求 (CORS) 