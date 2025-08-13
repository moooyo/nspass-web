// 基础服务类型定义
export interface StandardApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

export interface QueryParams {
  [key: string]: any
}

export interface BatchOperationRequest {
  ids: string[]
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface BatchStatusUpdateRequest {
  ids: string[]
  status: string
}

// API 响应的分页信息
export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 标准列表响应
export interface ListResponse<T> {
  items: T[]
  pagination: PaginationInfo
}

// 操作结果
export interface OperationResult {
  success: boolean
  message?: string
}

// 批量操作结果
export interface BatchOperationResult {
  success: boolean
  successCount: number
  failureCount: number
  errors?: string[]
}