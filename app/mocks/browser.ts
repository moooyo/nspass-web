import { setupWorker } from 'msw/browser';
import { handlers } from '@mock/handlers';

// 创建service worker
export const worker = setupWorker(...handlers);

// 最大重试次数
const MAX_RETRIES = 3;

// 启动MSW的函数
export const startMSW = async (retryCount = 0) => {
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
    
    // 如果失败且未超过重试次数，尝试重新启动
    if (retryCount < MAX_RETRIES) {
      console.log(`重试启动 MSW (${retryCount + 1}/${MAX_RETRIES})...`);
      // 延迟一秒后重试
      setTimeout(() => startMSW(retryCount + 1), 1000);
    } else {
      console.error('MSW 重试启动失败，已达到最大重试次数');
    }
  }
};

// 停止MSW
export const stopMSW = () => {
  worker.stop();
  console.log('⏹️ MSW 已停止');
}; 