/**
 * 环境变量调试工具
 * 用于检查和调试环境变量在不同环境中的设置情况
 */

export interface EnvDebugInfo {
  NODE_ENV: string;
  NEXT_PUBLIC_API_BASE_URL: string | undefined;
  isClient: boolean;
  userAgent?: string;
  location?: string;
  timestamp: string;
}

export function getEnvDebugInfo(): EnvDebugInfo {
  const isClient = typeof window !== 'undefined';
  
  return {
    NODE_ENV: import.meta.env.MODE || 'unknown',
    NEXT_PUBLIC_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    isClient,
    userAgent: isClient ? window.navigator.userAgent : undefined,
    location: isClient ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
  };
}

export function logEnvDebugInfo(): EnvDebugInfo {
  const info = getEnvDebugInfo();
  
  console.group('🔍 Environment Debug Information');
  console.log('Environment:', info.NODE_ENV);
  console.log('API Base URL:', info.NEXT_PUBLIC_API_BASE_URL || '❌ Not set');
  console.log('Is Client:', info.isClient);
  if (info.isClient) {
    console.log('Location:', info.location);
    console.log('User Agent:', info.userAgent);
  }
  console.log('Timestamp:', info.timestamp);
  console.groupEnd();
  
  return info;
}

export function validateApiBaseUrl(): {
  isValid: boolean;
  value: string | undefined;
  source: string;
  issues: string[];
} {
  const value = import.meta.env.VITE_API_BASE_URL;
  const issues: string[] = [];
  let source = 'environment variable';
  
  if (!value) {
    issues.push('NEXT_PUBLIC_API_BASE_URL is not set');
    source = 'fallback';
  } else {
    try {
      const url = new URL(value);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        issues.push('API Base URL is pointing to localhost - this may cause issues in production');
      }
      if (url.protocol !== 'https:' && import.meta.env.PROD) {
        issues.push('API Base URL should use HTTPS in production');
      }
    } catch (error) {
      issues.push('API Base URL is not a valid URL format');
    }
  }
  
  return {
    isValid: issues.length === 0,
    value,
    source,
    issues,
  };
}

// 自动在开发环境中输出调试信息
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🚀 Environment Debug Tool Loaded');
  logEnvDebugInfo();
  
  const validation = validateApiBaseUrl();
  if (!validation.isValid) {
    console.warn('⚠️ API Base URL Validation Issues:', validation.issues);
  }
}
