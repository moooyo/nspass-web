/**
 * 性能监控工具
 * 用于监控组件渲染性能和应用性能指标
 */

import React from 'react'
import { logger } from '@/utils/logger'

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'component' | 'api' | 'navigation' | 'custom';
}

class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // 监控导航性能
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.logNavigationMetrics(navEntry);
          }
        });
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        logger.warn('Navigation performance observer not supported');
      }
    }

    // 监控资源加载性能
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.logResourceMetrics(entry as PerformanceResourceTiming);
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        logger.warn('Resource performance observer not supported');
      }
    }
  }

  private logNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      'DNS查询': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP连接': entry.connectEnd - entry.connectStart,
      '请求响应': entry.responseEnd - entry.requestStart,
      'DOM解析': entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      '页面加载': entry.loadEventEnd - entry.loadEventStart,
      '首次内容绘制': this.getFirstContentfulPaint(),
      '最大内容绘制': this.getLargestContentfulPaint(),
    };

    logger.group('🚀 页面性能指标');
    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        const color = value > 1000 ? 'color: red' : value > 500 ? 'color: orange' : 'color: green';
        logger.debug(`${name}: ${value.toFixed(2)}ms`, { color });
      }
    });
    logger.groupEnd();
  }

  private logResourceMetrics(entry: PerformanceResourceTiming) {
    // 只记录较慢的资源加载
    if (entry.duration > 100) {
      logger.warn(`🐌 慢资源: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
    }
  }

  private getFirstContentfulPaint(): number {
    const entries = performance.getEntriesByType('paint');
    const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
          observer.disconnect();
        });

        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          // 超时处理
          setTimeout(() => {
            observer.disconnect();
            resolve(0);
          }, 5000);
        } catch (e) {
          resolve(0);
        }
      } else {
        resolve(0);
      }
    }) as any;
  }

  // 标记性能点
  mark(name: string) {
    if (!this.isEnabled) return;
    
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  // 测量性能区间
  measure(name: string, startMark?: string, endMark?: string) {
    if (!this.isEnabled) return;

    try {
      if (typeof performance !== 'undefined' && performance.measure) {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, 'measure');
        const entry = entries[entries.length - 1];
        
        if (entry) {
          this.entries.push({
            name,
            startTime: entry.startTime,
            duration: entry.duration,
            type: 'custom'
          });

          // 记录较慢的操作
          if (entry.duration > 16) { // 超过一帧的时间
            logger.warn(`⚠️ 慢操作: ${name} - ${entry.duration.toFixed(2)}ms`);
          }
        }
      }
    } catch (e) {
      logger.warn(`Performance measure failed for ${name}:`, e);
    }
  }

  // 监控组件渲染性能
  measureComponent(componentName: string, renderFn: () => void) {
    if (!this.isEnabled) {
      renderFn();
      return;
    }

    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;

    this.mark(startMark);
    renderFn();
    this.mark(endMark);
    this.measure(measureName, startMark, endMark);
  }

  // 获取性能报告
  getPerformanceReport() {
    return {
      entries: this.entries,
      summary: this.generateSummary(),
    };
  }

  private generateSummary() {
    const componentEntries = this.entries.filter(e => e.type === 'component');
    const apiEntries = this.entries.filter(e => e.type === 'api');
    
    return {
      totalComponents: componentEntries.length,
      averageComponentRenderTime: componentEntries.length > 0 
        ? componentEntries.reduce((sum: number, e: PerformanceEntry) => sum + e.duration, 0) / componentEntries.length 
        : 0,
      slowestComponent: componentEntries.reduce((slowest: PerformanceEntry | null, current: PerformanceEntry) => 
        current.duration > (slowest?.duration ?? 0) ? current : slowest, null as PerformanceEntry | null),
      totalApiCalls: apiEntries.length,
      averageApiResponseTime: apiEntries.length > 0
        ? apiEntries.reduce((sum: number, e: PerformanceEntry) => sum + e.duration, 0) / apiEntries.length
        : 0,
    };
  }

  // 清理资源
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.entries = [];
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor();

// React HOC for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const PerformanceMonitoredComponent = React.forwardRef<unknown, P>((props, ref) => {
    React.useEffect(() => {
      performanceMonitor.mark(`${displayName}-mount-start`);
      
      return () => {
        performanceMonitor.mark(`${displayName}-mount-end`);
        performanceMonitor.measure(`${displayName}-mount`, `${displayName}-mount-start`, `${displayName}-mount-end`);
      };
    }, []);

    return React.createElement(WrappedComponent, { ...props, ref } as P & { ref: React.Ref<unknown> });
  });

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return PerformanceMonitoredComponent;
}

// Hook for performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    performanceMonitor.mark(`${componentName}-render-start`);
    
    return () => {
      performanceMonitor.mark(`${componentName}-render-end`);
      performanceMonitor.measure(`${componentName}-render`, `${componentName}-render-start`, `${componentName}-render-end`);
    };
  });
}

export default performanceMonitor;
