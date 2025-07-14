'use client';

import { message as antdMessage } from 'antd';
import type { ApiResponse } from './http-client';

// 错误码对应的中文提示（基于proto中的定义）
const ERROR_MESSAGES: Record<string, string> = {
  // 认证相关
  'UNAUTHORIZED': '用户未登录或登录已过期',
  'FORBIDDEN': '权限不足，无法访问该资源',
  'INVALID_TOKEN': '无效的访问令牌',
  'TOKEN_EXPIRED': '访问令牌已过期，请重新登录',
  
  // 请求相关
  'BAD_REQUEST': '请求参数错误',
  'NOT_FOUND': '请求的资源不存在',
  'METHOD_NOT_ALLOWED': '不支持的请求方法',
  'CONFLICT': '资源冲突',
  'VALIDATION_ERROR': '数据验证失败',
  
  // 服务器相关
  'INTERNAL_ERROR': '服务器内部错误',
  'SERVICE_UNAVAILABLE': '服务暂时不可用',
  'NETWORK_ERROR': '网络连接失败',
  'TIMEOUT': '请求超时',
  
  // 业务相关
  'USER_NOT_FOUND': '用户不存在',
  'USER_ALREADY_EXISTS': '用户已存在',
  'INVALID_CREDENTIALS': '用户名或密码错误',
  'RESOURCE_NOT_FOUND': '资源不存在',
  'INSUFFICIENT_PERMISSIONS': '权限不足',
  'OPERATION_FAILED': '操作失败',
  'DATA_NOT_FOUND': '数据不存在',
  'INVALID_OPERATION': '无效的操作',
  
  // 状态相关（基于proto的Status枚举）
  'STATUS_INACTIVE': '状态未激活',
  'STATUS_PENDING': '状态待处理',
  'STATUS_ERROR': '状态错误',
};

// HTTP状态码对应的中文提示
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '用户未登录或登录已过期',
  403: '权限不足，无法访问该资源',
  404: '请求的资源不存在',
  405: '不支持的请求方法',
  409: '资源冲突',
  422: '数据验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
};

// 操作类型枚举
export enum OperationType {
  // 数据获取类操作（不显示成功提示）
  FETCH = 'fetch',
  LOAD = 'load',
  GET = 'get',
  QUERY = 'query',
  
  // 用户操作类（显示成功提示）
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  SAVE = 'save',
  SUBMIT = 'submit',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  
  // 状态变更类操作
  ENABLE = 'enable',
  DISABLE = 'disable',
  START = 'start',
  STOP = 'stop',
  RESTART = 'restart',
  RESET = 'reset',
  
  // 认证相关操作
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  VERIFY = 'verify',
}

// 响应处理选项
export interface ResponseHandlerOptions {
  // 操作名称，如 '获取用户信息'、'保存配置' 等
  operation: string;
  // 操作类型，决定是否显示成功提示
  operationType?: OperationType;
  // 是否强制显示成功提示（覆盖operationType的默认行为）
  forceShowSuccess?: boolean;
  // 是否显示错误提示（默认为true）
  showError?: boolean;
  // 自定义成功消息
  customSuccessMessage?: string;
  // 自定义错误消息
  customErrorMessage?: string;
  // 错误时的回调函数
  onError?: (error: string) => void;
  // 成功时的回调函数
  onSuccess?: (data: any) => void;
}

export class ApiResponseHandler {
  /**
   * 统一处理API响应
   */
  static handle<T>(
    response: ApiResponse<T>, 
    options: ResponseHandlerOptions
  ): ApiResponse<T> {
    const {
      operation,
      operationType = OperationType.FETCH,
      forceShowSuccess = false,
      showError = true,
      customSuccessMessage,
      customErrorMessage,
      onError,
      onSuccess
    } = options;

    if (response.success) {
      return this.handleSuccess(response, {
        operation,
        operationType,
        forceShowSuccess,
        customSuccessMessage,
        onSuccess
      });
    } else {
      return this.handleError(response, {
        operation,
        showError,
        customErrorMessage,
        onError
      });
    }
  }

  /**
   * 处理成功响应
   */
  private static handleSuccess<T>(
    response: ApiResponse<T>,
    options: {
      operation: string;
      operationType: OperationType;
      forceShowSuccess: boolean;
      customSuccessMessage?: string;
      onSuccess?: (data: any) => void;
    }
  ): ApiResponse<T> {
    const { operation, operationType, forceShowSuccess, customSuccessMessage, onSuccess } = options;

    const shouldShowSuccess = forceShowSuccess || this.shouldShowSuccessMessage(operationType);
    
    if (shouldShowSuccess) {
      const successMessage = customSuccessMessage || 
        response.message || 
        this.getDefaultSuccessMessage(operation, operationType);
      
      antdMessage.success(successMessage);
    }

    console.log(`✓ ${operation}成功`, response.data);
    onSuccess?.(response.data);

    return response;
  }

