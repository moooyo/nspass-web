/**
 * 统一错误处理工具
 * 提供标准化的错误处理、日志记录和用户提示
 */

import { message } from 'antd';
import { logger } from './logger';

export interface ErrorInfo {
  code?: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: number;
  context?: string;
}

export interface ErrorHandlerOptions {
  showMessage?: boolean;
  logError?: boolean;
  context?: string;
  fallbackMessage?: string;
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 自定义错误类
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly type: ErrorType;
  public readonly details?: any;
  public readonly timestamp: number;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code || type;
    this.details = details;
    this.timestamp = Date.now();

    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * 错误处理器类
 */
class ErrorHandler {
  private errorQueue: ErrorInfo[] = [];
  private maxQueueSize = 100;

  /**
   * 处理错误
   */
  handle(error: unknown, options: ErrorHandlerOptions = {}): ErrorInfo {
    const {
      showMessage = true,
      logError = true,
      context = 'Unknown',
      fallbackMessage = '操作失败，请稍后重试'
    } = options;

    const errorInfo = this.parseError(error, context);

    // 记录错误
    if (logError) {
      this.logError(errorInfo);
    }

    // 显示用户消息
    if (showMessage) {
      this.showUserMessage(errorInfo, fallbackMessage);
    }

    // 添加到错误队列
    this.addToQueue(errorInfo);

    return errorInfo;
  }

  /**
   * 解析错误对象
   */
  private parseError(error: unknown, context: string): ErrorInfo {
    const timestamp = Date.now();

    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack,
        timestamp,
        context,
      };
    }

    if (error instanceof Error) {
      return {
        code: error.name,
        message: error.message,
        stack: error.stack,
        timestamp,
        context,
      };
    }

    // 处理网络错误
    if (typeof error === 'object' && error !== null) {
      const err = error as any;
      
      // Axios错误
      if (err.isAxiosError) {
        return {
          code: err.code || 'NETWORK_ERROR',
          message: this.getNetworkErrorMessage(err),
          details: {
            status: err.response?.status,
            statusText: err.response?.statusText,
            url: err.config?.url,
            method: err.config?.method,
          },
          timestamp,
          context,
        };
      }

      // 标准API响应错误
      if (err.status && !err.status.success) {
        return {
          code: err.status.errorCode || 'API_ERROR',
          message: err.status.message || '服务器错误',
          details: err,
          timestamp,
          context,
        };
      }
    }

    // 字符串错误
    if (typeof error === 'string') {
      return {
        message: error,
        timestamp,
        context,
      };
    }

    // 未知错误
    return {
      code: 'UNKNOWN_ERROR',
      message: '未知错误',
      details: error,
      timestamp,
      context,
    };
  }

  /**
   * 获取网络错误消息
   */
  private getNetworkErrorMessage(error: any): string {
    if (error.code === 'NETWORK_ERROR') {
      return '网络连接失败，请检查网络设置';
    }

    if (error.code === 'ECONNABORTED') {
      return '请求超时，请稍后重试';
    }

    const status = error.response?.status;
    if (status) {
      switch (status) {
        case 400:
          return '请求参数错误';
        case 401:
          return '未授权访问，请重新登录';
        case 403:
          return '权限不足，无法访问';
        case 404:
          return '请求的资源不存在';
        case 429:
          return '请求过于频繁，请稍后重试';
        case 500:
          return '服务器内部错误';
        case 502:
          return '网关错误';
        case 503:
          return '服务暂时不可用';
        case 504:
          return '网关超时';
        default:
          return `服务器错误 (${status})`;
      }
    }

    return error.message || '网络请求失败';
  }

  /**
   * 记录错误日志
   */
  private logError(errorInfo: ErrorInfo): void {
    const logMessage = `[${errorInfo.context}] ${errorInfo.message}`;
    
    if (errorInfo.code?.includes('NETWORK') || errorInfo.code?.includes('API')) {
      logger.warn(logMessage, errorInfo);
    } else {
      logger.error(logMessage, errorInfo);
    }
  }

  /**
   * 显示用户消息
   */
  private showUserMessage(errorInfo: ErrorInfo, fallbackMessage: string): void {
    const userMessage = this.getUserFriendlyMessage(errorInfo, fallbackMessage);
    
    // 根据错误类型选择不同的消息类型
    if (errorInfo.code?.includes('VALIDATION')) {
      message.warning(userMessage);
    } else if (errorInfo.code?.includes('AUTH')) {
      message.error(userMessage);
    } else {
      message.error(userMessage);
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  private getUserFriendlyMessage(errorInfo: ErrorInfo, fallbackMessage: string): string {
    // 如果错误消息已经是用户友好的，直接返回
    if (this.isUserFriendlyMessage(errorInfo.message)) {
      return errorInfo.message;
    }

    // 根据错误代码返回预定义的用户友好消息
    const friendlyMessages: Record<string, string> = {
      'NETWORK_ERROR': '网络连接失败，请检查网络设置',
      'TIMEOUT': '请求超时，请稍后重试',
      'VALIDATION_ERROR': '输入信息有误，请检查后重试',
      'AUTHENTICATION_ERROR': '登录已过期，请重新登录',
      'AUTHORIZATION_ERROR': '权限不足，无法执行此操作',
      'NOT_FOUND': '请求的资源不存在',
      'SERVER_ERROR': '服务器暂时不可用，请稍后重试',
    };

    return friendlyMessages[errorInfo.code || ''] || fallbackMessage;
  }

  /**
   * 判断消息是否用户友好
   */
  private isUserFriendlyMessage(message: string): boolean {
    // 简单的启发式判断：包含中文或常见用户友好词汇
    const userFriendlyPatterns = [
      /[\u4e00-\u9fa5]/, // 中文字符
      /请|请求|失败|成功|错误|警告|提示/,
      /network|timeout|validation|authentication|authorization/i,
    ];

    return userFriendlyPatterns.some(pattern => pattern.test(message));
  }

  /**
   * 添加到错误队列
   */
  private addToQueue(errorInfo: ErrorInfo): void {
    this.errorQueue.push(errorInfo);
    
    // 保持队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorQueue];
  }

  /**
   * 清空错误历史
   */
  clearErrorHistory(): void {
    this.errorQueue = [];
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    recent: ErrorInfo[];
  } {
    const byType: Record<string, number> = {};
    
    this.errorQueue.forEach(error => {
      const type = error.code || 'UNKNOWN';
      byType[type] = (byType[type] || 0) + 1;
    });

    const recent = this.errorQueue
      .filter(error => Date.now() - error.timestamp < 5 * 60 * 1000) // 最近5分钟
      .slice(-10); // 最多10条

    return {
      total: this.errorQueue.length,
      byType,
      recent,
    };
  }
}

// 全局错误处理器实例
export const errorHandler = new ErrorHandler();

/**
 * 便捷的错误处理函数
 */
export function handleError(
  error: unknown,
  options?: ErrorHandlerOptions
): ErrorInfo {
  return errorHandler.handle(error, options);
}

/**
 * 创建特定上下文的错误处理函数
 */
export function createErrorHandler(context: string) {
  return (error: unknown, options: Omit<ErrorHandlerOptions, 'context'> = {}) => {
    return errorHandler.handle(error, { ...options, context });
  };
}

/**
 * 异步操作错误处理装饰器
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, { context: context || fn.name });
      throw error; // 重新抛出错误，让调用者决定如何处理
    }
  }) as T;
}

export default errorHandler;
