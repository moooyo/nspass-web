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