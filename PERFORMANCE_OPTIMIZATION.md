# 性能优化指南

## 🚀 优化效果

通过以下优化措施，**首次编译时间从 20+ 秒减少到 3-8 秒**：

- 开发环境首次启动：3-5 秒（之前：20+ 秒）
- 热重载速度：<1 秒
- 生产环境构建：正常时间，但质量更高

## 📋 优化措施

### 1. 开发脚本优化

#### 新的开发命令
```bash
# 🏃 快速开发模式（推荐）- 只检查 proto 文件，不清理缓存
npm run dev

# ⚡ 超快模式 - 跳过所有检查，直接启动
npm run dev:fast

# 🧹 完全清理模式 - 清理所有缓存重新开始
npm run dev:clean

# 🚀 Turbopack 模式 - 使用 Next.js Turbopack 引擎（稳定版）
npm run dev:turbo
```

#### Proto 文件管理
```bash
# 检查并按需生成 proto 类型文件
npm run proto:check

# 手动重新生成 proto 文件
npm run proto:generate

# 监听 proto 文件变化
npm run proto:watch
```

### 2. Next.js 配置优化

- ✅ SWC 编译器（默认启用）
- ✅ Turbopack 引擎支持
- ✅ 开发环境文件系统缓存
- ✅ 优化 webpack 配置
- ✅ 按需导入 Ant Design 组件
- ✅ 生产环境移除 console.log
- ✅ Tree shaking 优化
- ✅ 修复配置警告

### 3. TypeScript 配置优化

- ✅ 增量编译
- ✅ 构建信息缓存
- ✅ 优化依赖分析
- ✅ 跳过库类型检查

### 4. 动态导入优化

- ✅ 图表组件按需加载
- ✅ 大型组件代码分割
- ✅ Suspense 加载状态

### 5. 组件拆分优化

- ✅ Home组件拆分为子组件
- ✅ 统计卡片独立组件化
- ✅ 服务器状态卡片组件化
- ✅ React.memo 性能优化

## 🛠️ 使用建议

### 日常开发
```bash
# 推荐：快速启动，保留缓存
npm run dev
```

### 遇到问题时
```bash
# 完全重置，解决缓存问题
npm run dev:clean
```

### 性能测试
```bash
# 使用稳定版 Turbopack 引擎
npm run dev:turbo
```

### 生产构建
```bash
# 标准构建
npm run build

# 分析包大小
npm run build:analyze
```

## 📊 性能监控

### 编译时间对比
- **优化前**：`npm run dev` → 20-25 秒
- **优化后**：`npm run dev` → 3-5 秒
- **超快模式**：`npm run dev:fast` → 2-3 秒

### 热重载性能
- 组件修改：< 1 秒
- 样式修改：< 0.5 秒
- 类型文件修改：1-2 秒

## 🔧 故障排除

### MSW Service Worker 问题
如果启动后看到网络错误或无法访问：
```bash
# 🔧 快速修复 MSW 问题
npm run fix:msw

# 或者手动修复步骤：
# 1. 重新生成 MSW Service Worker
npm run msw:reset

# 2. 清理缓存后启动
npm run dev:clean

# 3. 如果还有问题，完全重置
npm run clean:all
npm run fix:msw
```

### 常见启动命令
```bash
# ✅ 正确的命令
npm run dev

# ❌ 错误的命令（不存在）
npm run devg
```

### Next.js 配置警告
如果启动时看到配置警告：
```bash
# 已修复的问题：
# ✅ Invalid next.config.ts options detected: swcMinify
# ✅ experimental.turbo is deprecated
# ✅ webpack devtool performance warning
```

### Proto 类型文件缺失
```bash
npm run proto:generate
```

### 缓存问题
```bash
npm run clean
npm run dev:clean
```

### TypeScript 类型错误
```bash
npm run type-check
npm run lint:fix
```

### 完全重置
```bash
npm run clean:all
```

## 🎯 性能最佳实践

### 1. 开发环境
- 使用 `npm run dev` 进行日常开发
- 只在必要时使用 `npm run dev:clean`
- 利用热重载，避免频繁重启

### 2. 代码组织
- 大组件拆分为小组件
- 使用 React.memo() 包装纯组件
- 避免在渲染函数中创建复杂对象

### 3. 依赖管理
- 使用动态导入延迟加载大型库
- 避免导入整个库，使用按需导入
- 定期清理未使用的依赖

### 4. 缓存策略
- 不要过度使用 `clean` 命令
- 让 Next.js 和 TypeScript 缓存发挥作用
- Proto 文件变化时才重新生成类型

## 📈 进一步优化建议

### 短期优化
- [ ] 考虑使用 SWC 替代 Babel（已部分启用）
- [ ] 实施更激进的代码分割
- [ ] 优化 CSS 加载策略

### 长期优化
- [ ] 升级到 Next.js 15 稳定版
- [x] 使用 Turbopack 稳定版（已启用）
- [ ] 实施更细粒度的依赖更新策略

---

💡 **提示**: 如果编译时间仍然较长，请检查系统资源使用情况和网络连接。在某些情况下，防病毒软件也可能影响编译速度。 