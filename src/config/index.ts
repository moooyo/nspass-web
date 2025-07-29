/**
 * 项目配置文件
 * 统一管理项目的所有配置项
 */

export interface ProjectConfig {
  app: {
    name: string;
    version: string;
    description: string;
    author: string;
    homepage: string;
  };
  
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  ui: {
    theme: {
      primaryColor: string;
      borderRadius: number;
      compactMode: boolean;
    };
    table: {
      defaultPageSize: number;
      pageSizeOptions: number[];
    };
    form: {
      labelCol: { span: number };
      wrapperCol: { span: number };
    };
  };
  
  features: {
    enableMock: boolean;
    enableDevTools: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };
  
  security: {
    tokenKey: string;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  
  performance: {
    enableCache: boolean;
    cacheTimeout: number;
    enableCompression: boolean;
    lazyLoadImages: boolean;
  };
  
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsoleLog: boolean;
    enableServerLog: boolean;
    maxLogSize: number;
  };
}

// 默认配置
export const defaultConfig: ProjectConfig = {
  app: {
    name: 'NSPass Web',
    version: '1.0.0',
    description: 'Network Service Pass Web Dashboard',
    author: 'NSPass Team',
    homepage: 'https://nspass.com'
  },
  
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  ui: {
    theme: {
      primaryColor: '#1890ff',
      borderRadius: 6,
      compactMode: false
    },
    table: {
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50, 100]
    },
    form: {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
  },
  
  features: {

    enableDevTools: import.meta.env.DEV,
    enableAnalytics: import.meta.env.PROD,
    enableErrorReporting: import.meta.env.PROD
  },
  
  security: {
    tokenKey: 'auth_token',
    sessionTimeout: 30 * 60 * 1000, // 30分钟
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15分钟
  },
  
  performance: {
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000, // 5分钟
    enableCompression: true,
    lazyLoadImages: true
  },
  
  logging: {
    level: import.meta.env.DEV ? 'debug' : 'info',
    enableConsoleLog: import.meta.env.DEV,
    enableServerLog: true,
    maxLogSize: 10 * 1024 * 1024 // 10MB
  }
};

// 环境特定配置
export const environmentConfigs: Record<string, Partial<ProjectConfig>> = {
  development: {
    api: {
      baseUrl: 'https://api.nspass.xforward.de',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    },
    features: {
      enableMock: true,
      enableDevTools: true,
      enableAnalytics: false,
      enableErrorReporting: false
    },
    logging: {
      level: 'debug',
      enableConsoleLog: true,
      enableServerLog: true,
      maxLogSize: 10 * 1024 * 1024
    }
  },
  
  production: {
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000
    },
    features: {
      enableMock: false,
      enableDevTools: false,
      enableAnalytics: true,
      enableErrorReporting: true
    },
    logging: {
      level: 'warn',
      enableConsoleLog: false,
      enableServerLog: true,
      maxLogSize: 10 * 1024 * 1024
    }
  },
  
  test: {
    api: {
      baseUrl: 'http://localhost:3001',
      timeout: 5000,
      retryAttempts: 1,
      retryDelay: 500
    },
    features: {
      enableMock: true,
      enableDevTools: false,
      enableAnalytics: false,
      enableErrorReporting: false
    },
    logging: {
      level: 'error',
      enableConsoleLog: false,
      enableServerLog: false,
      maxLogSize: 5 * 1024 * 1024
    }
  }
};

/**
 * 获取当前环境配置
 */
export function getConfig(): ProjectConfig {
  const env = import.meta.env.MODE || 'development';
  const envConfig = environmentConfigs[env] || {};
  
  return {
    ...defaultConfig,
    ...envConfig,
    // 深度合并嵌套对象
    api: { ...defaultConfig.api, ...envConfig.api },
    ui: { 
      ...defaultConfig.ui, 
      ...envConfig.ui,
      theme: { ...defaultConfig.ui.theme, ...envConfig.ui?.theme },
      table: { ...defaultConfig.ui.table, ...envConfig.ui?.table },
      form: { ...defaultConfig.ui.form, ...envConfig.ui?.form }
    },
    features: { ...defaultConfig.features, ...envConfig.features },
    security: { ...defaultConfig.security, ...envConfig.security },
    performance: { ...defaultConfig.performance, ...envConfig.performance },
    logging: { ...defaultConfig.logging, ...envConfig.logging }
  };
}

/**
 * 配置验证函数
 */
export function validateConfig(config: ProjectConfig): string[] {
  const errors: string[] = [];
  
  if (!config.app.name) {
    errors.push('App name is required');
  }
  
  if (!config.api.baseUrl) {
    errors.push('API base URL is required');
  }
  
  if (config.api.timeout <= 0) {
    errors.push('API timeout must be greater than 0');
  }
  
  if (config.security.sessionTimeout <= 0) {
    errors.push('Session timeout must be greater than 0');
  }
  
  if (config.performance.cacheTimeout <= 0) {
    errors.push('Cache timeout must be greater than 0');
  }
  
  return errors;
}

/**
 * 配置管理器
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: ProjectConfig;
  private listeners: Array<(config: ProjectConfig) => void> = [];

  private constructor() {
    this.config = getConfig();
    this.validateConfiguration();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取配置
   */
  getConfig(): ProjectConfig {
    return this.config;
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<ProjectConfig>): void {
    this.config = { ...this.config, ...updates };
    this.validateConfiguration();
    this.notifyListeners();
  }

  /**
   * 获取特定配置项
   */
  get<K extends keyof ProjectConfig>(key: K): ProjectConfig[K] {
    return this.config[key];
  }

  /**
   * 设置特定配置项
   */
  set<K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]): void {
    this.config[key] = value;
    this.validateConfiguration();
    this.notifyListeners();
  }

  /**
   * 订阅配置变化
   */
  subscribe(listener: (config: ProjectConfig) => void): () => void {
    this.listeners.push(listener);
    
    // 返回取消订阅函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 验证配置
   */
  private validateConfiguration(): void {
    const errors = validateConfig(this.config);
    if (errors.length > 0) {
      console.warn('Configuration validation errors:', errors);
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    });
  }

  /**
   * 重置配置
   */
  reset(): void {
    this.config = getConfig();
    this.notifyListeners();
  }

  /**
   * 导出配置
   */
  export(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 导入配置
   */
  import(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson);
      this.updateConfig(importedConfig);
    } catch {
      throw new Error('Invalid configuration format');
    }
  }
}

// 创建全局配置实例
export const configManager = ConfigManager.getInstance();

// 导出当前配置
export const config = configManager.getConfig();

// 在开发环境下暴露配置管理器到全局
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).configManager = configManager;
  (window as any).config = config;
}
