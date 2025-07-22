/**
 * 统一的日志管理工具
 * 提供不同级别的日志记录，生产环境自动过滤
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  isDevelopment: boolean;
  enabledLevels: LogLevel[];
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.isDevelopment && this.config.enabledLevels.includes(level);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    return `${timestamp} ${prefix} [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  group(label: string): void {
    if (this.config.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.config.isDevelopment) {
      console.groupEnd();
    }
  }
}

// 创建默认 logger 实例
export const logger = new Logger({
  isDevelopment: import.meta.env.DEV,
  enabledLevels: ['debug', 'info', 'warn', 'error'],
  prefix: 'NSPass',
});

// 创建带特定前缀的 logger
export const createLogger = (prefix: string): Logger => {
  return new Logger({
    isDevelopment: import.meta.env.DEV,
    enabledLevels: ['debug', 'info', 'warn', 'error'],
    prefix,
  });
};

// 用于替换现有的 console.log 调用
export const devLog = (...args: unknown[]): void => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export default logger;
