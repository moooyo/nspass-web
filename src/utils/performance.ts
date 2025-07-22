/**
 * 性能监控工具
 * 提供应用性能指标收集和分析
 */

import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources: Array<{
    node?: Element;
    currentRect: DOMRectReadOnly;
    previousRect: DOMRectReadOnly;
  }>;
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
  size: number;
  id: string;
  url: string;
  element?: Element;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  cancelable: boolean;
  target?: Element;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.DEV || import.meta.env.PROD;
  }

  /**
   * 标记性能测量开始
   */
  mark(name: string): void {
    if (!this.isEnabled || !('performance' in window)) return;
    
    performance.mark(`${name}-start`);
  }

  /**
   * 标记性能测量结束并记录
   */
  measure(name: string, metadata?: Record<string, unknown>): number | null {
    if (!this.isEnabled || !('performance' in window)) return null;

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      const value = measure?.duration || 0;
      
      this.addMetric({
        name,
        value,
        timestamp: Date.now(),
        metadata,
      });

      // 清理标记
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);

      return value;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Performance measurement failed for ${name}:`, error);
      return null;
    }
  }

  /**
   * 记录自定义指标
   */
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取特定指标的统计信息
   */
  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const filteredMetrics = this.metrics.filter(m => m.name === name);
    
    if (filteredMetrics.length === 0) return null;

    const values = filteredMetrics.map(m => m.value);
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  /**
   * 清理过期指标
   */
  cleanup(maxAge = 5 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // 自动清理，保持内存使用合理
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500); // 保留最近的500个
    }
  }

  /**
   * 监控核心 Web Vitals
   */
  monitorWebVitals(): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      // CLS (Cumulative Layout Shift)
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries: LayoutShiftEntry[] = [];
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as LayoutShiftEntry[]) {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
              
              if (sessionValue && 
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }
              
              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                this.recordMetric('CLS', clsValue);
              }
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as LargestContentfulPaintEntry;
          this.recordMetric('LCP', lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // FID (First Input Delay)  
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as FirstInputEntry[]) {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          }
        }).observe({ type: 'first-input', buffered: true });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Web Vitals monitoring setup failed:', error);
    }
  }
}

// 全局性能监控器实例
export const performanceMonitor = new PerformanceMonitor();

// React 组件性能监控 HOC
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const PerformanceMonitoredComponent = React.forwardRef<unknown, P>((props, ref) => {
    React.useEffect(() => {
      performanceMonitor.mark(`${displayName}-mount`);
      
      return () => {
        performanceMonitor.measure(`${displayName}-mount`);
      };
    }, []);

    return React.createElement(WrappedComponent, { ...props, ref } as P & { ref: React.Ref<unknown> });
  });

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return PerformanceMonitoredComponent;
}

// Hook 用于监控自定义性能指标
export function usePerformanceMonitoring(name: string) {
  const startTime = React.useRef<number | undefined>(undefined);

  const start = React.useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = React.useCallback((metadata?: Record<string, unknown>) => {
    if (startTime.current !== undefined) {
      const duration = performance.now() - startTime.current;
      performanceMonitor.recordMetric(name, duration, metadata);
      startTime.current = undefined;
      return duration;
    }
    return null;
  }, [name]);

  return { start, end };
}

export default performanceMonitor;
