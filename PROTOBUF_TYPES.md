# Protobuf 类型生成配置

## 📁 目录结构

```
types/
└── generated/          # 自动生成的 protobuf 类型文件（已加入 .gitignore）
    ├── api/
    ├── model/
    └── google/
```

## 🛠️ 可用脚本

| 脚本 | 描述 |
|------|------|
| `npm run proto:clean` | 清理所有生成的类型文件 |
| `npm run proto:generate` | 生成 protobuf 类型文件 |
| `npm run proto:check` | 检查类型文件是否存在，不存在则自动生成 |

## 🚀 自动化流程

以下命令会自动检查并生成 protobuf 类型：

- `npm run dev` - 开发服务器启动前自动检查/生成类型
- `npm run build` - 构建前自动检查/生成类型

## ⚙️ 生成逻辑

1. **优先使用 protoc**: 如果系统安装了 protoc，使用它从 `.proto` 文件生成完整的 TypeScript 类型定义
2. **fallback 机制**: 如果 protoc 不可用，生成最小化的类型定义以确保项目能正常运行

## 🔄 类型文件管理

- ✅ 类型文件自动生成，无需手动创建
- ✅ 已加入 `.gitignore`，不会被提交到版本控制
- ✅ 支持热重载，类型更新后 Vite 自动刷新
- ✅ 构建时自动确保类型文件存在

## 🛡️ 注意事项

- 不要手动编辑 `types/generated/` 目录下的文件
- 这些文件会在每次生成时被完全重新创建
- 如果需要自定义类型，请在 `src/types/` 目录下创建
