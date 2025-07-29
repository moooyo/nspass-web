/**
 * 轻量级状态管理工具
 * 提供简单的全局状态管理，避免引入复杂的状态管理库
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

type StateListener<T> = (newState: T, prevState: T) => void;
type StateSelector<T, R> = (state: T) => R;
type StateUpdater<T> = (prevState: T) => T;

interface StateStore<T> {
  getState: () => T;
  setState: (updater: T | StateUpdater<T>) => void;
  subscribe: (listener: StateListener<T>) => () => void;
  destroy: () => void;
}

/**
 * 创建状态存储
 */
export function createStore<T>(initialState: T): StateStore<T> {
  let state = initialState;
  const listeners = new Set<StateListener<T>>();

  const getState = () => state;

  const setState = (updater: T | StateUpdater<T>) => {
    const prevState = state;
    state = typeof updater === 'function' 
      ? (updater as StateUpdater<T>)(prevState)
      : updater;

    if (state !== prevState) {
      listeners.forEach(listener => {
        try {
          listener(state, prevState);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }
  };

  const subscribe = (listener: StateListener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  return {
    getState,
    setState,
    subscribe,
    destroy,
  };
}

/**
 * 使用状态存储的Hook
 */
export function useStore<T>(store: StateStore<T>): [T, (updater: T | StateUpdater<T>) => void] {
  const [state, setState] = useState(store.getState);

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [store]);

  return [state, store.setState];
}

/**
 * 使用状态存储选择器的Hook
 */
export function useStoreSelector<T, R>(
  store: StateStore<T>,
  selector: StateSelector<T, R>,
  equalityFn?: (a: R, b: R) => boolean
): R {
  const [selectedState, setSelectedState] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      const newSelectedState = selector(newState);
      
      if (equalityFn) {
        if (!equalityFn(selectedState, newSelectedState)) {
          setSelectedState(newSelectedState);
        }
      } else if (selectedState !== newSelectedState) {
        setSelectedState(newSelectedState);
      }
    });

    return unsubscribe;
  }, [store, selector, selectedState, equalityFn]);

  return selectedState;
}

/**
 * 创建持久化状态存储
 */
export function createPersistedStore<T>(
  key: string,
  initialState: T,
  options: {
    storage?: Storage;
    serializer?: {
      parse: (value: string) => T;
      stringify: (value: T) => string;
    };
  } = {}
): StateStore<T> {
  const { 
    storage = typeof window !== 'undefined' ? localStorage : null,
    serializer = JSON 
  } = options;

  // 从存储中恢复状态
  let restoredState = initialState;
  if (storage) {
    try {
      const storedValue = storage.getItem(key);
      if (storedValue !== null) {
        restoredState = serializer.parse(storedValue);
      }
    } catch (error) {
      console.error(`Failed to restore state from storage for key "${key}":`, error);
    }
  }

  const store = createStore(restoredState);

  // 监听状态变化并持久化
  if (storage) {
    store.subscribe((newState) => {
      try {
        storage.setItem(key, serializer.stringify(newState));
      } catch (error) {
        console.error(`Failed to persist state to storage for key "${key}":`, error);
      }
    });
  }

  return store;
}

/**
 * 全局状态管理器
 */
class GlobalStateManager {
  private stores = new Map<string, StateStore<any>>();

  createStore<T>(key: string, initialState: T): StateStore<T> {
    if (this.stores.has(key)) {
      console.warn(`Store with key "${key}" already exists. Returning existing store.`);
      return this.stores.get(key)!;
    }

    const store = createStore(initialState);
    this.stores.set(key, store);
    return store;
  }

  createPersistedStore<T>(
    key: string,
    initialState: T,
    options?: Parameters<typeof createPersistedStore>[2]
  ): StateStore<T> {
    if (this.stores.has(key)) {
      console.warn(`Store with key "${key}" already exists. Returning existing store.`);
      return this.stores.get(key)!;
    }

    const store = createPersistedStore(key, initialState, options);
    this.stores.set(key, store);
    return store;
  }

  getStore<T>(key: string): StateStore<T> | undefined {
    return this.stores.get(key);
  }

  destroyStore(key: string): boolean {
    const store = this.stores.get(key);
    if (store) {
      store.destroy();
      this.stores.delete(key);
      return true;
    }
    return false;
  }

  destroyAllStores(): void {
    this.stores.forEach((store) => store.destroy());
    this.stores.clear();
  }
}

// 全局实例
export const globalStateManager = new GlobalStateManager();

/**
 * 使用全局状态的Hook
 */
export function useGlobalState<T>(
  key: string,
  initialState: T,
  persist = false
): [T, (updater: T | StateUpdater<T>) => void] {
  const store = useMemo(() => {
    const existingStore = globalStateManager.getStore<T>(key);
    if (existingStore) {
      return existingStore;
    }

    return persist
      ? globalStateManager.createPersistedStore(key, initialState)
      : globalStateManager.createStore(key, initialState);
  }, [key, initialState, persist]);

  return useStore(store);
}

/**
 * 使用全局状态选择器的Hook
 */
export function useGlobalStateSelector<T, R>(
  key: string,
  selector: StateSelector<T, R>,
  equalityFn?: (a: R, b: R) => boolean
): R | undefined {
  const store = globalStateManager.getStore<T>(key);
  
  const selectedState = useMemo(() => {
    if (!store) return undefined;
    return selector(store.getState());
  }, [store, selector]);

  const [state, setState] = useState(selectedState);

  useEffect(() => {
    if (!store) return;

    const unsubscribe = store.subscribe((newState) => {
      const newSelectedState = selector(newState);
      
      if (equalityFn) {
        if (state !== undefined && !equalityFn(state, newSelectedState)) {
          setState(newSelectedState);
        }
      } else if (state !== newSelectedState) {
        setState(newSelectedState);
      }
    });

    return unsubscribe;
  }, [store, selector, state, equalityFn]);

  return state;
}

/**
 * 常用的状态管理模式
 */

// 用户状态
export interface UserState {
  user: any | null;
  isAuthenticated: boolean;
  permissions: string[];
}

export const userStore = globalStateManager.createPersistedStore<UserState>('user', {
  user: null,
  isAuthenticated: false,
  permissions: [],
});

// 应用设置状态
export interface AppSettingsState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  sidebarCollapsed: boolean;
}

export const appSettingsStore = globalStateManager.createPersistedStore<AppSettingsState>('appSettings', {
  theme: 'auto',
  language: 'zh-CN',
  sidebarCollapsed: false,
});

// 导出常用的hooks
export const useUserState = () => useStore(userStore);
export const useAppSettings = () => useStore(appSettingsStore);
