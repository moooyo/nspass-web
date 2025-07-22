import { defineConfig } from 'rolldown'
import path from 'path'

// Rolldown configuration following native best practices
export default defineConfig({
  input: {
    main: './src/main.tsx'
  },
  resolve: {
    alias: {
      '@/types/generated': path.resolve(__dirname, './types/generated'),
      '@': path.resolve(__dirname, './src'),
      '@mock': path.resolve(__dirname, './src/mocks'),
    },
  },
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: 'assets/[name]-[hash].js',
    chunkFileNames: 'assets/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
    minify: process.env.NODE_ENV === 'production',
  },
  define: {
    // Environment variables
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development'),
    'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV === 'development'),
    'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
  },
  moduleTypes: {
    // Asset types
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
  external: (id) => {
    // Don't bundle Node.js built-ins
    return /^node:/.test(id)
  },
})
