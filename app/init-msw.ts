'use client';

import { startMSW, worker } from '@mock/browser';
import { handlers } from '@mock/handlers';

// 最大重试次数
const MAX_RETRIES = 3;

// 明确初始化 MSW
export async function initMSW(retries = 0): Promise<boolean> {
  console.log('手动初始化 MSW 中...');
  
  if (typeof window === 'undefined') {
    console.log('在服务器环境中，跳过 MSW 初始化');
    return false;
  }
  
  try {
    // 先尝试重置处理程序
    console.log(`加载了 ${handlers.length} 个处理程序`);
    
    // 打印前5个处理程序的路径
    handlers.slice(0, 5).forEach((handler, index) => {
      console.log(`处理程序 #${index+1} - ${handler.info.method} ${handler.info.path}`);
    });
    
    try {
      await worker.stop();
      console.log('已停止先前的 worker');
    } catch (e) {
      console.log('没有正在运行的 worker 需要停止');
    }
    
    console.log('启动 MSW...');
    const result = await startMSW();
    console.log(`MSW 启动结果: ${result ? '成功' : '失败'}`);
    
    return result;
  } catch (error) {
    console.error('初始化 MSW 失败:', error);
    
    if (retries < MAX_RETRIES) {
      console.log(`重试初始化 MSW (${retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return initMSW(retries + 1);
    }
    
    return false;
  }
} 