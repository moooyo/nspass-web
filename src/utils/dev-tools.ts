/**
 * 开发工具集合
 * 提供开发环境下的调试和性能监控工具
 */

import { performanceMonitor } from './performance-monitor';
import { errorHandler } from './error-handler';
import { logger } from './logger';

interface DevToolsConfig {
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableConsoleCommands: boolean;
  enableHotReload: boolean;
}

class DevTools {
  private config: DevToolsConfig;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.DEV;
    this.config = {
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableConsoleCommands: true,
      enableHotReload: true,
    };

    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    this.setupConsoleCommands();
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupHotReload();
    this.logWelcomeMessage();
  }

  private setupConsoleCommands() {
    if (!this.config.enableConsoleCommands || typeof window === 'undefined') return;

    // 添加全局调试命令
    (window as any).__DEV_TOOLS__ = {
      // 性能监控
      performance: {
        getReport: () => performanceMonitor.getPerformanceReport(),
        clear: () => performanceMonitor.cleanup(),
        mark: (name: string) => performanceMonitor.mark(name),
        measure: (name: string, start?: string, end?: string) => 
          performanceMonitor.measure(name, start, end),
      },

      // 错误处理
      errors: {
        getHistory: () => errorHandler.getErrorHistory(),
        getStats: () => errorHandler.getErrorStats(),
        clear: () => errorHandler.clearErrorHistory(),
      },

      // 应用状态
      app: {
        getEnv: () => ({
          NODE_ENV: import.meta.env.MODE,
          VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        }),
        getVersion: () => '0.1.0',
        reload: () => window.location.reload(),
      },

      // 存储管理
      storage: {
        clear: () => {
          localStorage.clear();
          sessionStorage.clear();
          logger.info('Storage cleared');
        },
        list: () => ({
          localStorage: Object.keys(localStorage),
          sessionStorage: Object.keys(sessionStorage),
        }),
        get: (key: string) => ({
          localStorage: localStorage.getItem(key),
          sessionStorage: sessionStorage.getItem(key),
        }),
      },

      // 网络调试
      network: {
        checkAPIStatus: async () => {
          console.group('🔍 API状态检查');

          // 检查环境变量
          console.log('环境变量:');
          console.log('  NODE_ENV:', import.meta.env.MODE);
          console.log('  DEV:', import.meta.env.DEV);
          console.log('  API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

          // 检查当前API配置
          try {
            // const { globalHttpClient } = await import('@/shared/services/EnhancedBaseService');
            console.log('HTTP客户端配置:');
            console.log('  当前baseURL:', 'Not configured');
          } catch (error) {
            console.log('❌ 无法获取HTTP客户端配置:', error);
          }

          console.groupEnd();
        },
        testAPI: async () => {
          console.group('🧪 测试API');

          try {
            // const { globalHttpClient } = await import('@/shared/services/EnhancedBaseService');
            const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
            const testURL = `${baseURL}/v1/routes?pagination.page=1&pagination.pageSize=10`;

            console.log('测试URL:', testURL);
            const response = await fetch(testURL);
            console.log('响应状态:', response.status, response.statusText);
            console.log('响应头:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
              const data = await response.json();
              console.log('响应数据:', data);
            } else {
              console.log('❌ 请求失败');
            }
          } catch (error) {
            console.log('❌ 请求异常:', error);
          }

          console.groupEnd();
        },
      },

      // 帮助信息
      help: () => {
        console.group('🛠️ 开发工具命令');
        console.log('__DEV_TOOLS__.performance - 性能监控工具');
        console.log('__DEV_TOOLS__.errors - 错误跟踪工具');
        console.log('__DEV_TOOLS__.app - 应用信息和控制');
        console.log('__DEV_TOOLS__.storage - 存储管理工具');
        console.log('__DEV_TOOLS__.network - 网络调试工具');
        console.log('  - checkAPIStatus() - 检查API状态');
        console.log('  - testAPI() - 测试API请求');
        console.log('__DEV_TOOLS__.help() - 显示此帮助信息');
        console.groupEnd();
      },
    };

    logger.info('🛠️ 开发工具已加载，输入 __DEV_TOOLS__.help() 查看可用命令');
  }

  private setupPerformanceMonitoring() {
    if (!this.config.enablePerformanceMonitoring) return;

    // 监控页面加载性能
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            logger.info('📊 页面加载性能:', {
              'DNS查询': `${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`,
              'TCP连接': `${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`,
              '请求响应': `${(navigation.responseEnd - navigation.requestStart).toFixed(2)}ms`,
              'DOM解析': `${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`,
              '页面加载': `${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`,
            });
          }
        }, 1000);
      });
    }
  }

  private setupErrorTracking() {
    if (!this.config.enableErrorTracking || typeof window === 'undefined') return;

    // 全局错误处理
    window.addEventListener('error', (event) => {
      errorHandler.handle(event.error, {
        context: 'Global Error Handler',
        showMessage: false, // 避免重复显示消息
      });
    });

    // Promise 错误处理
    window.addEventListener('unhandledrejection', (event) => {
      errorHandler.handle(event.reason, {
        context: 'Unhandled Promise Rejection',
        showMessage: false,
      });
    });
  }

  private setupHotReload() {
    if (!this.config.enableHotReload || typeof window === 'undefined') return;

    // 监听 Vite HMR 事件
    if ((import.meta as any).hot) {
      (import.meta as any).hot.on('vite:beforeUpdate', () => {
        logger.info('🔄 热更新中...');
      });

      (import.meta as any).hot.on('vite:afterUpdate', () => {
        logger.info('✅ 热更新完成');
      });

      (import.meta as any).hot.on('vite:error', (err: any) => {
        logger.error('❌ 热更新失败:', err);
      });
    }
  }

  private logWelcomeMessage() {
    if (typeof window === 'undefined') return;

    console.log(
      '%c🚀 NSPass Web 开发模式',
      'color: #1890ff; font-size: 16px; font-weight: bold;'
    );
    console.log(
      '%c开发工具已启用，输入 __DEV_TOOLS__.help() 查看可用命令',
      'color: #52c41a; font-size: 12px;'
    );
  }

  // 公共方法
  public updateConfig(newConfig: Partial<DevToolsConfig>) {
    this.config = { ...this.config, ...newConfig };
    logger.info('开发工具配置已更新:', this.config);
  }

  public getConfig(): DevToolsConfig {
    return { ...this.config };
  }

  public isDevMode(): boolean {
    return this.isEnabled;
  }
}

// 创建全局实例
export const devTools = new DevTools();

// 导出类型
export type { DevToolsConfig };

// 开发环境下的调试辅助函数
export function debugLog(message: string, data?: any) {
  if (import.meta.env.DEV) {
    logger.debug(`[DEBUG] ${message}`, data);
  }
}

export function debugTime(label: string) {
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    console.time(label);
  }
}

export function debugTimeEnd(label: string) {
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    console.timeEnd(label);
  }
}

export function debugGroup(label: string, fn: () => void) {
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    console.group(label);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  }
}

// React 开发工具集成
export function enableReactDevTools() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // 启用 React DevTools
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
    
    // 添加 React 性能分析
    if ('performance' in window && 'mark' in window.performance) {
      const originalMark = window.performance.mark;
      window.performance.mark = function(name: string) {
        if (name.includes('⚛️')) {
          debugLog(`React Performance: ${name}`);
        }
        return originalMark.call(this, name);
      };
    }
  }
}

// 自动启用 React DevTools
enableReactDevTools();

export default devTools;
