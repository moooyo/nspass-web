# Mock 文件结构说明

本目录包含了所有的 Mock 数据和 API 处理器，按照功能模块进行分类组织。

## 目录结构

```
app/mocks/
├── README.md          # 本说明文件
├── browser.ts         # MSW 浏览器设置
├── handlers.ts        # 主 handlers 文件，合并所有模块
├── types.ts           # 通用类型定义
├── data/              # 模拟数据目录
│   ├── userConfigs.ts # 用户配置数据
│   ├── users.ts       # 用户数据
│   ├── servers.ts     # 服务器数据
│   ├── userGroups.ts  # 用户组数据
│   ├── userInfo.ts    # 用户信息数据
│   └── websiteConfig.ts # 网站配置数据
└── handlers/          # API 处理器目录
    ├── index.ts       # 导出所有 handlers
    ├── userConfig.ts  # 用户配置管理 API
    ├── websiteConfig.ts # 网站配置 API
    ├── users.ts       # 用户管理 API
    ├── servers.ts     # 服务器管理 API
    ├── userGroups.ts  # 用户组管理 API
    ├── userInfo.ts    # 用户信息 API
    ├── auth.ts        # 认证 API
    ├── dashboard.ts   # 仪表盘 API
    └── misc.ts        # 其他杂项 API
```

## API 分类说明

### 用户配置管理 (`/api/config/users`)
- 获取用户配置列表
- 创建/更新/删除用户配置
- 用户封禁/解封
- 流量重置
- 批量操作

### 网站配置 (`/api/config/website`)
- 获取/更新网站配置
- 邀请码管理
- 配置重置

### 用户管理 (`https://api.example.com/users`)
- 用户 CRUD 操作
- 用户状态管理

### 服务器管理 (`https://api.example.com/servers`)
- 服务器 CRUD 操作
- 服务器重启
- 区域管理

### 用户组管理 (`/v1/user-groups`)
- 用户组 CRUD 操作
- 批量更新

### 用户信息 (`https://api.example.com/user/info`)
- 个人信息管理
- 密码修改
- 流量统计

### 认证 (`https://api.example.com/auth`)
- 登录验证

### 仪表盘 (`https://api.example.com/dashboard`)
- 系统概览
- 流量趋势
- 统计数据

## 使用方式

主 `handlers.ts` 文件自动合并所有模块的 handlers，无需修改使用方式：

```typescript
import { handlers } from '@/mocks/handlers';
```

## 添加新的 API

1. 在 `types.ts` 中添加相关类型定义
2. 在 `data/` 目录中添加模拟数据文件
3. 在 `handlers/` 目录中添加对应的处理器文件
4. 在 `handlers/index.ts` 中导出新的 handlers
5. 在主 `handlers.ts` 中导入并合并

## 优势

- **模块化**: 每个功能模块独立维护
- **易维护**: 代码结构清晰，便于查找和修改
- **类型安全**: 统一的类型定义
- **数据分离**: 模拟数据与业务逻辑分离
- **易扩展**: 添加新功能时结构清晰 