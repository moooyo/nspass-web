// HTTP客户端配置
// 支持构建时传入或环境变量，默认为 http://localhost:8080
const getApiBaseUrl = (): string => {
  // 1. 优先使用构建时传入的环境变量
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 2. 兼容旧的环境变量名
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 3. 开发环境下检查是否配置了真实后端地址
  if (process.env.NODE_ENV === 'development') {
    // 如果设置了 NEXT_PUBLIC_REAL_API_URL，即使在开发环境也使用真实后端
    if (process.env.NEXT_PUBLIC_REAL_API_URL) {
      return process.env.NEXT_PUBLIC_REAL_API_URL;
    }
    // 开发环境默认使用localhost:8080，MSW会在初始化时动态更新
    return 'http://localhost:8080';
  }
  
  // 4. 生产环境默认值
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Proto API响应结构
interface ProtoApiResponse<T = unknown> {
  base: {
    success: boolean;
    message?: string;
    errorCode?: string;
  };
  data?: T;
  total?: number;
  page?: number;
  pageSize?: number;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    totalPages?: number;
  };
}

// 请求去重缓存
interface RequestCacheItem {
  promise: Promise<ApiResponse<any>>;
  timestamp: number;
}

// 通用响应处理工具
class ResponseHandler {
  /**
   * 统一处理API响应，转换为标准ApiResponse格式
   */
  static normalizeProtoResponse<T>(response: any): ApiResponse<T> {
    // 如果已经是标准格式，直接返回
    if (response.success !== undefined && !response.status) {
      return response;
    }

    // 处理标准status格式响应: {status: {success, message}, data: [], pagination: {}}
    if (response.status && typeof response.status === 'object') {
      const normalized: ApiResponse<T> = {
        success: response.status.success ?? false,
        message: response.status.message,
        data: response.data
      };

      // 处理分页信息
      if (response.pagination) {
        normalized.pagination = {
          current: response.pagination.page || response.pagination.current || 1,
          pageSize: response.pagination.pageSize || 10,
          total: response.pagination.total || 0,
          totalPages: response.pagination.totalPages || Math.ceil((response.pagination.total || 0) / (response.pagination.pageSize || 10))
        };
      }

      return normalized;
    }

    // 如果都不匹配，返回错误格式
    return {
      success: false,
      message: '响应格式不正确',
      data: response as T
    };
  }

  /**
   * 检查是否为标准status响应格式
   */
  static isStatusResponse(response: any): boolean {
    return response && typeof response === 'object' && response.status && typeof response.status.success === 'boolean';
  }
}

class HttpClient {
  private baseURL: string;
  private requestCache: Map<string, RequestCacheItem> = new Map();
  private readonly CACHE_DURATION = 1000; // 1秒内的相同请求将被去重

  private defaultErrorResponse<T>(): ApiResponse<T> {
    return {
      success: false,
      message: '请求失败，请稍后重试',
    };
  }

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // 动态更新 baseURL
  updateBaseURL(newBaseURL: string) {
    this.baseURL = newBaseURL;
    console.log(`HTTP客户端 baseURL 已更新为: ${newBaseURL}`);
  }

  // 获取当前 baseURL
  getCurrentBaseURL(): string {
    return this.baseURL;
  }

