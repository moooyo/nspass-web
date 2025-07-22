/**
 * 主题配置文件
 * 统一管理所有主题相关的配置，避免硬编码
 */

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// 主题检测配置
export const THEME_DETECTION_CONFIG = {
  // 存储键名
  STORAGE_KEY: 'nspass-theme-preference',
  
  // 媒体查询
  MEDIA_QUERY: '(prefers-color-scheme: dark)',
  
  // 系统主题检测超时时间（毫秒）
  DETECTION_TIMEOUT: 100,
  
  // 主题切换动画时间（毫秒）
  TRANSITION_DURATION: 300,
  
  // 保存到存储的延迟时间（毫秒）
  SAVE_DELAY: 50,
  
  // 空闲回调超时时间（毫秒）
  IDLE_CALLBACK_TIMEOUT: 100,
};

// CSS变量定义
export const CSS_VARIABLES = {
  light: {
    // 基础色彩
    '--foreground-rgb': '0, 0, 0',
    '--background-start-rgb': '214, 219, 220',
    '--background-end-rgb': '255, 255, 255',
    
    // 主题色
    '--primary-blue': '#1890ff',
    '--primary-blue-hover': '#40a9ff',
    '--primary-blue-active': '#096dd9',
    '--secondary-blue': '#f0f8ff',
    '--light-blue': '#e6f7ff',
    '--dark-blue': '#0050b3',
    
    // 背景色
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafb',
    '--bg-tertiary': '#f0f2f5',
    
    // 文字色
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#666666',
    '--text-tertiary': '#999999',
    
    // 边框和阴影
    '--border-color': '#e8e8e8',
    '--shadow-color': 'rgba(0, 0, 0, 0.1)',
    
    // 渐变效果
    '--primary-gradient': 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
    '--secondary-gradient': 'linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)',
    '--success-gradient': 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
    '--card-gradient': 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 251, 0.9) 100%)',
    
    // 玻璃效果
    '--glass-bg': 'rgba(255, 255, 255, 0.8)',
    '--glass-border': 'rgba(24, 144, 255, 0.1)',
    '--shadow-soft': '0 8px 32px rgba(24, 144, 255, 0.15)',
    '--shadow-card': '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  
  dark: {
    // 基础色彩
    '--foreground-rgb': '255, 255, 255',
    '--background-start-rgb': '0, 0, 0',
    '--background-end-rgb': '0, 0, 0',
    
    // 主题色（保持一致）
    '--primary-blue': '#1890ff',
    '--primary-blue-hover': '#40a9ff',
    '--primary-blue-active': '#096dd9',
    '--secondary-blue': '#f0f8ff',
    '--light-blue': '#e6f7ff',
    '--dark-blue': '#0050b3',
    
    // 背景色
    '--bg-primary': '#141414',
    '--bg-secondary': '#1f1f1f',
    '--bg-tertiary': '#2a2a2a',
    
    // 文字色
    '--text-primary': '#ffffff',
    '--text-secondary': '#cccccc',
    '--text-tertiary': '#999999',
    
    // 边框和阴影
    '--border-color': '#333333',
    '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    
    // 渐变效果
    '--primary-gradient': 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
    '--secondary-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    '--success-gradient': 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
    '--card-gradient': 'linear-gradient(145deg, rgba(31, 31, 31, 0.9) 0%, rgba(20, 20, 20, 0.9) 100%)',
    
    // 玻璃效果
    '--glass-bg': 'rgba(31, 31, 31, 0.8)',
    '--glass-border': 'rgba(24, 144, 255, 0.2)',
    '--shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.5)',
    '--shadow-card': '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
} as const;

