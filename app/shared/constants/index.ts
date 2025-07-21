/**
 * 共享常量定义
 * 统一管理项目中的常量值
 */

// 分页相关常量
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'] as const,
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: true,
} as const;

// 表格相关常量
export const TABLE_CONFIG = {
  DEFAULT_SCROLL_Y: 400,
  ROW_KEY: 'id',
  BORDER: false,
  SIZE: 'middle' as const,
  SHOW_HEADER: true,
} as const;

// 表单相关常量
export const FORM_CONFIG = {
  LAYOUT: 'vertical' as const,
  LABEL_COL: { span: 24 },
  WRAPPER_COL: { span: 24 },
  REQUIRED_MARK: true,
  COLON: false,
  VALIDATE_TRIGGER: ['onChange', 'onBlur'] as const,
} as const;

// 模态框相关常量
export const MODAL_CONFIG = {
  DEFAULT_WIDTH: 520,
  LARGE_WIDTH: 800,
  EXTRA_LARGE_WIDTH: 1200,
  MASK_CLOSABLE: false,
  KEYBOARD: true,
  CENTERED: true,
} as const;

// 按钮相关常量
export const BUTTON_CONFIG = {
  DEFAULT_SIZE: 'middle' as const,
  PRIMARY_TYPE: 'primary' as const,
  DANGER_TYPE: 'default' as const,
  GHOST: false,
  BLOCK: false,
} as const;

// 消息提示相关常量
export const MESSAGE_CONFIG = {
  DURATION: 3,
  MAX_COUNT: 5,
  TOP: 24,
  GET_CONTAINER: () => document.body,
} as const;

// 通知相关常量
export const NOTIFICATION_CONFIG = {
  DURATION: 4.5,
  PLACEMENT: 'topRight' as const,
  TOP: 24,
  BOTTOM: 24,
} as const;

// 加载相关常量
export const LOADING_CONFIG = {
  DELAY: 200,
  SPINNING: true,
  SIZE: 'default' as const,
  TIP: '加载中...',
} as const;

// API相关常量
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  DEFAULT_ERROR_MESSAGE: '请求失败，请稍后重试',
} as const;

// 文件上传相关常量
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
  MAX_COUNT: 5,
  MULTIPLE: false,
} as const;

// 验证相关常量
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^1[3-9]\d{9}$/,
  URL_PATTERN: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
} as const;

// 主题相关常量
export const THEME_CONFIG = {
  DEFAULT: 'light' as const,
  STORAGE_KEY: 'theme',
  CSS_VARIABLE_PREFIX: '--theme-',
  TRANSITION_DURATION: '0.3s',
} as const;

// 国际化相关常量
export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'zh-CN',
  STORAGE_KEY: 'locale',
  SUPPORTED_LOCALES: ['zh-CN', 'en-US'],
} as const;

// 路由相关常量
export const ROUTE_CONFIG = {
  HOME: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
} as const;

// 权限相关常量
export const PERMISSION_CONFIG = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
} as const;

// 存储相关常量
export const STORAGE_CONFIG = {
  PREFIX: 'nspass_',
  VERSION: '1.0',
  EXPIRY_KEY: '_expiry',
  USER_KEY: 'user',
  TOKEN_KEY: 'token',
  SETTINGS_KEY: 'settings',
} as const;

// 状态码相关常量
export const STATUS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// 缓存相关常量
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5分钟
  LONG_TTL: 60 * 60 * 1000, // 1小时
  SHORT_TTL: 30 * 1000, // 30秒
  MAX_SIZE: 100,
} as const;

// 防抖节流相关常量
export const DEBOUNCE_CONFIG = {
  DEFAULT_DELAY: 300,
  SEARCH_DELAY: 500,
  RESIZE_DELAY: 100,
  SCROLL_DELAY: 50,
} as const;

// 动画相关常量
export const ANIMATION_CONFIG = {
  DURATION: 300,
  EASING: 'ease-in-out',
  FADE_DURATION: 200,
  SLIDE_DURATION: 300,
} as const;

// 断点相关常量
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
} as const;

// 颜色相关常量
export const COLORS = {
  PRIMARY: '#1677ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#ff4d4f',
  INFO: '#1677ff',
  GRAY: '#8c8c8c',
  WHITE: '#ffffff',
  BLACK: '#000000',
} as const;

// 协议相关常量（根据proto生成）
export const PROTOCOL_CONFIG = {
  SHADOWSOCKS: 'shadowsocks',
  SNELL: 'snell',
  VMESS: 'vmess',
  TROJAN: 'trojan',
} as const;

// 服务器类型常量
export const SERVER_TYPE = {
  NORMAL: 'NORMAL',
  EXIT: 'EXIT',
  RELAY: 'RELAY',
} as const;

// 规则类型常量
export const RULE_TYPE = {
  DOMAIN: 'domain',
  IP: 'ip',
  GEOIP: 'geoip',
  USER_AGENT: 'user-agent',
} as const;
