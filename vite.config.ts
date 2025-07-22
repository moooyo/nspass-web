import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/types/generated': path.resolve(__dirname, './types/generated'),
      '@': path.resolve(__dirname, './src'),
      '@mock': path.resolve(__dirname, './src/mocks'),
    },
  },
  build: {
    outDir: 'out',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/pro-components'],
          charts: ['@ant-design/charts', '@ant-design/plots'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
        // 静态资源文件名模板
        assetFileNames: (assetInfo) => {
          const extType = path.extname(assetInfo.name).replace('.', '');
          const assetTypes = {
            'css': 'css',
            'woff2': 'fonts',
            'woff': 'fonts',
            'ttf': 'fonts',
            'otf': 'fonts',
            'png': 'images',
            'jpg': 'images',
            'jpeg': 'images',
            'svg': 'images',
            'webp': 'images',
            'gif': 'images'
          };
          const folder = assetTypes[extType] || 'assets';
          return `${folder}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      }
    }
  },
  server: {
    port: 3000,
    host: true, // 允许外部访问
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
    postcss: './postcss.config.mjs',
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/pro-components',
      'leaflet',
    ],
  },
  // 性能相关配置
  esbuild: {
    // 生产环境移除 console.log
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