// Antd主题配置
export const ANTD_THEME_CONFIG = {
  light: {
    algorithm: 'default', // 'theme.defaultAlgorithm'
    token: {
      colorPrimary: '#1890FF',
      borderRadius: 6,
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBorder: '#e8e8e8',
      colorText: '#1a1a1a',
      colorTextSecondary: '#666666',
      colorTextTertiary: '#999999',
    },
    components: {
      Table: {
        fontSize: 14,
        headerBg: '#f5f5f5',
        headerColor: '#1a1a1a',
        rowHoverBg: '#f0f8ff',
      },
      Card: {
        boxShadow: 'none',
        borderRadius: 8,
        headerBg: 'transparent',
      },
      Layout: {
        bodyBg: 'transparent',
        headerBg: 'transparent',
        siderBg: 'transparent',
      },
      Menu: {
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemColor: 'rgba(26, 26, 26, 0.85)',
        itemHoverColor: '#1890ff',
        itemSelectedColor: '#ffffff',
        itemSelectedBg: '#1890ff',
        itemActiveBg: 'rgba(24, 144, 255, 0.1)',
      },
      Input: {
        borderRadius: 12,
        paddingBlock: 8,
        paddingInline: 12,
      },
      Button: {
        borderRadius: 12,
        paddingBlock: 8,
        paddingInline: 16,
      },
    },
  },
  
  dark: {
    algorithm: 'dark', // 'theme.darkAlgorithm'
    token: {
      colorPrimary: '#1890FF',
      borderRadius: 6,
      colorBgContainer: '#1f1f1f',
      colorBgElevated: '#2a2a2a',
      colorBorder: '#333333',
      colorText: '#ffffff',
      colorTextSecondary: '#cccccc',
      colorTextTertiary: '#999999',
    },
    components: {
      Table: {
        fontSize: 14,
        headerBg: '#1f1f1f',
        headerColor: '#ffffff',
        rowHoverBg: 'rgba(24, 144, 255, 0.1)',
      },
      Card: {
        boxShadow: 'none',
        borderRadius: 8,
        headerBg: 'transparent',
      },
      Layout: {
        bodyBg: 'transparent',
        headerBg: 'transparent',
        siderBg: 'transparent',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        darkItemColor: 'rgba(255, 255, 255, 0.85)',
        darkItemHoverColor: '#ffffff',
        darkItemSelectedColor: '#ffffff',
        darkItemSelectedBg: '#1890ff',
        darkItemActiveBg: 'rgba(24, 144, 255, 0.1)',
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemColor: 'rgba(255, 255, 255, 0.85)',
        itemHoverColor: '#ffffff',
        itemSelectedColor: '#ffffff',
        itemSelectedBg: '#1890ff',
        itemActiveBg: 'rgba(24, 144, 255, 0.1)',
      },
      Input: {
        borderRadius: 12,
        paddingBlock: 8,
        paddingInline: 12,
      },
      Button: {
        borderRadius: 12,
        paddingBlock: 8,
        paddingInline: 16,
      },
    },
  },
} as const;

// 系统信息检测
export const SYSTEM_DETECTION = {
  // 检测操作系统
  getOS: (): 'windows' | 'macos' | 'linux' | 'unknown' => {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('linux')) return 'linux';
    
    return 'unknown';
  },
  
  // 检测浏览器
  getBrowser: (): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' => {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('edg/')) return 'edge';
    if (userAgent.includes('chrome') && !userAgent.includes('edg/')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    
    return 'unknown';
  },
  
  // 检测是否支持媒体查询
  supportsMediaQuery: (): boolean => {
    if (typeof window === 'undefined') return false;
    return typeof window.matchMedia === 'function';
  },
  
  // 检测是否支持 requestIdleCallback
  supportsIdleCallback: (): boolean => {
    if (typeof window === 'undefined') return false;
    return typeof window.requestIdleCallback === 'function';
  },
  
  // 检测是否支持 CSS 变量
  supportsCSSVariables: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--test)');
  },
  
  // 获取当前系统主题偏好
  getSystemTheme: (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    
    if (!SYSTEM_DETECTION.supportsMediaQuery()) {
      return 'light';
    }
    
    try {
      const mediaQuery = window.matchMedia(THEME_DETECTION_CONFIG.MEDIA_QUERY);
      return mediaQuery.matches ? 'dark' : 'light';
    } catch (error) {
      console.warn('Failed to detect system theme:', error);
      return 'light';
    }
  },
  
  // 检测是否为触摸设备
  isTouchDevice: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // 检测是否为移动设备
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  },
} as const;

