import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from '@/utils/message';
import type { StandardApiResponse } from '@/services/base';
import type { 
  BatchOperationResult, 
  PaginationMeta, 
  UseApiHookResult, 
  UseTableHookResult, 
  OperationResult 
} from '@/types/index';

/**
 * 通用的 API 调用 Hook
 */
export function useApi<T>(
  apiCall: () => Promise<StandardApiResponse<T>>,
  deps: any[] = []
): UseApiHookResult<T> {
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
      
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(new Error(response.message || 'API 调用失败'));
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      setError(err instanceof Error ? err : new Error('未知错误'));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
 * 分页数据 Hook
 */
export function usePaginatedApi<T>(
  apiCall: (page: number, pageSize: number, params?: any) => Promise<StandardApiResponse<T[]>>,
  initialPageSize: number = 10,
  deps: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0
  });
  const [params, setParams] = useState<any>({});
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (page?: number, pageSize?: number, searchParams?: any) => {
    if (!mountedRef.current) return;
    
    const currentPage = page || pagination.current;
    const currentPageSize = pageSize || pagination.pageSize;
    const currentParams = searchParams || params;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(currentPage, currentPageSize, currentParams);
      
      if (!mountedRef.current) return;
      
      if (response.success) {
        setData(response.data || []);
        setPagination(response.pagination || {
          current: currentPage,
          pageSize: currentPageSize,
          total: response.total || (response.data?.length || 0),
          totalPages: Math.ceil((response.total || 0) / currentPageSize)
        });
      } else {
        setError(new Error(response.message || 'API 调用失败'));
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      setError(err instanceof Error ? err : new Error('未知错误'));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, pagination.current, pagination.pageSize, params, ...deps]);

  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    fetchData(page, pageSize);
  }, [fetchData]);

  const handleSearch = useCallback((searchParams: any) => {
    setParams(searchParams);
    fetchData(1, undefined, searchParams);
  }, [fetchData]);

  const reload = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    handleSearch
  };
}

/**
 * 表格数据管理 Hook
 */
export function useTable<T>(
  service: {
    getList: (params?: any) => Promise<StandardApiResponse<T[]>>;
    create: (data: any) => Promise<StandardApiResponse<T>>;
    update: (id: string | number, data: any) => Promise<StandardApiResponse<T>>;
    delete: (id: string | number) => Promise<StandardApiResponse<void>>;
    batchDelete: (ids: (string | number)[]) => Promise<StandardApiResponse<void>>;
  },
  initialPageSize: number = 10
): UseTableHookResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0
  });
  const mountedRef = useRef(true);

  const reload = useCallback(async (page?: number, pageSize?: number, params?: any) => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await service.getList({
        page: page || pagination.current,
        pageSize: pageSize || pagination.pageSize,
        ...params
      });
      
      if (!mountedRef.current) return;
      
      if (response.success) {
        setData(response.data || []);
        setPagination(response.pagination || {
          current: page || pagination.current,
          pageSize: pageSize || pagination.pageSize,
          total: response.total || (response.data?.length || 0),
          totalPages: Math.ceil((response.total || 0) / (pageSize || pagination.pageSize))
        });
      } else {
        setError(new Error(response.message || 'API 调用失败'));
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      setError(err instanceof Error ? err : new Error('未知错误'));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [service, pagination.current, pagination.pageSize]);

  const create = useCallback(async (data: any): Promise<OperationResult<T>> => {
    try {
      const response = await service.create(data);
      
      if (response.success) {
        await reload();
        message.success('创建成功');
        return { success: true, message: '创建成功', data: response.data };
      } else {
        message.error(response.message || '创建失败');
        return { success: false, message: response.message || '创建失败' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建失败';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [service, reload]);

  const update = useCallback(async (id: string | number, data: any): Promise<OperationResult<T>> => {
    try {
      const response = await service.update(id, data);
      
      if (response.success) {
        await reload();
        message.success('更新成功');
        return { success: true, message: '更新成功', data: response.data };
      } else {
        message.error(response.message || '更新失败');
        return { success: false, message: response.message || '更新失败' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新失败';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [service, reload]);

  const deleteItem = useCallback(async (id: string | number): Promise<OperationResult<void>> => {
    try {
      const response = await service.delete(id);
      
      if (response.success) {
        await reload();
        message.success('删除成功');
        return { success: true, message: '删除成功' };
      } else {
        message.error(response.message || '删除失败');
        return { success: false, message: response.message || '删除失败' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除失败';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [service, reload]);

  const batchDelete = useCallback(async (ids: (string | number)[]): Promise<BatchOperationResult<void>> => {
    try {
      const response = await service.batchDelete(ids);
      
      if (response.success) {
        await reload();
        message.success(`成功删除 ${ids.length} 项`);
        return { 
          success: true, 
          message: `成功删除 ${ids.length} 项`, 
          successCount: ids.length,
          failedCount: 0 
        };
      } else {
        message.error(response.message || '批量删除失败');
        return { 
          success: false, 
          message: response.message || '批量删除失败',
          successCount: 0,
          failedCount: ids.length 
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量删除失败';
      message.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        successCount: 0,
        failedCount: ids.length 
      };
    }
  }, [service, reload]);

  useEffect(() => {
    reload();
  }, []);

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
    create,
    update,
    delete: deleteItem,
    batchDelete
  };
}

/**
 * 表单状态管理 Hook
 */
export function useFormState<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [errors]);

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
  }, [initialValues]);

  const isFieldValid = useCallback((field: keyof T) => {
    return !errors[field as string];
  }, [errors]);

  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

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
    isFormValid
  };
}

/**
 * 本地存储 Hook
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
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
 * 节流 Hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
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
 * 复制到剪贴板 Hook
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      message.success('复制成功');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      message.error('复制失败');
    }
  }, []);

  return { copied, copy };
}
