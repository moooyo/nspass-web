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
    // 否则使用相对路径以支持mock
    return '/api';
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

class HttpClient {
  private baseURL: string;
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
    
    const url = this.buildURL(endpoint, params);
    
    const config: RequestInit = {
      method,
      headers: {
        ...headers,
      },
    };

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

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          
          // API统一返回proto格式
          return {
            success: errorData.base?.success ?? false,
            message: errorData.base?.message || `请求失败，状态码: ${response.status}`,
            data: errorData.data as T,
          };
        } catch (parseError) {
          // 如果无法解析JSON，返回基本错误
          return {
            success: false,
            message: `请求失败，状态码: ${response.status}`,
          };
        }
      }
      
      const data = await response.json();
      
      // API统一返回proto格式：{base: {success, message, errorCode}, data: ...}
      return {
        success: data.base?.success ?? false,
        message: data.base?.message,
        data: data.data
      };
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
}

// 创建默认实例
export const httpClient = new HttpClient();

// 导出类型
export type { ApiResponse, RequestOptions };
export default HttpClient; 