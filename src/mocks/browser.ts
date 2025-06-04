import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 创建service worker
export const worker = setupWorker(...handlers);

// 启动MSW的函数
export const startMSW = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'bypass', // 未处理的请求将被忽略
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    console.log('🚀 MSW (Mock Service Worker) 已启动');
  } catch (error) {
    console.error('MSW 启动失败:', error);
  }
};

// 停止MSW
export const stopMSW = () => {
  worker.stop();
  console.log('⏹️ MSW 已停止');
}; 