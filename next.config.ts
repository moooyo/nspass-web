import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // Suppress Fragment prop warnings for React 19 compatibility
    reactRemoveProperties: process.env.NODE_ENV === "production" 
      ? { properties: ['data-testid'] } 
      : false,
  },

  webpack: (config, { dev, isServer }) => {
    // Additional webpack configuration for React 19 compatibility
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react': 'react',
        'react-dom': 'react-dom',
      };
    }
    return config;
  },
};

export default nextConfig;