// 主题工具函数
export const ThemeUtils = {
  // 应用CSS变量到DOM
  applyCSSVariables: (theme: ResolvedTheme): void => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const variables = CSS_VARIABLES[theme];
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  },
  
  // 设置data-theme属性
  setDataTheme: (theme: ResolvedTheme): void => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.setAttribute('data-theme', theme);
  },
  
  // 获取resolved theme（将system转换为具体的light/dark）
  resolveTheme: (theme: Theme): ResolvedTheme => {
    if (theme === 'system') {
      return SYSTEM_DETECTION.getSystemTheme();
    }
    return theme;
  },
  
  // 从存储获取主题偏好
  getStoredTheme: (): Theme | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(THEME_DETECTION_CONFIG.STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('Failed to read theme from storage:', error);
    }
    
    return null;
  },
  
  // 保存主题偏好到存储
  setStoredTheme: (theme: Theme): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(THEME_DETECTION_CONFIG.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  },
  
  // 获取初始主题
  getInitialTheme: (): Theme => {
    // 1. 优先使用存储的偏好
    const storedTheme = ThemeUtils.getStoredTheme();
    if (storedTheme && storedTheme !== 'system') return storedTheme;
    
    // 2. 根据系统主题设置浅色或深色
    const systemTheme = SYSTEM_DETECTION.getSystemTheme();
    return systemTheme;
  },
  
  // 创建媒体查询监听器
  createMediaQueryListener: (callback: (theme: ResolvedTheme) => void): (() => void) | null => {
    if (!SYSTEM_DETECTION.supportsMediaQuery()) return null;
    
    try {
      const mediaQuery = window.matchMedia(THEME_DETECTION_CONFIG.MEDIA_QUERY);
      
      const handleChange = (e: MediaQueryListEvent) => {
        callback(e.matches ? 'dark' : 'light');
      };
      
      // 使用现代API或回退到旧API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange, { passive: true });
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        // 兼容旧版本浏览器
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } catch (error) {
      console.warn('Failed to create media query listener:', error);
    }
    
    return null;
  },
  
  // 延迟执行函数（优化性能）
  scheduleUpdate: (callback: () => void, delay = THEME_DETECTION_CONFIG.SAVE_DELAY): void => {
    if (SYSTEM_DETECTION.supportsIdleCallback()) {
      requestIdleCallback(callback, { timeout: THEME_DETECTION_CONFIG.IDLE_CALLBACK_TIMEOUT });
    } else {
      setTimeout(callback, delay);
    }
  },
  
  // 获取系统信息（用于调试）
  getSystemInfo: () => ({
    os: SYSTEM_DETECTION.getOS(),
    browser: SYSTEM_DETECTION.getBrowser(),
    systemTheme: SYSTEM_DETECTION.getSystemTheme(),
    supportsMediaQuery: SYSTEM_DETECTION.supportsMediaQuery(),
    supportsIdleCallback: SYSTEM_DETECTION.supportsIdleCallback(),
    supportsCSSVariables: SYSTEM_DETECTION.supportsCSSVariables(),
    isTouchDevice: SYSTEM_DETECTION.isTouchDevice(),
    isMobile: SYSTEM_DETECTION.isMobile(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
  }),
} as const;

// 导出默认配置
export const DEFAULT_THEME_CONFIG = {
  defaultTheme: 'system' as Theme,
  enableTransitions: true,
  enableSystemDetection: true,
  enableAutoSwitch: true,
  debugMode: import.meta.env.DEV,
} as const; 