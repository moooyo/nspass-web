/**
 * 统一的Hooks库
 * 整合和优化项目中的自定义Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  StandardApiResponse, 
  Pagination, 
  OperationResult, 
  BatchOperationResult,
  UseApiHookResult,
  UseTableHookResult,
  FormState,
  QueryParams
} from '../types/common';
import { PAGINATION_CONFIG, DEBOUNCE_CONFIG } from '../constants';
import { apiUtils } from '../utils';

/**
 * 通用API调用Hook
 * 处理loading、error、data状态
 */
export function useApi<T>(
  apiCall: () => Promise<StandardApiResponse<T>>,
  deps: unknown[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
): UseApiHookResult<T> {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (!mountedRef.current) return;
      
      const result = apiUtils.handleResponse(response);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);
      onError?.(error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError, deps]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * 分页数据Hook
 * 处理分页、搜索、排序等功能
 */
export function usePaginatedApi<T>(
  apiCall: (params: QueryParams) => Promise<StandardApiResponse<T[]>>,
  options: {
    initialPageSize?: number;
    immediate?: boolean;
    onSuccess?: (data: T[], pagination: Pagination) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { 
    initialPageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    immediate = true,
    onSuccess,
    onError 
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
    showSizeChanger: PAGINATION_CONFIG.SHOW_SIZE_CHANGER,
    showQuickJumper: PAGINATION_CONFIG.SHOW_QUICK_JUMPER,
    showTotal: PAGINATION_CONFIG.SHOW_TOTAL,
  });
  const [params, setParams] = useState<QueryParams>({});
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (queryParams?: Partial<QueryParams>) => {
    if (!mountedRef.current) return;
    
    const finalParams = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...params,
      ...queryParams,
    };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(finalParams);
      
      if (!mountedRef.current) return;
      
      const result = apiUtils.handleResponse(response);
      setData(result);
      
      const newPagination = {
        ...pagination,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / pagination.pageSize),
        ...queryParams,
      };
      setPagination(newPagination);
      
      onSuccess?.(result, newPagination);
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);
      onError?.(error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, pagination.current, pagination.pageSize, params, onSuccess, onError]);

  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    const newPagination = {
      current: page,
      pageSize: pageSize || pagination.pageSize,
    };
    setPagination(prev => ({ ...prev, ...newPagination }));
    fetchData(newPagination);
  }, [fetchData, pagination.pageSize]);

  const handleSearch = useCallback((searchParams: Partial<QueryParams>) => {
    setParams(prev => ({ ...prev, ...searchParams }));
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({ page: 1, ...searchParams });
  }, [fetchData]);

  const reload = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    reload,
    handlePageChange,
    handleSearch,
    setParams,
  };
}

/**
 * 表格数据管理Hook
 * 提供CRUD操作的完整解决方案
 */
