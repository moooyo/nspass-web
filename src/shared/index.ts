/**
 * 共享模块统一导出入口
 * 提供项目级别的统一导入接口
 */

// 类型导出
export type * from './types/common';

// 常量导出
export * from './constants';

// 工具函数导出
export * from './utils';

// Hooks导出
export * from './hooks';

// 组件导出
export * from './components';

// 服务导出
export { EnhancedBaseService } from './services/EnhancedBaseService';
export { createServiceAdapter, ServiceAdapterPresets } from './services/ServiceAdapter';
export type { StandardService, ServiceAdapterConfig } from './services/ServiceAdapter';
