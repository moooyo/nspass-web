# Proto 类型生成说明

## 概述

本项目使用 Protocol Buffers (protobuf) 来定义 API 接口和数据模型，并自动生成 TypeScript 类型定义。

## 目录结构

```
├── proto/                          # Proto定义文件
│   ├── api/                        # API接口定义
│   │   ├── users/user_passkey.proto
│   │   ├── dns/dns_config.proto
│   │   └── ...
│   ├── model/                      # 数据模型定义
│   └── common.proto                # 通用类型定义
├── app/types/generated/            # 自动生成的TypeScript类型 (已添加到.gitignore)
│   ├── api/
│   ├── model/
│   └── common.ts
```

## 自动化流程

### 开发环境 (推荐)

```bash
# 开发时会自动清理和重新生成类型
npm run dev

# 构建时也会自动重新生成
npm run build
```

### 手动命令

```bash
# 清理生成的文件
npm run proto:clean

# 重新生成所有类型
npm run proto:generate

# 开发模式：生成并监听proto文件变化
npm run proto:dev

# 监听模式：当proto文件改变时自动重新生成
npm run proto:watch
```

## 重要注意事项

1. **不要手动编辑生成的文件**
   - `app/types/generated/` 目录下的所有文件都是自动生成的
   - 任何手动修改都会在下次生成时被覆盖

2. **生成的文件不纳入版本控制**
   - `app/types/generated/` 已添加到 `.gitignore`
   - 每次开发/构建都会重新生成最新版本

3. **Proto文件修改后**
   - 修改 `proto/` 目录下的文件后，重新运行 `npm run dev` 或 `npm run proto:generate`
   - 在开发模式下可以使用 `npm run proto:watch` 实现自动监听

## 生成配置

当前使用的 protoc 配置：
- **插件**: ts-proto
- **输出选项**:
  - `stringEnums=true`: 使用字符串枚举
  - `snakeToCamel=true`: 将snake_case转换为camelCase
  - `useOptionals=all`: 使用可选字段
  - `onlyTypes=true`: 只生成类型定义（不生成运行时代码）

## 示例用法

```typescript
// 导入生成的类型
import type {
  PasskeyAuthenticationResponse,
  PasskeyLoginData
} from '@/types/generated/api/users/user_passkey';

// 使用类型
const handleAuth = async (): Promise<PasskeyAuthenticationResponse> => {
  // 实现代码
};
```

## 故障排除

如果遇到类型错误：

1. **重新生成类型**:
   ```bash
   npm run proto:clean && npm run proto:generate
   ```

2. **检查Proto文件语法**:
   - 确保所有proto文件语法正确
   - 检查导入路径是否正确

3. **清理Node.js缓存**:
   ```bash
   npm run clean
   ```

4. **完全重新开始**:
   ```bash
   npm run proto:clean && npm run dev
   ``` 