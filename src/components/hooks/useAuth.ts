import { useState, useEffect, useCallback, useRef } from 'react';
import { OAuth2User } from '@/utils/oauth2';
import { authService } from '@/services/auth';

export interface User extends OAuth2User {
  provider: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMethod: string | null;
}

export interface AuthActions {
  login: (user: User, method: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

export type UseAuthReturn = AuthState & AuthActions;

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    loginMethod: null,
  });

  // 使用ref来缓存存储操作，避免频繁访问localStorage
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // 异步保存到localStorage，避免阻塞UI
  const saveToStorageAsync = useCallback((user: User | null, method: string | null) => {
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 延迟保存，避免频繁写入
    saveTimeoutRef.current = setTimeout(() => {
      try {
        if (user && method) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('login_method', method);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('login_method');
        }
      } catch (error) {
        console.error('保存用户信息失败:', error);
      }
    }, 50); // 50ms延迟，足够小以保持响应性，但避免过度频繁的写入
  }, []);

  // 从localStorage加载用户信息 - 优化为异步
  const loadUserFromStorage = useCallback(() => {
    // 使用requestIdleCallback或setTimeout来异步加载，避免阻塞初始渲染
    const loadAsync = () => {
      try {
        const userStr = localStorage.getItem('user');
        const loginMethod = localStorage.getItem('login_method');
        
        if (userStr) {
          const user = JSON.parse(userStr) as User;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            loginMethod,
          });
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      } finally {
        isInitializedRef.current = true;
      }
    };

    // 避免重复初始化
    if (isInitializedRef.current) {
      return;
    }

    // 使用 requestIdleCallback 在浏览器空闲时执行，如果不支持则使用setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadAsync, { timeout: 100 });
    } else {
      setTimeout(loadAsync, 0);
    }
  }, []);

  console.log('useAuth 状态:', { isLoading: state.isLoading, isAuthenticated: state.isAuthenticated, user: state.user?.name });

  // 登录 - 优化存储操作
  const login = useCallback((user: User, method: string) => {
    console.log('useAuth.login 被调用:', { user: user.name, method });
    // 立即更新UI状态
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      loginMethod: method,
    });

    // 异步保存到localStorage
    saveToStorageAsync(user, method);
  }, [saveToStorageAsync]);

  // 退出登录 - 优化清理操作
  const logout = useCallback(async () => {
    try {
      // 立即更新UI状态
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loginMethod: null,
      });

      // 异步清理localStorage
      saveToStorageAsync(null, null);

      // 调用 authService 进行完整清理（异步）
      await authService.logout();
    } catch (error) {
      console.error('退出登录失败:', error);
      // UI状态已经更新，不需要再次设置
    }
  }, [saveToStorageAsync]);

  // 刷新用户信息
  const refreshUser = useCallback(() => {
    isInitializedRef.current = false;
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // 组件挂载时加载用户信息
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // 监听localStorage变化（多标签页同步） - 优化为throttled
  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | undefined;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'login_method') {
        // 节流处理，避免频繁触发
        if (throttleTimeout) {
          clearTimeout(throttleTimeout);
        }
        
        throttleTimeout = setTimeout(() => {
          isInitializedRef.current = false;
          loadUserFromStorage();
        }, 100);
      }
    };

    // 使用 passive 监听器提高性能
    const options = { passive: true };
    window.addEventListener('storage', handleStorageChange, options);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []); // 移除 loadUserFromStorage 依赖

  return {
    ...state,
    login,
    logout,
    refreshUser,
  };
};

// 用户权限检查工具函数
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const requireAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }, [isAuthenticated, isLoading]);

  return {
    requireAuth,
    isAuthenticated,
    isLoading,
  };
};

// 检查用户是否有特定权限（可根据实际需求扩展）
export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((_permission: string) => {
    if (!user) return false;
    
    // 这里可以根据实际的权限系统进行扩展
    // 例如检查user.roles, user.permissions等
    return true;
  }, [user]);

  const hasRole = useCallback((_role: string) => {
    if (!user) return false;
    
    // 这里可以根据实际的角色系统进行扩展
    return true;
  }, [user]);

  return {
    hasPermission,
    hasRole,
  };
}; 