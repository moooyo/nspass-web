# 📁 ts-proto 目录结构支持说明

## ✅ 答案：完美支持嵌套目录结构！

**是的！** ts-proto 完全支持proto文件的嵌套目录结构，并且生成的TypeScript文件会保持相同的目录层次。

## 🏗️ 目录结构映射

### Proto 文件结构
```
proto/
├── egress.proto                    # 根目录文件
├── common.proto                    # 根目录文件
├── model/
│   └── user.proto                  # 嵌套目录文件
├── service/
│   └── user_service.proto          # 嵌套目录文件
└── common/
    └── base.proto                  # 嵌套目录文件
```

### 生成的 TypeScript 文件结构
```
app/types/generated/
├── egress.ts                       # 对应 proto/egress.proto
├── common.ts                       # 对应 proto/common.proto
├── model/
│   └── user.ts                     # 对应 proto/model/user.proto
├── service/
│   └── user_service.ts             # 对应 proto/service/user_service.proto
└── common/
    └── base.ts                     # 对应 proto/common/base.proto
```

## 🔗 Import 处理

### Proto 中的 import
```protobuf
// proto/service/user_service.proto
syntax = "proto3";
import "model/user.proto";  // 引用其他目录的文件
```

### 生成的 TypeScript import
```typescript
// app/types/generated/service/user_service.ts
import type { User, UserRole } from "../model/user";  // 自动生成正确的相对路径
```

## ⚙️ 配置要求

### 1. 更新 package.json 脚本

需要使用 `find` 命令递归查找所有 proto 文件：

```json
{
  "scripts": {
    "proto:generate": "protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=./app/types/generated --ts_proto_opt=stringEnums=true,snakeToCamel=true,useOptionals=all,onlyTypes=true --proto_path=./proto $(find proto -name '*.proto')",
    "proto:watch": "chokidar \"proto/**/*.proto\" -c \"npm run proto:generate\""
  }
}
```

### 2. 关键变化

- **旧命令**：`./proto/*.proto` （只处理根目录）
- **新命令**：`$(find proto -name '*.proto')` （递归处理所有目录）

## 💡 使用示例

```typescript
// 从不同目录导入类型
import { User, UserRole } from './app/types/generated/model/user';
import { GetUserRequest } from './app/types/generated/service/user_service';
import { BaseResponse } from './app/types/generated/common/base';

// 正常使用，跨目录引用无缝工作
const user: User = {
  id: 'user-001',
  username: 'john_doe',
  role: UserRole.USER_ROLE_ADMIN  // 字符串枚举
};

const request: GetUserRequest = {
  userId: user.id
};
```

## 🎯 核心优势

1. **🎯 保持目录结构** - 完全映射proto的目录层次
2. **🎯 自动处理imports** - 生成正确的相对路径import语句
3. **🎯 类型安全** - 跨目录引用保持完整的类型检查
4. **🎯 开发体验** - IDE能正确识别和导航到文件
5. **🎯 组织清晰** - 支持按功能模块组织proto文件

## 📋 最佳实践

### 推荐的目录结构

```
proto/
├── common/          # 通用类型（分页、响应等）
│   ├── base.proto
│   └── errors.proto
├── model/           # 数据模型
│   ├── user.proto
│   ├── order.proto
│   └── product.proto
├── service/         # 服务接口
│   ├── user_service.proto
│   ├── order_service.proto
│   └── product_service.proto
└── api/             # API定义
    ├── v1/
    └── v2/
```

### Package 命名约定

```protobuf
// 使用有意义的包名
package myapp.model.v1;      // proto/model/user.proto
package myapp.service.v1;    // proto/service/user_service.proto
package myapp.common.v1;     // proto/common/base.proto
```

## 🚀 结论

ts-proto 对嵌套目录结构的支持是**开箱即用**的，只需要：

1. ✅ 按需要组织proto文件到不同目录
2. ✅ 更新生成脚本使用递归查找
3. ✅ 正常使用，一切都会自动工作！

**这让大型项目的proto文件管理变得非常清晰和可维护！** 🎊 