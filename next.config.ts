import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable React 19 experimental features
    reactCompiler: false,
  },
  
  compiler: {
    // Remove development only props in production
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

    // Ensure @mock alias is available
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mock': './app/mocks',
    };

    // Suppress specific warnings for React 19 compatibility
    config.ignoreWarnings = [
      {
        module: /node_modules/,
        message: /Invalid prop.*supplied to.*React\.Fragment/,
      },
      {
        module: /node_modules/,
        message: /React\.Fragment can only have `key` and `children` props/,
      },
    ];

    return config;
  },
};

export default nextConfig;
