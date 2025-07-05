/**
 * 统一的类型定义文件
 * 整合所有服务的通用类型，避免重复定义
 */

// 导出服务基类相关类型
export type { 
  StandardApiResponse,
  QueryParams,
  BatchOperationRequest,
  PaginationParams,
  BatchStatusUpdateRequest
} from '@/services/base';

// 选择性导出生成的类型，避免 protobufPackage 冲突
export type {
  ServerItem,
  ServerStatus,
  CreateServerRequest,
  UpdateServerRequest,
  GetServersRequest,
  GetServerByIdRequest,
  UpdateServerByIdRequest,
  DeleteServerRequest,
  BatchDeleteServersRequest,
  RestartServerRequest
} from '@/types/generated/api/servers/server_management';

export type {
  LoginType,
  LoginRequest,
  LoginResponse
} from '@/types/generated/api/users/user_auth';

export type {
  Route,
  RouteType,
  Protocol,
  ProtocolParams,
  ShadowsocksParams,
  SnellParams,
  ShadowsocksMethod,
  SnellVersion
} from '@/types/generated/model/route';

export type {
  User
} from '@/types/generated/model/user';

export type {
  Server
} from '@/types/generated/model/server';

export type {
  ApiResponse
} from '@/types/generated/common';

// 扩展通用接口
export interface BaseEntity {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

// 分页相关
export interface PaginationMeta {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  success: boolean;
  message?: string;
}

// 表单相关
export interface FormState {
  loading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// 表格相关
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  filters?: Array<{ text: string; value: string }>;
  width?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

// 通用状态枚举
export enum CommonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DISABLED = 'disabled',
  DELETED = 'deleted'
}

// 通用操作结果
export interface OperationResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

// 批量操作结果
export interface BatchOperationResult<T = any> {
  success: boolean;
  message: string;
  successCount: number;
  failedCount: number;
  successItems?: T[];
  failedItems?: Array<{ item: T; error: string }>;
}

// 文件上传相关
export interface FileUploadResult {
  success: boolean;
  message: string;
  url?: string;
  filename?: string;
  size?: number;
  type?: string;
}

// 搜索相关
export interface SearchParams {
  query?: string;
  fields?: string[];
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// 导出相关
export interface ExportParams {
  format: 'csv' | 'xlsx' | 'json';
  fields?: string[];
  filters?: Record<string, any>;
  filename?: string;
}

// Hook 相关
export interface UseApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseTableHookResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  reload: () => Promise<void>;
  create: (data: any) => Promise<OperationResult<T>>;
  update: (id: string | number, data: any) => Promise<OperationResult<T>>;
  delete: (id: string | number) => Promise<OperationResult<void>>;
  batchDelete: (ids: (string | number)[]) => Promise<BatchOperationResult<void>>;
}

// 路由相关
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
    icon?: React.ComponentType;
  };
}

// 菜单相关
export interface MenuConfig {
  key: string;
  label: string;
  icon?: React.ComponentType;
  children?: MenuConfig[];
  path?: string;
  component?: React.ComponentType;
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
  };
}

// 通知相关
export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

// 主题相关
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  borderRadius: number;
  compact: boolean;
}

// 用户偏好设置
export interface UserPreferences {
  theme: ThemeConfig;
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    itemsPerPage: number;
    defaultView: string;
  };
}

// 系统配置
export interface SystemConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  uploadMaxSize: number;
  supportedFileTypes: string[];
  enableMock: boolean;
  debugMode: boolean;
  version: string;
  buildTime: string;
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp: string;
}

// 日志类型
export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  source: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// 性能监控
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  networkLatency: number;
  timestamp: string;
}

// WebSocket 相关
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

// 权限相关
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number;
}

// 审计日志
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  ip: string;
  userAgent: string;
  success: boolean;
  error?: string;
}

// 配置管理
export interface ConfigItem {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  category: string;
  readonly: boolean;
  sensitive: boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: any[];
  };
}
