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

  // 2. 检查 Cloudflare Pages 环境变量（有时在页面级别可用）
  if (typeof window !== 'undefined') {
    // 检查页面中是否有环境变量信息
    const cfEnvUrl = (window as any).CF_PAGES_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (cfEnvUrl && !cfEnvUrl.includes('cf-pages')) {
      console.log('🔧 使用 Cloudflare Pages 环境变量:', cfEnvUrl);
      return cfEnvUrl;
    }
  }

  // 3. 开发环境默认值
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 开发环境，使用默认localhost');
    return 'http://localhost:8080';
  }

  // 4. 生产环境必须配置环境变量
  console.error('❌ 生产环境未找到有效的API配置');
  console.error('📝 请在 Cloudflare Pages 控制台的环境变量中设置 NEXT_PUBLIC_API_BASE_URL');
  
  // 在生产环境提供一个默认值，避免应用完全崩溃
  const fallbackUrl = 'https://api.nspass.com';
  console.warn('⚠️ 使用默认API地址作为fallback:', fallbackUrl);
  return fallbackUrl;
}