export function useTable<T>(
  service: {
    getList: (params?: QueryParams) => Promise<StandardApiResponse<T[]>>;
    create: (data: Record<string, unknown>) => Promise<StandardApiResponse<T>>;
    update: (id: string | number, data: Record<string, unknown>) => Promise<StandardApiResponse<T>>;
    delete: (id: string | number) => Promise<StandardApiResponse<void>>;
    batchDelete?: (ids: (string | number)[]) => Promise<StandardApiResponse<void>>;
  },
  options: {
    initialPageSize?: number;
    immediate?: boolean;
  } = {}
): UseTableHookResult<T> {
  const { initialPageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, immediate = true } = options;
  
  const {
    data,
    loading,
    error,
    pagination,
    reload,
    handlePageChange,
    handleSearch,
  } = usePaginatedApi(service.getList, { initialPageSize, immediate });

  const create = useCallback(async (data: Record<string, unknown>): Promise<OperationResult<T>> => {
    try {
      const response = await service.create(data);
      apiUtils.handleResponse(response);
      apiUtils.showSuccess('创建成功');
      reload();
      return { success: true, data: response.data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('创建失败');
      apiUtils.showError(err);
      return { success: false, message: err.message };
    }
  }, [service, reload]);

  const update = useCallback(async (id: string | number, data: Record<string, unknown>): Promise<OperationResult<T>> => {
    try {
      const response = await service.update(id, data);
      apiUtils.handleResponse(response);
      apiUtils.showSuccess('更新成功');
      reload();
      return { success: true, data: response.data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('更新失败');
      apiUtils.showError(err);
      return { success: false, message: err.message };
    }
  }, [service, reload]);

  const deleteItem = useCallback(async (id: string | number): Promise<OperationResult<void>> => {
    try {
      const response = await service.delete(id);
      apiUtils.handleResponse(response);
      apiUtils.showSuccess('删除成功');
      reload();
      return { success: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('删除失败');
      apiUtils.showError(err);
      return { success: false, message: err.message };
    }
  }, [service, reload]);

  const batchDelete = useCallback(async (ids: (string | number)[]): Promise<BatchOperationResult> => {
    if (!service.batchDelete) {
      return {
        success: false,
        successCount: 0,
        failureCount: ids.length,
        failures: ids.map(id => ({ id, message: '不支持批量删除' })),
      };
    }

    try {
      const response = await service.batchDelete(ids);
      apiUtils.handleResponse(response);
      apiUtils.showSuccess(`批量删除成功，共删除 ${ids.length} 项`);
      reload();
      return {
        success: true,
        successCount: ids.length,
        failureCount: 0,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('批量删除失败');
      apiUtils.showError(err);
      return {
        success: false,
        successCount: 0,
        failureCount: ids.length,
        failures: ids.map(id => ({ id, message: err.message })),
      };
    }
  }, [service, reload]);

  return {
    data,
    loading,
    error,
    pagination,
    reload,
    create,
    update,
    delete: deleteItem,
    batchDelete,
    handlePageChange,
    handleSearch,
  };
}

/**
 * 表单状态管理Hook
 * 提供表单验证、错误处理等功能
 */
export function useFormState<T extends Record<string, unknown>>(
  initialValues: T,
  validators?: Partial<Record<keyof T, (value: unknown) => string | undefined>>
): FormState<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // 清除该字段的错误
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }

    // 如果有验证器，立即验证
    if (validators?.[field]) {
      const error = validators[field]!(value);
      if (error) {
        setErrors(prev => ({ ...prev, [field as string]: error }));
      }
    }
  }, [errors, validators]);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field as string]: isTouched }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearTouched = useCallback(() => {
    setTouched({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setLoading(false);
  }, [initialValues]);

  const isFieldValid = useCallback((field: keyof T) => {
    return !errors[field as string];
  }, [errors]);

  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const validate = useCallback(() => {
    if (!validators) return true;

    const newErrors: Record<string, string> = {};
    
    Object.keys(validators).forEach(field => {
      const validator = validators[field as keyof T];
      if (validator) {
        const error = validator(values[field as keyof T]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validators, values]);

  return {
    values,
    errors,
    touched,
    loading,
    setLoading,
    setValue,
    setFieldTouched,
    setFieldError,
    clearErrors,
    clearTouched,
    reset,
    isFieldValid,
    isFormValid,
    validate,
  };
}

/**
 * 防抖Hook
 */
export function useDebounce<T>(
  value: T, 
  delay: number = DEBOUNCE_CONFIG.DEFAULT_DELAY
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流Hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = DEBOUNCE_CONFIG.DEFAULT_DELAY
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        fn(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [fn, delay]
  );
}

/**
 * 本地存储Hook
 * 自动同步状态到localStorage
 */
export function useLocalStorage<T>(
  key: string, 
  initialValue: T,
  options: {
    serializer?: {
      parse: (value: string) => T;
      stringify: (value: T) => string;
    };
  } = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const { serializer = JSON } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      
      const item = window.localStorage.getItem(key);
      return item ? serializer.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serializer.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serializer, storedValue]);

  return [storedValue, setValue];
}

/**
 * 窗口尺寸Hook
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * 组件挂载状态Hook
 * 防止内存泄漏
 */
export function useMountedState(): () => boolean {
  const mountedRef = useRef(false);
  const isMounted = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return isMounted;
}

/**
 * 上一个值Hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * 强制更新Hook
 */
export function useForceUpdate(): () => void {
  const [, setTick] = useState(0);
  
  return useCallback(() => {
    setTick(tick => tick + 1);
  }, []);
}

/**
 * 计数器Hook
 */
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(x => x + 1), []);
  const decrement = useCallback(() => setCount(x => x - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  const set = useCallback((value: number) => setCount(value), []);

  return {
    count,
    increment,
    decrement,
    reset,
    set,
  };
}

/**
 * 切换Hook
 */
export function useToggle(
  initialValue = false
): [boolean, (value?: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback((newValue?: boolean) => {
    setValue(prev => newValue !== undefined ? newValue : !prev);
  }, []);

  return [value, toggle];
}
