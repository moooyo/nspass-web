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
    'import.meta.env.DEV': JSON.stringify((process.env.NODE_ENV || 'development') === 'development'),
    'import.meta.env.PROD': JSON.stringify((process.env.NODE_ENV || 'development') === 'production'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
    'import.meta.env.VITE_ENABLE_MSW': JSON.stringify(process.env.VITE_ENABLE_MSW || (process.env.NODE_ENV === 'development' ? 'true' : 'false')),
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
    if (/^node:/.test(id)) {
      return true;
    }
    
    // In production, externalize MSW to reduce bundle size
    if (process.env.NODE_ENV === 'production' && process.env.VITE_ENABLE_MSW === 'false') {
      // MSW related modules
      if (id.includes('msw') || 
          id.includes('/mocks/') || 
          id.includes('\\mocks\\') ||
          id.endsWith('/init-msw') ||
          id.endsWith('\\init-msw') ||
          id.endsWith('/init-msw.ts') ||
          id.endsWith('\\init-msw.ts') ||
          id.includes('@/mocks') ||
          id.includes('./mocks') ||
          id.includes('../mocks') ||
          id.includes('/src/mocks/') ||
          id.includes('\\src\\mocks\\') ||
          id.endsWith('mockServiceWorker.js') ||
          id.includes('/handlers/') ||
          id.includes('\\handlers\\') ||
          id.includes('@mock/handlers') ||
          id.includes('./handlers') ||
          id.includes('../handlers')) {
        console.log(`🚫 Externalizing MSW module in production: ${id}`);
        return true;
      }
    }
    
    return false;
  },
})
