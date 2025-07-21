/**
 * 共享类型定义
 * 统一管理项目中常用的类型
 */

// 基础分页类型
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

// 标准API响应格式
export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  code?: string | number;
  timestamp?: string;
  pagination?: Pagination;
  total?: number;
}

// 表格操作结果
export interface OperationResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// 批量操作结果
export interface BatchOperationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  failures?: Array<{
    id: string | number;
    message: string;
  }>;
}

// 表格列配置
export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  filters?: Array<{ text: string; value: string }>;
  width?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

// Hook返回类型
export interface UseApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// 表格Hook返回类型
export interface UseTableHookResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  pagination: Pagination;
  reload: () => void;
  create: (data: Record<string, unknown>) => Promise<OperationResult<T>>;
  update: (id: string | number, data: Record<string, unknown>) => Promise<OperationResult<T>>;
  delete: (id: string | number) => Promise<OperationResult>;
  batchDelete: (ids: (string | number)[]) => Promise<BatchOperationResult>;
  handlePageChange: (page: number, pageSize?: number) => void;
  handleSearch: (params: Record<string, unknown>) => void;
}

// 表单状态类型
export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
  clearTouched: () => void;
  reset: () => void;
  isFieldValid: (field: keyof T) => boolean;
  isFormValid: () => boolean;
  validate: () => boolean;
}

// 主题相关类型
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// 组件尺寸类型
export type ComponentSize = 'small' | 'middle' | 'large';

// 加载状态枚举
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 操作类型枚举
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  BATCH_DELETE = 'batch_delete'
}

// 通用选项接口
export interface Option<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

// 表格列配置扩展
export interface TableColumnConfig {
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  copyable?: boolean;
  editable?: boolean;
}

// 页面权限类型
export interface PagePermission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// 用户角色类型
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// 系统状态枚举
export enum SystemStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error'
}

// 通知类型
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// 文件上传相关
export interface FileUploadResult {
  success: boolean;
  url?: string;
  message?: string;
  size?: number;
  type?: string;
}

// 导出类型
export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields?: string[];
  filename?: string;
}

// 搜索过滤器
export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin';
  value: unknown;
}

// 排序选项
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

// 查询参数
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: SearchFilter[];
  sort?: SortOption[];
  [key: string]: unknown; // 添加索引签名以支持任意参数
}
