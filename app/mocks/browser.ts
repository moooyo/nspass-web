import { setupWorker } from 'msw/browser';
import { handlers } from '@mock/handlers';

// 创建service worker，确保仅在浏览器环境中执行
// 检查window对象是否存在，确保只在客户端执行
export const worker = typeof window !== 'undefined' ? setupWorker(...handlers) : null;

// 最大重试次数
const MAX_RETRIES = 3;

// worker的状态
let workerStarted = false;

// 启动MSW的函数
export const startMSW = async (retryCount = 0) => {
  if (typeof window === 'undefined') {
    console.log('MSW: 不在浏览器环境中，无法启动');
    return false;
  }

  if (!worker) {
    console.error('MSW: worker未初始化，可能是在服务器端运行');
    return false;
  }

  // 如果worker已经启动，就不需要再次启动
  if (workerStarted) {
    console.log('MSW: 已经在运行中');
    console.log('MSW: 重置处理程序...');
    console.log(`MSW: 当前处理程序数量: ${handlers.length}`);
    await worker.resetHandlers(...handlers);
    return true;
  }

  try {
    console.log('MSW: 开始启动...');
    console.log(`MSW: 加载了 ${handlers.length} 个处理程序`);
    
    // 打印所有处理程序的路径
    handlers.forEach((handler, index) => {
      console.log(`MSW: 处理程序 #${index+1} - ${handler.info.method} ${handler.info.path}`);
    });
    
    await worker.start({
      onUnhandledRequest: 'bypass', // 未处理的请求将被忽略
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    console.log('🚀 MSW (Mock Service Worker) 已启动');
    workerStarted = true;
    return true;
  } catch (error) {
    console.error('MSW 启动失败:', error);
    
    // 如果失败且未超过重试次数，尝试重新启动
    if (retryCount < MAX_RETRIES) {
      console.log(`重试启动 MSW (${retryCount + 1}/${MAX_RETRIES})...`);
      // 延迟一秒后重试
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await startMSW(retryCount + 1);
          resolve(result);
        }, 1000);
      });
    } else {
      console.error('MSW 重试启动失败，已达到最大重试次数');
      return false;
    }
  }
};

// 停止MSW
export const stopMSW = () => {
  if (typeof window === 'undefined' || !worker) {
    console.log('MSW: 不在浏览器环境中，或worker未初始化');
    return false;
  }

  if (!workerStarted) {
    console.log('MSW 未在运行');
    return true;
  }
  
  try {
    worker.stop();
    console.log('⏹️ MSW 已停止');
    workerStarted = false;
    return true;
  } catch (error) {
    console.error('停止 MSW 失败:', error);
    return false;
  }
}; 