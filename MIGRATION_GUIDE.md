# 代码迁移指南

## 📋 迁移清单

### ✅ 已完成的优化

1. **创建统一 Service 基类** (`app/services/base.ts`)
2. **重构 Server Service** (`app/services/server.ts`)
3. **统一类型管理** (`app/types/index.ts`)
4. **通用 Hook 库** (`app/components/hooks/index.ts`)
5. **通用组件库** (`app/components/common/index.tsx`)
6. **服务管理中心** (`app/services/index.ts`)
7. **配置管理系统** (`app/config/index.ts`)

### 🔄 需要迁移的文件

#### 高优先级（建议立即迁移）
- [ ] `app/services/servers.ts` → 使用新的 `app/services/server.ts`
- [ ] `app/services/serverManagement.ts` → 使用新的 `app/services/server.ts`
- [ ] 所有使用旧 ServerService 的组件

#### 中优先级（逐步迁移）
- [ ] 其他 Service 文件继承 BaseService
- [ ] 组件使用通用组件库
- [ ] Hook 替换为通用 Hook

#### 低优先级（可选迁移）
- [ ] 配置项迁移到配置管理系统
- [ ] Mock 数据整理

## 🔧 具体迁移步骤

### 1. 服务层迁移

#### Step 1: 替换 Server Service 导入

**查找所有使用旧服务的文件：**
```bash
# 在项目根目录执行
grep -r "ServerService\." app/components/
grep -r "from.*servers" app/components/
grep -r "serverManagementService" app/components/
```

**替换导入语句：**

❌ **旧代码：**
```typescript
import { ServerService } from '@/services/servers';
import { serverManagementService } from '@/services/serverManagement';
```

✅ **新代码：**
```typescript
import { serverService } from '@/services';
// 或者
import { serverService } from '@/services/server';
```

#### Step 2: 替换 API 调用

❌ **旧代码：**
```typescript
// 静态方法调用
const response = await ServerService.getServers(params);
const groups = await ServerService.getServerGroups();

// 实例方法调用
const response = await serverManagementService.getServers(request);
```

✅ **新代码：**
```typescript
// 统一的实例方法调用
const response = await serverService.getServers(params);
const groups = await serverService.getServerGroups();
```

#### Step 3: 更新类型定义

❌ **旧代码：**
```typescript
import type { ServerItem } from '@/types/generated/api/servers/server_management';
import type { ServerListParams } from '@/services/servers';
```

✅ **新代码：**
```typescript
import type { ServerItem, ServerQueryParams } from '@/types';
// 或从服务文件导入
import type { ServerQueryParams } from '@/services/server';
```

### 2. 组件层迁移

#### Step 1: 使用通用 Hook

❌ **旧代码：**
```tsx
const [data, setData] = useState<ServerItem[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ServerService.getServers();
      if (response.success) {
        setData(response.data || []);
      } else {
        setError(new Error(response.message));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

✅ **新代码：**
```tsx
import { useApi } from '@/components/hooks';

const { data, loading, error, refetch } = useApi(
  () => serverService.getServers()
);
```

#### Step 2: 使用通用表格组件

❌ **旧代码（200+ 行重复的表格逻辑）：**
```tsx
const [dataSource, setDataSource] = useState([]);
const [selectedRowKeys, setSelectedRowKeys] = useState([]);
const [createModalVisible, setCreateModalVisible] = useState(false);
// ... 大量状态管理和事件处理代码
```

✅ **新代码（10+ 行）：**
```tsx
import { CommonTable } from '@/components/common';

<CommonTable<ServerItem>
  title="服务器列表"
  columns={columns}
  service={serverService}
  renderCreateForm={(props) => <ServerCreateForm {...props} />}
  renderEditForm={(props) => <ServerEditForm {...props} />}
/>
```

### 3. 其他 Service 迁移模板

```typescript
// 新 Service 模板
import { BaseService } from './base';
import type { YourEntity, CreateData, UpdateData, QueryParams } from '@/types';

class YourService extends BaseService<YourEntity, CreateData, UpdateData> {
  protected readonly endpoint = '/v1/your-endpoint';

