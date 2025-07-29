/**
 * API错误码映射工具
 * 
 * 提供标准化的错误码到中文消息的映射
 * 基于proto/common中定义的错误码
 */

// 错误码对应的中文提示（基于proto中的定义）
export const ERROR_MESSAGES: Record<string, string> = {
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
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '用户未登录或登录已过期',
  403: '权限不足，无法访问该资源',
  404: '请求的资源不存在',
  405: '不支持的请求方法',
  409: '资源冲突',
  422: '数据验证失败',
  429: '请求过于频繁，请稍后重试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
};

/**
 * 根据错误码获取中文错误消息
 */
export function getErrorMessage(errorCode?: string): string {
  if (!errorCode) {
    return '未知错误';
  }
  
  return ERROR_MESSAGES[errorCode] || `未知错误码: ${errorCode}`;
}

/**
 * 根据HTTP状态码获取中文错误消息
 */
export function getHttpStatusMessage(statusCode: number): string {
  return HTTP_STATUS_MESSAGES[statusCode] || `HTTP ${statusCode} 错误`;
}

/**
 * 获取友好的错误消息
 * 优先使用错误码消息，如果没有则使用HTTP状态码消息，最后使用原始消息
 */
export function getFriendlyErrorMessage(
  message: string,
  errorCode?: string,
  httpStatus?: number
): string {
  // 优先使用错误码消息
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  
  // 其次使用HTTP状态码消息
  if (httpStatus && HTTP_STATUS_MESSAGES[httpStatus]) {
    return HTTP_STATUS_MESSAGES[httpStatus];
  }
  
  // 最后使用原始消息
  return message || '操作失败';
}
