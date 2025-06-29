'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 使用ref来缓存存储操作
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 异步保存主题到localStorage
  const saveThemeAsync = useCallback((newTheme: Theme) => {
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 延迟保存，避免频繁写入
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.error('保存主题失败:', error);
      }
    }, 50);
  }, []);

  // 初始化主题 - 异步加载
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        } else {
          // 检测系统主题偏好
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('加载主题失败:', error);
        setTheme('light'); // 默认主题
      } finally {
        setIsInitialized(true);
      }
    };

    // 使用 requestIdleCallback 在浏览器空闲时初始化主题
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(initializeTheme, { timeout: 100 });
      } else {
        setTimeout(initializeTheme, 0);
      }
    }
  }, []);

  // 优化的主题切换函数
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    
    // 立即更新UI状态
    setTheme(newTheme);
    
    // 异步保存到localStorage
    saveThemeAsync(newTheme);
  }, [theme, saveThemeAsync]);

  // 监听系统主题变化
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只在用户没有手动设置主题时跟随系统主题
      try {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          setTheme(newTheme);
        }
      } catch (error) {
        console.error('检测系统主题失败:', error);
      }
    };

    // 使用 passive 监听器提高性能
    if (mediaQuery && mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange, { passive: true });
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [isInitialized]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 动态更新CSS变量 - 优化为节流
  useEffect(() => {
    if (!isInitialized) return;

    const updateCSSVariables = () => {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.style.setProperty('--background-color', '#1f1f1f');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--border-color', '#434343');
        root.style.setProperty('--card-background', '#2d2d2d');
      } else {
        root.style.setProperty('--background-color', '#ffffff');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--border-color', '#d9d9d9');
        root.style.setProperty('--card-background', '#fafafa');
      }
    };

    // 使用 requestAnimationFrame 来优化DOM更新
    requestAnimationFrame(updateCSSVariables);
  }, [theme, isInitialized]);

  const value = {
    theme,
    toggleTheme,
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