import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 基础配置
  experimental: {
    esmExternals: true,
  },
  
  // 启用静态导出 - Cloudflare Pages 需要
  output: 'export',
  
  // 图片优化配置 - 支持 Cloudflare Pages
  images: {
    unoptimized: true,
  },
  
  // 禁用 trailing slash 以避免路由问题
  trailingSlash: false,
  
  // 环境变量配置 - 在运行时动态获取，不依赖构建时
  // env: {
  //   NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  // },
  
  // TypeScript 配置 - 在 Cloudflare 部署时可以跳过类型检查
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  
  // ESLint 配置 - 在 Cloudflare 部署时可以跳过 lint 检查
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_TYPE_CHECK === 'true',
  },
  
  // Webpack 配置 - 支持 Edge Runtime
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
