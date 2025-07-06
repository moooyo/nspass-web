import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 基础配置
  experimental: {
    esmExternals: true,
  },
  
  // 图片优化配置 - 支持 Cloudflare Pages
  images: {
    unoptimized: true,
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
