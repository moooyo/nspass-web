import { useState, useEffect, useCallback } from 'react';
import { OAuth2User } from '@/utils/oauth2';

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
  logout: () => void;
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

  // 从localStorage加载用户信息
  const loadUserFromStorage = useCallback(() => {
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
    }
  }, []);

  // 登录
  const login = useCallback((user: User, method: string) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('login_method', method);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        loginMethod: method,
      });
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }, []);

  // 退出登录
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('login_method');
      
      // 清理所有OAuth2相关的配置
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('oauth2_')) {
          localStorage.removeItem(key);
        }
      });
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        loginMethod: null,
      });
    } catch (error) {
      console.error('清理用户信息失败:', error);
    }
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // 组件挂载时加载用户信息
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // 监听localStorage变化（多标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'login_method') {
        loadUserFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUserFromStorage]);

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

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    
    // 这里可以根据实际的权限系统进行扩展
    // 例如检查user.roles, user.permissions等
    return true;
  }, [user]);

  const hasRole = useCallback((role: string) => {
    if (!user) return false;
    
    // 这里可以根据实际的角色系统进行扩展
    return true;
  }, [user]);

  return {
    hasPermission,
    hasRole,
  };
}; 