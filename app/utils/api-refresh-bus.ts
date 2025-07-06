// API 数据刷新事件总线
export type ApiRefreshEventType = 'msw-toggled' | 'backend-config-changed' | 'manual-refresh';

export interface ApiRefreshEvent {
  type: ApiRefreshEventType;
  timestamp: number;
  payload?: any;
}

type ApiRefreshListener = (event: ApiRefreshEvent) => void;

class ApiRefreshEventBus {
  private listeners: Set<ApiRefreshListener> = new Set();

  // 添加监听器
  subscribe(listener: ApiRefreshListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // 触发事件
  emit(type: ApiRefreshEventType, payload?: any): void {
    const event: ApiRefreshEvent = {
      type,
      timestamp: Date.now(),
      payload
    };

    console.log('🔄 API 刷新事件触发:', event);
    
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('API 刷新事件监听器执行失败:', error);
      }
    });
  }

  // 获取监听器数量（用于调试）
  getListenerCount(): number {
    return this.listeners.size;
  }
}

// 全局事件总线实例
export const apiRefreshEventBus = new ApiRefreshEventBus();

// React Hook 用于监听 API 刷新事件
import { useEffect, useRef } from 'react';

export function useApiRefresh(
  callback: (event: ApiRefreshEvent) => void,
  deps: any[] = []
) {
  const callbackRef = useRef(callback);
  
  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const unsubscribe = apiRefreshEventBus.subscribe((event) => {
      callbackRef.current(event);
    });

    return unsubscribe;
  }, deps);
}

// 便捷的 Hook 用于自动刷新数据
export function useAutoRefreshData(
  refreshFunction: () => Promise<void> | void,
  options: {
    onMswToggle?: boolean;
    onBackendChange?: boolean;
    onManualRefresh?: boolean;
  } = {}
) {
  const {
    onMswToggle = true,
    onBackendChange = true,
    onManualRefresh = true
  } = options;

  useApiRefresh((event) => {
    const shouldRefresh = (
      (event.type === 'msw-toggled' && onMswToggle) ||
      (event.type === 'backend-config-changed' && onBackendChange) ||
      (event.type === 'manual-refresh' && onManualRefresh)
    );

    if (shouldRefresh) {
      console.log(`🔄 自动刷新数据 - 事件类型: ${event.type}`);
      try {
        const result = refreshFunction();
        if (result instanceof Promise) {
          result.catch(error => {
            console.error('自动刷新数据失败:', error);
          });
        }
      } catch (error) {
        console.error('自动刷新数据失败:', error);
      }
    }
  });
}
