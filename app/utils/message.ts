'use client';

import { message as antdMessage } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { ApiResponseHandler, OperationType, type ResponseHandlerOptions } from './api-response-handler';
import type { ApiResponse } from './http-client';

let messageInstance: MessageInstance | null = null;

// 初始化消息实例
export function initMessage(instance: MessageInstance) {
  messageInstance = instance;
}

// 获取消息实例
function getInstance(): MessageInstance {
  if (messageInstance) {
    return messageInstance;
  }
  return antdMessage;
}

// 消息 API
export const message = {
  success: (content: string, duration?: number) => getInstance().success(content, duration),
  error: (content: string, duration?: number) => getInstance().error(content, duration),
  info: (content: string, duration?: number) => getInstance().info(content, duration),
  warning: (content: string, duration?: number) => getInstance().warning(content, duration),
  loading: (content: string, duration?: number) => getInstance().loading(content, duration),
  destroy: () => getInstance().destroy(),
};

// 导出类型和处理器
export { ApiResponseHandler, OperationType };
export type { ResponseHandlerOptions };

// API响应处理函数
export const handleApiResponse = {
  /**
   * 处理API响应 - 完整版本
   */
  handle: <T>(response: ApiResponse<T>, options: ResponseHandlerOptions) => {
    return ApiResponseHandler.handle(response, options);
  },

  /**
   * 处理异步API操作
   */
  handleAsync: <T>(asyncOperation: Promise<ApiResponse<T>>, options: ResponseHandlerOptions) => {
    return ApiResponseHandler.handleAsync(asyncOperation, options);
  },

  /**
   * 处理数据获取操作（不显示成功提示）
   */
  fetch: <T>(response: ApiResponse<T>, operation: string) => {
    return ApiResponseHandler.fetch(response, operation);
  },

  /**
   * 处理用户操作（显示成功提示）
   */
  userAction: <T>(response: ApiResponse<T>, operation: string, operationType: OperationType = OperationType.SAVE) => {
    return ApiResponseHandler.userAction(response, operation, operationType);
  },
}; 