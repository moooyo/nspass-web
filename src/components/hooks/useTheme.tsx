'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  type Theme,
  type ResolvedTheme,
  THEME_DETECTION_CONFIG,
  ThemeUtils,
  SYSTEM_DETECTION,
  DEFAULT_THEME_CONFIG,
} from '@/config/theme.config';

interface ThemeContextType {
  // 当前主题偏好（可能是'system'）
  theme: Theme;
  // 解析后的实际主题
  resolvedTheme: ResolvedTheme;
  // 切换主题函数
  toggleTheme: () => void;
  // 设置特定主题
  setTheme: (theme: Theme) => void;
  // 系统信息
  systemInfo: ReturnType<typeof ThemeUtils.getSystemInfo>;
  // 是否已初始化
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME_CONFIG.defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemInfo] = useState(() => ThemeUtils.getSystemInfo());
  
  // 使用ref来缓存操作，避免内存泄漏
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const cleanupMediaQueryRef = useRef<(() => void) | null>(null);
  
  // 调试日志
  const debugLog = useCallback((message: string, ...args: any[]) => {
    if (DEFAULT_THEME_CONFIG.debugMode) {
      console.log(`[ThemeProvider] ${message}`, ...args);
    }
  }, []);

  // 应用主题到DOM
  const applyThemeToDOM = useCallback((newResolvedTheme: ResolvedTheme) => {
    debugLog('Applying theme to DOM:', newResolvedTheme);
    
    // 使用requestAnimationFrame确保DOM更新的性能
    requestAnimationFrame(() => {
      ThemeUtils.applyCSSVariables(newResolvedTheme);
      ThemeUtils.setDataTheme(newResolvedTheme);
    });
  }, [debugLog]);

  // 解析并更新主题
  const updateResolvedTheme = useCallback((newTheme: Theme) => {
    const newResolvedTheme = ThemeUtils.resolveTheme(newTheme);
    
    debugLog('Theme resolution:', { theme: newTheme, resolved: newResolvedTheme });
    
    setResolvedTheme(newResolvedTheme);
    applyThemeToDOM(newResolvedTheme);
    
    return newResolvedTheme;
  }, [applyThemeToDOM, debugLog]);

  // 异步保存主题到localStorage
  const saveThemeAsync = useCallback((newTheme: Theme) => {
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 使用配置的延迟时间
    ThemeUtils.scheduleUpdate(() => {
      try {
        ThemeUtils.setStoredTheme(newTheme);
        debugLog('Theme saved to storage:', newTheme);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    });
  }, [debugLog]);

  // 设置主题
  const setTheme = useCallback((newTheme: Theme) => {
    debugLog('Setting theme:', newTheme);
    
    setThemeState(newTheme);
    updateResolvedTheme(newTheme);
    saveThemeAsync(newTheme);
  }, [updateResolvedTheme, saveThemeAsync, debugLog]);

  // 主题切换函数
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    debugLog('Toggling theme:', { from: theme, to: newTheme });
    setTheme(newTheme);
  }, [theme, setTheme, debugLog]);

  // 处理系统主题变化
  const handleSystemThemeChange = useCallback((systemTheme: ResolvedTheme) => {
    debugLog('System theme changed:', systemTheme);
    
    // 如果用户没有明确设置过主题偏好，跟随系统主题
    const storedTheme = ThemeUtils.getStoredTheme();
    if (!storedTheme || storedTheme === 'system') {
      debugLog('Following system theme change');
      setTheme(systemTheme);
    }
  }, [setTheme, debugLog]);

  // 初始化主题
  useEffect(() => {
    const initializeTheme = () => {
      try {
        debugLog('Initializing theme...');
        debugLog('System info:', systemInfo);
        
        // 获取初始主题
        const initialTheme = ThemeUtils.getInitialTheme();
        debugLog('Initial theme determined:', initialTheme);
        
        setThemeState(initialTheme);
        updateResolvedTheme(initialTheme);
        
      } catch (error) {
        console.error('Failed to initialize theme:', error);
        // 回退到默认主题
        setThemeState('light');
        setResolvedTheme('light');
        applyThemeToDOM('light');
      } finally {
        setIsInitialized(true);
        debugLog('Theme initialization completed');
      }
    };

    // 检测浏览器支持情况并选择最佳的初始化策略
    if (typeof window !== 'undefined') {
      if (SYSTEM_DETECTION.supportsIdleCallback()) {
        requestIdleCallback(initializeTheme, { timeout: THEME_DETECTION_CONFIG.IDLE_CALLBACK_TIMEOUT });
      } else {
        setTimeout(initializeTheme, 0);
      }
    }
  }, [updateResolvedTheme, applyThemeToDOM, systemInfo, debugLog]);

  // 监听系统主题变化
  useEffect(() => {
    if (!isInitialized || !DEFAULT_THEME_CONFIG.enableSystemDetection) {
      return;
    }

    debugLog('Setting up system theme listener');

    // 创建媒体查询监听器
    const cleanup = ThemeUtils.createMediaQueryListener(handleSystemThemeChange);
    
    if (cleanup) {
      cleanupMediaQueryRef.current = cleanup;
      debugLog('System theme listener established');
    } else {
      debugLog('System theme listener not supported');
    }

    return () => {
      if (cleanupMediaQueryRef.current) {
        cleanupMediaQueryRef.current();
        cleanupMediaQueryRef.current = null;
        debugLog('System theme listener cleaned up');
      }
    };
  }, [isInitialized, handleSystemThemeChange, debugLog]);

  // 页面可见性变化时重新检测系统主题
  useEffect(() => {
    if (!isInitialized || !DEFAULT_THEME_CONFIG.enableSystemDetection) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 页面重新可见时，重新检测系统主题
        const currentSystemTheme = SYSTEM_DETECTION.getSystemTheme();
        const storedTheme = ThemeUtils.getStoredTheme();
        // 只有在用户没有明确设置过主题偏好时才跟随系统主题
        if ((!storedTheme || storedTheme === 'system') && currentSystemTheme !== resolvedTheme) {
          debugLog('Page visible again, updating system theme:', currentSystemTheme);
          handleSystemThemeChange(currentSystemTheme);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialized, resolvedTheme, handleSystemThemeChange, debugLog]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 开发环境下暴露调试信息
  useEffect(() => {
    if (DEFAULT_THEME_CONFIG.debugMode && typeof window !== 'undefined') {
      (window as any).__themeDebug = {
        theme,
        resolvedTheme,
        systemInfo,
        isInitialized,
        getSystemTheme: SYSTEM_DETECTION.getSystemTheme,
        utils: ThemeUtils,
      };
    }
  }, [theme, resolvedTheme, systemInfo, isInitialized]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme,
    systemInfo,
    isInitialized,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 