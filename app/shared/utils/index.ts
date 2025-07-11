/**
 * 共享工具函数集合
 * 提供项目中常用的工具函数
 */

import { message } from 'antd';
import type { StandardApiResponse, Option } from '../types/common';
import { VALIDATION_CONFIG, API_CONFIG } from '../constants';

/**
 * 格式化工具
 */
export const formatUtils = {
  // 格式化文件大小
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 格式化数字为千分位格式
  formatNumber: (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // 格式化日期
  formatDate: (date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // 格式化相对时间
  formatRelativeTime: (date: Date | string | number): string => {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return formatUtils.formatDate(date, 'YYYY-MM-DD');
  },

  // 格式化百分比
  formatPercentage: (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // 格式化流量
  formatTraffic: (bytes: number): string => {
    return formatUtils.formatFileSize(bytes);
  },
};

/**
 * 验证工具
 */
export const validationUtils = {
  // 邮箱验证
  isEmail: (email: string): boolean => {
    return VALIDATION_CONFIG.EMAIL_PATTERN.test(email);
  },

  // 手机号验证
  isPhone: (phone: string): boolean => {
    return VALIDATION_CONFIG.PHONE_PATTERN.test(phone);
  },

  // URL验证
  isUrl: (url: string): boolean => {
    return VALIDATION_CONFIG.URL_PATTERN.test(url);
  },

  // 密码强度验证
  isStrongPassword: (password: string): boolean => {
    const minLength = password.length >= VALIDATION_CONFIG.MIN_PASSWORD_LENGTH;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  },

  // IP地址验证
  isIP: (ip: string): boolean => {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  },

  // 端口号验证
  isPort: (port: number | string): boolean => {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  },

  // 域名验证
  isDomain: (domain: string): boolean => {
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainPattern.test(domain);
  },
};

/**
 * 存储工具
 */
export const storageUtils = {
  // 设置localStorage，支持过期时间
  setItem: (key: string, value: any, ttl?: number): void => {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('localStorage设置失败:', error);
    }
  },

  // 获取localStorage
  getItem: <T = any>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // 检查是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('localStorage获取失败:', error);
      return null;
    }
  },

  // 移除localStorage
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage移除失败:', error);
    }
  },

  // 清空localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage清空失败:', error);
    }
  },

  // 获取所有键
  getAllKeys: (): string[] => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('获取localStorage键失败:', error);
      return [];
    }
  },
};

/**
 * DOM工具
 */
export const domUtils = {
  // 复制到剪贴板
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 兼容旧浏览器
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  },

  // 下载文件
  downloadFile: (url: string, filename?: string): void => {
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 获取元素尺寸
  getElementSize: (element: HTMLElement): { width: number; height: number } => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  },

  // 检查元素是否在视口内
  isElementInViewport: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
};

/**
 * 异步工具
 */
export const asyncUtils = {
  // 延迟执行
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // 重试机制
  retry: async <T>(
    fn: () => Promise<T>,
    retries: number = API_CONFIG.RETRY_COUNT,
    delay: number = API_CONFIG.RETRY_DELAY
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await asyncUtils.delay(delay);
        return asyncUtils.retry(fn, retries - 1, delay);
      }
      throw error;
    }
  },

  // 超时包装
  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('超时')), ms)
      ),
    ]);
  },

  // 并发限制
  limitConcurrency: async <T>(
    tasks: (() => Promise<T>)[],
    limit: number
  ): Promise<T[]> => {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const promise = task().then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  },
};

/**
 * 数组工具
 */
export const arrayUtils = {
  // 数组去重
  unique: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  // 数组分组
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // 数组排序
  sortBy: <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // 分页
  paginate: <T>(array: T[], page: number, pageSize: number): T[] => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return array.slice(start, end);
  },

  // 数组转换为选项
  toOptions: <T>(
    array: T[],
    labelKey: keyof T,
    valueKey: keyof T
  ): Option<T[keyof T]>[] => {
    return array.map(item => ({
      label: String(item[labelKey]),
      value: item[valueKey],
    }));
  },
};

/**
 * 对象工具
 */
export const objectUtils = {
  // 深度克隆
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  // 对象合并
  merge: <T>(...objects: Partial<T>[]): T => {
    return Object.assign({}, ...objects) as T;
  },

  // 选择对象属性
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  // 排除对象属性
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  // 检查对象是否为空
  isEmpty: (obj: any): boolean => {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },
};

/**
 * API响应处理工具
 */
export const apiUtils = {
  // 处理API响应
  handleResponse: <T>(response: StandardApiResponse<T>): T => {
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || API_CONFIG.DEFAULT_ERROR_MESSAGE);
    }
  },

  // 显示API错误消息
  showError: (error: any): void => {
    const errorMessage = error?.message || error?.toString() || API_CONFIG.DEFAULT_ERROR_MESSAGE;
    message.error(errorMessage);
  },

  // 显示API成功消息
  showSuccess: (message_text: string): void => {
    message.success(message_text);
  },

  // 创建标准响应
  createResponse: <T>(data: T, success = true, message_text?: string): StandardApiResponse<T> => {
    return {
      success,
      data,
      message: message_text,
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * 密码和安全工具
 */
export const securityUtils = {
  // 生成随机密码
  generateRandomPassword: (minLength: number = 64, maxLength: number = 128): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // 生成并设置表单密码字段
  generateAndSetFormPassword: (
    form: any, 
    fieldName: string, 
    minLength: number = 64, 
    maxLength: number = 128, 
    successMessage: string = '已生成随机密码'
  ) => {
    const randomPassword = securityUtils.generateRandomPassword(minLength, maxLength);
    if (form) {
      form.setFieldsValue({ [fieldName]: randomPassword });
      message.success(`${successMessage} (${randomPassword.length}位)`);
    }
    return randomPassword;
  }
};
