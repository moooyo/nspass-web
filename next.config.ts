import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable React 19 experimental features
    reactCompiler: false,
    // Faster refresh in development
    ...(process.env.NODE_ENV === 'development' && {
      optimizePackageImports: ['antd', '@ant-design/pro-components', 'react-simple-maps'],
      // Skip type checking in development for faster builds
      typedRoutes: false,
    }),
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  compiler: {
    // Remove development only props in production
    reactRemoveProperties: process.env.NODE_ENV === "production" 
      ? { properties: ['data-testid'] } 
      : false,
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" 
      ? { exclude: ['error'] }
      : false,
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  webpack: (config, { dev, isServer }) => {
    // Performance optimizations for development
    if (dev) {
      // 不修改 devtool，使用 Next.js 默认设置以避免性能问题
      
      // Reduce bundle analysis overhead
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Cache optimizations
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

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

    // Tree shaking optimizations
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
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
