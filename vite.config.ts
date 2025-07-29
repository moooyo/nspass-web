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
      '@mock': path.resolve(__dirname, './src/mocks'),
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
      external: (id) => {
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
    },
  },

  define: {
    // Environment variables
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
    'import.meta.env.VITE_ENABLE_MSW': JSON.stringify(process.env.VITE_ENABLE_MSW || (process.env.NODE_ENV === 'development' ? 'true' : 'false')),
  },

  server: {
    port: 3000,
    host: true,
    open: false,
  },

  preview: {
    port: 3000,
    host: true,
  },
})
