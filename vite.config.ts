import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite configuration following best practices
export default defineConfig({
  plugins: [react()],

  root: '.',
  publicDir: 'public',

  resolve: {
    alias: {
      '@/types/generated': path.resolve(__dirname, './types/generated'),
      '@': path.resolve(__dirname, './src'),

    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          // 将大型依赖分离到单独的chunk
          'react-vendor': ['react', 'react-dom'],
          'antd-vendor': ['antd', '@ant-design/icons', '@ant-design/pro-components'],
          'router-vendor': ['react-router-dom'],
          'utils-vendor': ['dayjs', 'lodash-es'],
        },
      },

    },
  },

  define: {
    // Environment variables
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),

  },

  server: {
    port: 3000,
    host: true,
    open: false,
    hmr: {
      overlay: true,
    },
    fs: {
      // 允许访问工作区根目录之外的文件
      allow: ['..'],
    },
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      '@ant-design/icons',
      '@ant-design/pro-components',
      'react-router-dom',
      'dayjs',
    ],
    exclude: [],
  },

  preview: {
    port: 3000,
    host: true,
  },
})