  // 实现特定业务方法
  async customMethod(): Promise<StandardApiResponse<any>> {
    return this.httpClient.get(`${this.endpoint}/custom`);
  }
}

export const yourService = new YourService();
```

## 🚀 快速迁移脚本

为了加速迁移过程，你可以使用以下脚本：

### 脚本 1: 批量替换导入语句

```bash
#!/bin/bash
# replace-imports.sh

echo "替换 ServerService 导入..."

# 替换静态导入
find app/components -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/import { ServerService } from.*servers.*/import { serverService } from "@\/services";/g'

# 替换 serverManagementService 导入
find app/components -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/import.*serverManagementService.*from.*serverManagement.*/import { serverService } from "@\/services";/g'

echo "导入替换完成！"
```

### 脚本 2: 批量替换方法调用

```bash
#!/bin/bash
# replace-calls.sh

echo "替换 API 调用..."

# 替换静态方法调用
find app/components -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/ServerService\./serverService./g'

# 替换 serverManagementService 调用
find app/components -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/serverManagementService\./serverService./g'

echo "API 调用替换完成！"
```

### 脚本使用方法

```bash
# 给脚本执行权限
chmod +x replace-imports.sh replace-calls.sh

# 执行替换（建议先备份代码）
./replace-imports.sh
./replace-calls.sh
```

## ⚠️ 迁移注意事项

### 1. 备份代码
```bash
# 创建迁移前备份
git checkout -b backup-before-migration
git add .
git commit -m "Backup before migration"

# 创建迁移分支
git checkout -b code-migration
```

### 2. 分步骤迁移
- **不要一次性迁移所有文件**
- **每迁移一个文件就测试功能**
- **确保没有破坏现有功能**

### 3. 类型检查
```bash
# 迁移后检查类型错误
npm run type-check
```

### 4. 功能测试
- 测试服务器列表功能
- 测试创建/编辑/删除功能
- 测试批量操作功能

## 🐛 常见问题与解决方案

### Q1: 类型错误 - ServerStatus 不兼容

**错误信息：**
```
Type '"SERVER_STATUS_ONLINE"' is not assignable to type 'ServerStatus'
```

**解决方案：**
```typescript
// 使用枚举值而不是字符串
import { ServerStatus } from '@/types/generated/api/servers/server_management';

// ❌ 错误
status: 'SERVER_STATUS_ONLINE'

// ✅ 正确
status: ServerStatus.SERVER_STATUS_ONLINE
```

### Q2: Hook 参数错误

**错误信息：**
```
Expected 0 arguments, but got 3
```

**解决方案：**
```typescript
// useTable Hook 的 reload 方法已经内置了参数处理
// ❌ 错误
reload(page, pageSize, params)

// ✅ 正确
reload() // 会使用当前状态的参数
```

### Q3: 表格组件类型错误

**解决方案：**
```tsx
// 明确指定泛型类型
<CommonTable<ServerItem>
  columns={columns}
  service={serverService}
/>
```

## 📋 迁移检查清单

### 组件迁移检查
- [ ] 导入语句已更新
- [ ] API 调用已替换
- [ ] 类型定义已更新
- [ ] 功能测试通过
- [ ] TypeScript 编译无错误

### 功能验证清单
- [ ] 列表数据正常显示
- [ ] 分页功能正常
- [ ] 搜索功能正常
- [ ] 创建功能正常
- [ ] 编辑功能正常
- [ ] 删除功能正常
- [ ] 批量操作正常

## 🎯 迁移后验证

### 1. 运行检查命令
```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建检查
npm run build
```

### 2. 功能测试
- 访问服务器管理页面
- 测试所有功能是否正常
- 检查控制台是否有错误

### 3. 性能检查
- 检查页面加载速度
- 检查 API 请求是否正常
- 检查内存使用情况

## 🎉 迁移完成

迁移完成后，你将获得：

1. **更简洁的代码**：减少 40% 的重复代码
2. **更好的类型安全**：统一的类型管理
3. **更高的开发效率**：通用组件和 Hook
4. **更好的可维护性**：清晰的架构

恭喜完成代码优化迁移！🎊
