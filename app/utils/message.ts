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
  // 如果没有实例，使用静态方法（不推荐，会有警告）
  return antdMessage;
}

// 消息 API
export const message = {
  success: (content: string, duration?: number) => getInstance().success(content, duration),
  error: (content: string, duration?: number) => getInstance().error(content, duration),
  info: (content: string, duration?: number) => getInstance().info(content, duration),
  warning: (content: string, duration?: number) => getInstance().warning(content, duration),
  loading: (content: string, duration?: number) => getInstance().loading(content, duration),
};

// 统一的数据加载处理函数
export const handleDataResponse = {
  /**
   * 处理数据加载成功
   * @param operation 操作名称，如 '获取用户信息'、'加载线路数据' 等
   * @param response 响应数据
   * @param showSuccessMessage 是否显示成功提示（默认为 false）
   */
  success: (operation: string, response?: { message?: string }, showSuccessMessage: boolean = false) => {
    const successMsg = response?.message || `${operation}成功`;
    
    // 只在console打印日志
    console.log(`✓ ${successMsg}`);
    
    // 只有在明确要求时才显示成功通知（比如用户手动保存操作）
    if (showSuccessMessage) {
      message.success(successMsg);
    }
  },

  /**
   * 处理数据加载失败
   * @param operation 操作名称，如 '获取用户信息'、'加载线路数据' 等
   * @param error 错误信息或错误对象
   * @param response 响应数据（可选）
   */
  error: (operation: string, error?: string | Error | unknown, response?: { message?: string }) => {
    let errorMsg: string;
    
    if (response?.message) {
      errorMsg = response.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    } else if (error instanceof Error) {
      errorMsg = error.message;
    } else {
      errorMsg = `${operation}失败`;
    }

    // 在console打印详细错误信息
    console.error(`✗ ${operation}失败:`, error);
    
    // 显示用户友好的错误提示
    message.error(errorMsg);
  },

  /**
   * 处理用户操作（如保存、创建、删除等），这些操作默认显示成功提示
   * @param operation 操作名称
   * @param success 是否成功
   * @param response 响应数据
   * @param error 错误信息（失败时）
   */
  userAction: (
    operation: string, 
    success: boolean, 
    response?: { message?: string }, 
    error?: string | Error | unknown
  ) => {
    if (success) {
      handleDataResponse.success(operation, response, true); // 用户操作成功时显示提示
    } else {
      handleDataResponse.error(operation, error, response);
    }
  }
}; 