  /**
   * 处理错误响应
   */
  private static handleError<T>(
    response: ApiResponse<T>,
    options: {
      operation: string;
      showError: boolean;
      customErrorMessage?: string;
      onError?: (error: string) => void;
    }
  ): ApiResponse<T> {
    const { operation, showError, customErrorMessage, onError } = options;

    const errorMessage = this.getErrorMessage(response, operation, customErrorMessage);

    console.error(`✗ ${operation}失败:`, {
      message: response.message,
      data: response.data,
      response
    });

    if (showError) {
      antdMessage.error(errorMessage);
    }

    onError?.(errorMessage);
    return response;
  }

  /**
   * 获取错误消息（支持proto的errorCode）
   */
  private static getErrorMessage<T>(
    response: ApiResponse<T>, 
    operation: string, 
    customErrorMessage?: string
  ): string {
    if (customErrorMessage) {
      return customErrorMessage;
    }

    if (response.message) {
      return response.message;
    }

    if (response.data && typeof response.data === 'object') {
      const data = response.data as any;
      
      if (data.errorCode && ERROR_MESSAGES[data.errorCode]) {
        return ERROR_MESSAGES[data.errorCode];
      }
      
      if (data.statusCode && HTTP_STATUS_MESSAGES[data.statusCode]) {
        return HTTP_STATUS_MESSAGES[data.statusCode];
      }
      
      if (data.error || data.message) {
        return data.error || data.message;
      }
    }

    return `${operation}失败，请稍后重试`;
  }

  /**
   * 获取默认成功消息
   */
  private static getDefaultSuccessMessage(operation: string, operationType: OperationType): string {
    const actionMap: Record<OperationType, string> = {
      [OperationType.CREATE]: '创建成功',
      [OperationType.UPDATE]: '更新成功',
      [OperationType.DELETE]: '删除成功',
      [OperationType.SAVE]: '保存成功',
      [OperationType.SUBMIT]: '提交成功',
      [OperationType.UPLOAD]: '上传成功',
      [OperationType.DOWNLOAD]: '下载成功',
      [OperationType.ENABLE]: '启用成功',
      [OperationType.DISABLE]: '禁用成功',
      [OperationType.START]: '启动成功',
      [OperationType.STOP]: '停止成功',
      [OperationType.RESTART]: '重启成功',
      [OperationType.RESET]: '重置成功',
      [OperationType.LOGIN]: '登录成功',
      [OperationType.LOGOUT]: '退出成功',
      [OperationType.REGISTER]: '注册成功',
      [OperationType.VERIFY]: '验证成功',
      [OperationType.FETCH]: '获取成功',
      [OperationType.LOAD]: '加载成功',
      [OperationType.GET]: '获取成功',
      [OperationType.QUERY]: '查询成功',
    };

    return actionMap[operationType] || `${operation}成功`;
  }

  /**
   * 判断是否应该显示成功消息
   */
  private static shouldShowSuccessMessage(operationType: OperationType): boolean {
    const silentOperations = [
      OperationType.FETCH,
      OperationType.LOAD,
      OperationType.GET,
      OperationType.QUERY
    ];

    return !silentOperations.includes(operationType);
  }

  /**
   * 数据获取操作的简化方法
   */
  static fetch<T>(response: ApiResponse<T>, operation: string): ApiResponse<T> {
    return this.handle(response, {
      operation,
      operationType: OperationType.FETCH
    });
  }

  /**
   * 用户操作的简化方法
   */
  static userAction<T>(
    response: ApiResponse<T>, 
    operation: string, 
    operationType: OperationType = OperationType.SAVE
  ): ApiResponse<T> {
    return this.handle(response, {
      operation,
      operationType
    });
  }

  /**
   * 异步操作处理器
   */
  static async handleAsync<T>(
    asyncOperation: Promise<ApiResponse<T>>,
    options: ResponseHandlerOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await asyncOperation;
      return this.handle(response, options);
    } catch (error) {
      console.error(`✗ ${options.operation}异常:`, error);
      
      const errorMessage = error instanceof Error ? error.message : `${options.operation}失败`;
      
      if (options.showError !== false) {
        antdMessage.error(errorMessage);
      }

      options.onError?.(errorMessage);

      return {
        success: false,
        message: errorMessage
      };
    }
  }
}