  // 生成请求缓存键
  private generateCacheKey(endpoint: string, options: RequestOptions): string {
    const { method = 'GET', params, body } = options;
    const bodyStr = body ? JSON.stringify(body) : '';
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${endpoint}:${paramsStr}:${bodyStr}`;
  }

  // 清理过期的缓存
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, item] of this.requestCache.entries()) {
      if (now - item.timestamp > this.CACHE_DURATION) {
        this.requestCache.delete(key);
      }
    }
  }

  // 检查是否为可缓存的请求（只缓存GET请求）
  private isCacheableRequest(method: string): boolean {
    return method === 'GET';
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    // 确保endpoint以/开头
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // 处理相对路径和绝对路径
    let fullUrl: string;
    
    if (this.baseURL.startsWith('http://') || this.baseURL.startsWith('https://')) {
      // 绝对URL
      try {
        const url = new URL(`${this.baseURL}${normalizedEndpoint}`);
        
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, value);
            }
          });
        }
        
        return url.toString();
      } catch (error) {
        console.warn('URL construction failed for absolute URL, using string concatenation', error);
        fullUrl = `${this.baseURL}${normalizedEndpoint}`;
      }
    } else {
      // 相对路径，直接字符串拼接
      const baseWithoutTrailingSlash = this.baseURL.endsWith('/') 
        ? this.baseURL.slice(0, -1) 
        : this.baseURL;
      
      fullUrl = `${baseWithoutTrailingSlash}${normalizedEndpoint}`;
    }
    
    // 添加查询参数
    if (params && Object.keys(params).length > 0) {
      const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      fullUrl += `?${queryParams}`;
    }
    
    return fullUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params } = options;
    
    // 生成缓存键
    const cacheKey = this.generateCacheKey(endpoint, options);
    
    // 检查是否为可缓存的请求且缓存中存在
    if (this.isCacheableRequest(method)) {
      // 清理过期缓存
      this.cleanExpiredCache();
      
      const cachedItem = this.requestCache.get(cacheKey);
      if (cachedItem && (Date.now() - cachedItem.timestamp) < this.CACHE_DURATION) {
        console.log(`🚀 使用缓存的请求: ${method} ${endpoint}`);
        return cachedItem.promise;
      }
    }
    
    const url = this.buildURL(endpoint, params);
    
    const config: RequestInit = {
      method,
      headers: {
        ...headers,
      },
    };

    // 自动添加Authorization header（除了登录和注册接口）
    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
    if (!isAuthEndpoint && typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`,
          ...config.headers,
        };
      }
    }

    if (body && method !== 'GET') {
      // 如果是FormData，不设置Content-Type，让浏览器自动设置
      if (body instanceof FormData) {
        config.body = body;
      } else {
        // 对于JSON数据，设置Content-Type并序列化
        config.headers = {
          'Content-Type': 'application/json',
          ...config.headers,
        };
        config.body = JSON.stringify(body);
      }
    } else if (method !== 'GET') {
      // 对于非GET请求但没有body的情况，仍然设置JSON Content-Type
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    // 创建请求Promise
    const requestPromise = this.executeRequest<T>(url, config);

    // 如果是可缓存的请求，加入缓存
    if (this.isCacheableRequest(method)) {
      this.requestCache.set(cacheKey, {
        promise: requestPromise,
        timestamp: Date.now()
      });
    }

    return requestPromise;
  }

  private async executeRequest<T>(url: string, config: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          
          // 使用统一的响应处理器处理错误响应
          const normalizedError = ResponseHandler.normalizeProtoResponse<T>(errorData);
          
          // 如果没有错误消息，添加状态码信息
          if (!normalizedError.message) {
            normalizedError.message = `请求失败，状态码: ${response.status}`;
          }
          
          return normalizedError;
        } catch {
          // 如果无法解析JSON，返回基本错误
          return {
            success: false,
            message: `请求失败，状态码: ${response.status}`,
          };
        }
      }
      
      const data = await response.json();
      
      // 使用统一的响应处理器
      return ResponseHandler.normalizeProtoResponse<T>(data);
    } catch (error) {
      console.error('API request failed:', error);
      
      // 处理网络错误或其他错误
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: '网络请求失败，请检查网络连接或服务器状态',
        };
      }
      
      return this.defaultErrorResponse<T>();
    }
  }

  // GET 请求
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  // POST 请求
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  // PUT 请求
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  // DELETE 请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 清理缓存的方法
  clearCache() {
    this.requestCache.clear();
    console.log('HTTP客户端缓存已清理');
  }

  // 获取缓存统计信息
  getCacheStats() {
    this.cleanExpiredCache();
    return {
      size: this.requestCache.size,
      keys: Array.from(this.requestCache.keys())
    };
  }
}

// 创建默认实例
export const httpClient = new HttpClient();

// 在开发环境下将httpClient暴露到window对象，便于调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).httpClient = httpClient;
  console.log('🔧 httpClient已暴露到window.httpClient，当前baseURL:', httpClient.getCurrentBaseURL());
}

// 导出类型和工具
export type { ApiResponse, ProtoApiResponse, RequestOptions };
export { ResponseHandler };
export default HttpClient;