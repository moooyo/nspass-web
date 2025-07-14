/**
 * 统一的类型定义文件
 * 整合所有通用类型，避免重复定义
 */

// 重新导出 shared 类型，避免重复
export type * from '@/shared/types/common';

// 选择性导出生成的类型，避免冲突
export type {
  ServerItem,
  ServerStatus,
  CreateServerRequest,
  UpdateServerRequest,
  GetServersRequest,
  BatchDeleteServersRequest,
  RestartServerRequest
} from '@/types/generated/api/servers/server_management';

// 重新导出服务基类相关类型
export type { 
  StandardApiResponse,
  QueryParams,
  BatchOperationRequest,
  PaginationParams,
  BatchStatusUpdateRequest
} from '@/services/base';
