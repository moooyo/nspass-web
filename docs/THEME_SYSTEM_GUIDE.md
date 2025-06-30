# NSPass Web 主题系统使用指南

## 概述

NSPass Web 现在支持完整的自适应主题系统，能够自动识别系统主题设置并在 Windows、macOS 以及 Safari、Chrome 等不同平台和浏览器上提供一致的体验。

## 主要特性

### 🎨 三种主题模式
- **浅色模式**: 始终使用浅色主题
- **深色模式**: 始终使用深色主题  
- **跟随系统**: 自动跟随操作系统的主题设置

### 🌐 跨平台兼容性
- ✅ **Windows** (Chrome, Edge, Firefox)
- ✅ **macOS** (Safari, Chrome, Firefox)  
- ✅ **Linux** (Chrome, Firefox)
- ✅ 自动检测并适配不同浏览器的API支持

### ⚡ 性能优化
- **懒加载主题检测**: 使用 `requestIdleCallback` 优化初始化性能
- **防抖保存**: 避免频繁的 localStorage 写入
- **缓存机制**: 智能缓存主题配置和组件
- **平滑过渡**: 主题切换时的流畅动画

## 使用方法

### 1. 基础使用

```tsx
import { useTheme } from '@/components/hooks/useTheme';

function MyComponent() {
  const { theme, resolvedTheme, setTheme, systemInfo } = useTheme();
  
  return (
    <div>
      <p>当前主题偏好: {theme}</p>
      <p>实际应用的主题: {resolvedTheme}</p>
      <p>操作系统: {systemInfo.os}</p>
      <p>浏览器: {systemInfo.browser}</p>
    </div>
  );
}
```

### 2. 主题切换组件

```tsx
import ThemeToggle from '@/components/ThemeToggle';

function Header() {
  return (
    <div>
      {/* 基础用法 */}
      <ThemeToggle />
      
      {/* 自定义配置 */}
      <ThemeToggle 
        size="large" 
        showLabel={true}
        placement="bottomRight"
      />
    </div>
  );
}
```

### 3. 主题配置

主题配置统一管理在 `/config/theme.config.ts` 中：

```typescript
import { CSS_VARIABLES, ANTD_THEME_CONFIG } from '@/config/theme.config';

// 获取当前主题的CSS变量
const lightVars = CSS_VARIABLES.light;
const darkVars = CSS_VARIABLES.dark;

// 获取Antd主题配置
const antdLightConfig = ANTD_THEME_CONFIG.light;
const antdDarkConfig = ANTD_THEME_CONFIG.dark;
```

## 系统架构

### 主题检测流程

1. **初始化**: 检查 localStorage 中的用户偏好
2. **系统检测**: 如果没有用户偏好，检测系统主题
3. **监听变化**: 监听系统主题变化（仅在 system 模式下生效）
4. **应用主题**: 更新 CSS 变量和 data-theme 属性

### 配置文件结构

```
/config/theme.config.ts
├── 主题类型定义 (Theme, ResolvedTheme)
├── 检测配置 (THEME_DETECTION_CONFIG)
├── CSS变量 (CSS_VARIABLES)
├── Antd配置 (ANTD_THEME_CONFIG)
├── 系统检测 (SYSTEM_DETECTION)
└── 工具函数 (ThemeUtils)
```

### 兼容性检测

系统会自动检测并适配以下特性：
- `window.matchMedia` - 媒体查询支持
- `requestIdleCallback` - 空闲时间回调
- `CSS.supports` - CSS变量支持
- `addEventListener` vs `addListener` - 事件监听API

## 调试功能

### 开发环境调试

在开发环境下，主题切换组件会显示调试信息面板，包含：
- 主题偏好设置
- 实际应用的主题
- 操作系统信息
- 浏览器信息
- 系统主题检测结果
- API支持情况

### 浏览器控制台

在开发环境下，可以通过浏览器控制台访问调试对象：

```javascript
// 访问主题调试信息
console.log(window.__themeDebug);

// 手动获取系统信息
console.log(window.__themeDebug.utils.getSystemInfo());

// 手动检测系统主题
console.log(window.__themeDebug.getSystemTheme());
```

## 自定义主题

### 添加新的CSS变量

在 `theme.config.ts` 中的 `CSS_VARIABLES` 对象中添加新变量：

```typescript
export const CSS_VARIABLES = {
  light: {
    // 现有变量...
    '--custom-color': '#your-color',
  },
  dark: {
    // 现有变量...
    '--custom-color': '#your-dark-color',
  },
};
```

### 自定义Antd组件主题

在 `ANTD_THEME_CONFIG` 中添加或修改组件配置：

```typescript
export const ANTD_THEME_CONFIG = {
  light: {
    components: {
      // 现有组件...
      YourComponent: {
        // 组件特定的主题配置
      },
    },
  },
  // dark配置类似...
};
```

## 最佳实践

### 1. 性能优化
- 使用 `resolvedTheme` 而不是 `theme` 来检查实际应用的主题
- 避免在渲染函数中调用 `getSystemInfo()`
- 使用 CSS 变量而不是内联样式

### 2. 用户体验
- 记住用户的主题偏好设置
- 提供明确的主题切换反馈
- 确保主题切换的平滑过渡

### 3. 无障碍访问
- 确保深色模式下的足够对比度
- 提供主题状态的 ARIA 标签
- 支持键盘导航

## 故障排除

### 常见问题

1. **主题不跟随系统变化**
   - 检查是否选择了 "跟随系统" 模式
   - 确认浏览器支持 `prefers-color-scheme` 媒体查询

2. **初始化时闪烁**
   - 这是正常现象，系统需要时间检测主题
   - 可以通过 `isInitialized` 状态添加加载指示器

3. **某些样式不生效**
   - 检查 CSS 变量是否正确定义
   - 确认组件使用了正确的变量名

### 浏览器兼容性

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 基础主题切换 | ✅ | ✅ | ✅ | ✅ |
| 系统主题检测 | ✅ | ✅ | ✅ | ✅ |
| 媒体查询监听 | ✅ | ✅ | ✅ | ✅ |
| requestIdleCallback | ✅ | ❌ | ❌ | ✅ |

注：不支持的特性会自动降级到备用实现。

## 更新日志

### v2.0.0 (当前版本)
- ✨ 新增三种主题模式（light/dark/system）
- ✨ 完整的跨平台和跨浏览器支持
- ✨ 统一的主题配置管理
- ✨ 性能优化和缓存机制
- ✨ 开发环境调试功能
- 🔧 重构主题Hook和组件架构

### v1.0.0 (旧版本)
- 基础的亮色/暗色主题切换
- 简单的 localStorage 存储 