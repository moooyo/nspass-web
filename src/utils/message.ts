'use client';

import { message as antdMessage } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';

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

// 兼容性函数 - 用于替换已删除的 handleApiResponse
export const handleApiResponse = {
  fetch: <T>(response: any, operation: string) => {
    if (!response.success) {
      message.error(`${operation}失败: ${response.message || '未知错误'}`);
    }
    return response;
  },
  handle: (response: any, options: any) => {
    if (response.success) {
      if (options.forceShowSuccess) {
        message.success(`${options.operation}成功`);
      }
    } else {
      message.error(`${options.operation}失败: ${response.message || '未知错误'}`);
    }
    return response;
  },
  userAction: <T>(response: any, operation: string, operationType?: any) => {
    if (response.success) {
      message.success(`${operation}成功`);
    } else {
      message.error(`${operation}失败: ${response.message || '未知错误'}`);
    }
    return response;
  }
};

// 兼容性枚举
export const OperationType = {
  FETCH: 'FETCH',
  SAVE: 'SAVE',
  DELETE: 'DELETE',
  START: 'START',
  STOP: 'STOP'
};