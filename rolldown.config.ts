import { defineConfig } from 'rolldown'
import path from 'path'

// https://rolldown.rs/config/
export default defineConfig({
  input: './src/main.tsx',
  resolve: {
    alias: {
      '@/types/generated': path.resolve(__dirname, './types/generated'),
      '@': path.resolve(__dirname, './src'),
      '@mock': path.resolve(__dirname, './src/mocks'),
    },
  },
  output: {
    dir: 'out',
    format: 'es',
    entryFileNames: 'js/[name]-[hash].js',
  },
  define: {
    global: 'globalThis',
    // 定义Vite风格的环境变量
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development'),
    'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV === 'development'),
    'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
  // 模块类型配置，处理各种资源文件
  moduleTypes: {
    '.png': 'asset',
    '.jpg': 'asset',
    '.jpeg': 'asset',
    '.gif': 'asset',
    '.svg': 'asset',
    '.webp': 'asset',
    '.ico': 'asset',
    '.woff': 'asset',
    '.woff2': 'asset',
    '.ttf': 'asset',
    '.eot': 'asset',
    '.css': 'css',
  },
})
