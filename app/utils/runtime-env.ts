'use client';

/**
 * 运行时环境变量获取工具
 * 专门处理 Cloudflare Pages 部署时的环境变量获取问题
 */

// 从运行时配置获取API基础URL
export function getRuntimeApiBaseUrl(): string {
  // 1. 优先使用运行时配置文件中的变量（构建时注入）
  if (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__?.NEXT_PUBLIC_API_BASE_URL) {
    const runtimeUrl = (window as any).__RUNTIME_CONFIG__.NEXT_PUBLIC_API_BASE_URL;
    console.log('🔧 使用运行时配置文件:', runtimeUrl);
    return runtimeUrl;
  }

  // 2. 开发环境默认值
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 开发环境，使用默认localhost');
    return 'http://localhost:8080';
  }

  // 3. 生产环境必须配置环境变量
  console.error('❌ 生产环境未找到运行时配置，请检查构建过程');
  throw new Error('运行时配置未找到，请检查 NEXT_PUBLIC_API_BASE_URL 环境变量是否在构建时正确设置');
}
