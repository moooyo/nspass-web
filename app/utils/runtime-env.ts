'use client';

/**
 * 运行时环境变量获取工具
 * 专门处理 Cloudflare Workers 部署时的环境变量获取
 */

// 从运行时配置获取API基础URL
export function getRuntimeApiBaseUrl(): string {
  // 1. 检查内联环境变量（构建时注入）
  if (typeof window !== 'undefined' && (window as any).__ENV__?.NEXT_PUBLIC_API_BASE_URL) {
    const envUrl = (window as any).__ENV__.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl && envUrl !== '' && envUrl !== 'undefined') {
      console.log('🔧 使用内联环境变量:', envUrl);
      return envUrl;
    }
  }

  // 2. 检查 Next.js 环境变量（开发环境）
  if (process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL !== '') {
    console.log('🔧 使用 Next.js 环境变量:', process.env.NEXT_PUBLIC_API_BASE_URL);
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 3. 开发环境默认值
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 开发环境，使用默认localhost');
    return 'http://localhost:8080';
  }

  // 4. 生产环境根据域名推断
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('nspass')) {
      const inferredUrl = 'https://api.nspass.com';
      console.log('🔧 根据域名推断API地址:', inferredUrl);
      return inferredUrl;
    }
  }

  // 5. 生产环境默认值
  console.error('❌ 生产环境未找到有效的API配置');
  console.error('📝 请配置环境变量 NEXT_PUBLIC_API_BASE_URL');
  
  // 在生产环境提供一个默认值，避免应用完全崩溃
  const fallbackUrl = 'https://api.nspass.com';
  console.warn('⚠️ 使用默认API地址作为fallback:', fallbackUrl);
  return fallbackUrl;
}
