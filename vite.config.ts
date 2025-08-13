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
    chunkSizeWarningLimit: 1000, // 增加到 1MB 来避免警告
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          // 保守的分包策略，只分离最大的依赖
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },

    },
  },

  define: {
    // Environment variables will be handled by the config system
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
      'react-router-dom',
      'zustand',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
    ],
    exclude: [],
  },

  preview: {
    port: 3000,
    host: true,
  },
})
