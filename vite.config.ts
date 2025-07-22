import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@/types/generated',
        replacement: path.resolve(__dirname, './types/generated')
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      },
      {
        find: '@mock',
        replacement: path.resolve(__dirname, './src/mocks')
      }
    ],
    extensions: ['.js', '.ts', '.tsx', '.json']
  },
  build: {
    outDir: 'out',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          leaflet: ['leaflet', 'react-leaflet']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
        configure: (proxy: any, _options: any) => {
          proxy.on('error', (err: any, _req: any, _res: any) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  define: {
    global: 'globalThis',
  },
  css: {
    postcss: './postcss.config.mjs'
  }
})
