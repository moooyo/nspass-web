// 导入现代化消息系统
import { message as modernMessage, apiMessage as modernApiMessage } from './modern-message';

// 重新导出现代化消息系统以保持向后兼容
export { message, apiMessage } from './modern-message';

// 初始化函数（保持向后兼容，但现在是空操作）
export function initMessage(_instance: any) {
  // 不再需要初始化，Sonner 会自动处理
}

// 兼容性函数 - 用于替换已删除的 handleApiResponse
export const handleApiResponse = {
  fetch: <T>(response: any, operation: string) => {
    if (!response.success) {
      modernApiMessage.error(operation, undefined, response.message || '未知错误');
    }
    return response;
  },
  handle: (response: any, options: any) => {
    if (response.success) {
      if (options.forceShowSuccess) {
        modernApiMessage.success(options.operation);
      }
    } else {
      modernApiMessage.error(options.operation, undefined, response.message || '未知错误');
    }
    return response;
  },
  userAction: <T>(response: any, operation: string, operationType?: any) => {
    if (response.success) {
      modernApiMessage.success(operation);
    } else {
      modernApiMessage.error(operation, undefined, response.message || '未知错误');
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