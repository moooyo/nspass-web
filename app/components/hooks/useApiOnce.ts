import { useEffect, useRef } from 'react';

/**
 * 自定义Hook，确保API调用只执行一次
 * 用于解决组件缓存导致的重复API调用问题
 */
export function useApiOnce(apiCall: () => Promise<void> | void) {
  const executedRef = useRef(false);
  const executingRef = useRef(false);

  useEffect(() => {
    if (executedRef.current || executingRef.current) {
      return;
    }

    const executeApi = async () => {
      try {
        executingRef.current = true;
        await apiCall();
        executedRef.current = true;
      } catch (error) {
        console.error('API调用失败:', error);
        // 如果API调用失败，允许下次重试
        executedRef.current = false;
      } finally {
        executingRef.current = false;
      }
    };

    executeApi();
  }, [apiCall]);

  return {
    isExecuted: executedRef.current,
    reset: () => {
      executedRef.current = false;
      executingRef.current = false;
    }
  };
}

/**
 * 组件初始化Hook
 * 确保某个函数只在组件真正初始化时执行一次
 */
export function useComponentInit(initFunction: () => void | Promise<void>) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      try {
        const result = initFunction();
        
        // 如果返回Promise，处理错误
        if (result && typeof result.catch === 'function') {
          result.catch((error) => {
            console.error('组件初始化失败:', error);
            // 初始化失败时，允许下次重试
            initRef.current = false;
          });
        }
      } catch (error) {
        console.error('组件初始化失败:', error);
        initRef.current = false;
      }
    }
  }, [initFunction]);

  return initRef.current;
} 