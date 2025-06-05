'use client';

import React from 'react';

// 创建一个高阶组件来处理 ProComponents 的兼容性问题
export function withProCompat<P extends object>(Component: React.ComponentType<P>) {
  return React.forwardRef<any, P>((props, ref) => {
    // 过滤掉可能导致问题的属性
    const filteredProps = React.useMemo(() => {
      const filtered = { ...props } as any;
      
      // 移除可能导致 Fragment 错误的属性
      delete filtered.autoFocus;
      delete filtered.fragment;
      
      return filtered;
    }, [props]);

    // 捕获并处理渲染错误
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      if (hasError) {
        // 重置错误状态
        const timer = setTimeout(() => setHasError(false), 100);
        return () => clearTimeout(timer);
      }
    }, [hasError]);

    try {
      return <Component {...filteredProps} ref={ref} />;
    } catch (error: any) {
      if (error?.message?.includes('Fragment') || error?.message?.includes('autoFocus')) {
        console.warn('ProComponents React 19 兼容性错误被忽略:', error.message);
        setHasError(true);
        return <div key={Math.random()}><Component {...filteredProps} ref={ref} /></div>;
      }
      throw error;
    }
  });
}

// 错误恢复组件
export function ProErrorFallback({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Fragment') || 
          event.error?.message?.includes('autoFocus') ||
          event.error?.message?.includes('React.Fragment can only have')) {
        event.preventDefault();
        console.warn('ProComponents 兼容性错误被忽略:', event.error.message);
        return;
      }
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return <div>组件渲染错误，请刷新页面重试</div>;
  }

  return <>{children}</>;
} 