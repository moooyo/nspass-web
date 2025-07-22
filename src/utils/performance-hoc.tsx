/**
 * React 性能优化 HOC 和 Hooks
 * 提供常用的性能优化模式
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

// 深度比较的 memo
export function deepMemo<T extends React.ComponentType<any>>(
  component: T,
  compare?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
): React.MemoExoticComponent<T> {
  const defaultCompare = (prevProps: any, nextProps: any) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  };
  
  return memo(component, compare || defaultCompare);
}

// 防止不必要的重渲染的 props 优化
export function useStableProps<T extends Record<string, any>>(props: T): T {
  const stablePropsRef = useRef<T>(props);
  
  return useMemo(() => {
    let hasChanged = false;
    const newProps = { ...props };
    
    for (const key in props) {
      if (stablePropsRef.current[key] !== props[key]) {
        hasChanged = true;
        break;
      }
    }
    
    if (hasChanged) {
      stablePropsRef.current = newProps;
    }
    
    return stablePropsRef.current;
  }, [props]);
}

// 防抖 Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

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

// 节流 Hook
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const lastExecuted = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastExecuted.current >= delay) {
      lastExecuted.current = now;
      return fn(...args);
    }
  }, [fn, delay]) as T;
}

// 虚拟滚动优化 Hook
export function useVirtualization({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );
  
  const paddingTop = visibleStart * itemHeight;
  const paddingBottom = (items.length - visibleEnd - 1) * itemHeight;
  
  const visibleItems = items.slice(
    Math.max(0, visibleStart - overscan),
    Math.min(items.length, visibleEnd + 1 + overscan)
  );
  
  return {
    visibleItems,
    paddingTop,
    paddingBottom,
    setScrollTop,
  };
}

// 懒加载图片组件
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder?: string;
  threshold?: number;
}

export const LazyImage = memo<LazyImageProps>(({
  src,
  placeholder = '',
  threshold = 0.1,
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageRef || !('IntersectionObserver' in window)) {
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(imageRef);
        }
      },
      { threshold }
    );

    observer.observe(imageRef);

    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, threshold]);

  return (
    <img
      {...props}
      ref={setImageRef}
      src={imageSrc}
    />
  );
});

LazyImage.displayName = 'LazyImage';

// 错误边界组件
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// 代码分割加载组件
export function createAsyncComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  FallbackComponent: React.ComponentType = () => <div>Loading...</div>
) {
  const LazyComponent = React.lazy(importFn);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...(props as any)} ref={ref} />
    </React.Suspense>
  ));
}

// 组件卸载检测 Hook
export function useIsMounted() {
  const isMountedRef = useRef(false);
  const isMounted = useCallback(() => isMountedRef.current, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMounted;
}

// 表单优化 Hook
export function useOptimizedForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [touched, setTouched] = React.useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  
  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const setFieldTouched = useCallback((key: keyof T) => {
    setTouched(prev => ({ ...prev, [key]: true }));
  }, []);
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);
  
  return {
    values,
    touched,
    setValue,
    setFieldTouched,
    resetForm,
  };
}

export default {
  deepMemo,
  useStableProps,
  useDebounce,
  useThrottle,
  useVirtualization,
  LazyImage,
  ErrorBoundary,
  createAsyncComponent,
  useIsMounted,
  useOptimizedForm,
};
