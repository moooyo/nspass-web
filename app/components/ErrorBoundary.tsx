'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 过滤掉 React 19 兼容性相关的错误
    const isReact19CompatibilityError = error.message.includes('Fragment') || 
                                      error.message.includes('autoFocus') ||
                                      error.message.includes('React.Fragment can only have');
    
    if (isReact19CompatibilityError) {
      console.warn('React 19 兼容性警告被忽略:', error.message);
      // 重置错误状态，继续渲染
      this.setState({ hasError: false, error: undefined });
      return;
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const isReact19CompatibilityError = this.state.error.message.includes('Fragment') || 
                                        this.state.error.message.includes('autoFocus') ||
                                        this.state.error.message.includes('React.Fragment can only have');
      
      if (isReact19CompatibilityError) {
        // 对于 React 19 兼容性问题，直接渲染子组件
        return this.props.children;
      }

      // 对于其他错误，显示错误页面
      return (
        <Result
          status="error"
          title="发生了错误"
          subTitle="抱歉，页面发生了意外错误。"
          extra={[
            <Button type="primary" key="retry" onClick={() => this.setState({ hasError: false, error: undefined })}>
              重试
            </Button>,
            <Button key="reload" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 