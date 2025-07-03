'use client';

import { startMSW, worker, forceRestartMSW } from '@mock/browser';
import { handlers } from '@mock/handlers';

// 最大重试次数
const MAX_RETRIES = 3;

// 添加调试函数到window对象
declare global {
  interface Window {
    debugRouteAPI: () => Promise<void>;
    testRouteAPI: () => Promise<void>;
    forceMSWRestart: () => Promise<unknown>;
  }
}

// 明确初始化 MSW - 增强版本，支持强制重启
export async function initMSW(retries = 0, forceRestart = false): Promise<boolean> {
  console.log(`手动初始化 MSW 中${forceRestart ? '（强制重启模式）' : ''}...`);
  
  if (typeof window === 'undefined') {
    console.log('在服务器环境中，跳过 MSW 初始化');
    return false;
  }
  
  try {
    // 先尝试重置处理程序
    console.log(`加载了 ${handlers.length} 个处理程序`);
    
    // 打印前10个处理程序的路径，特别关注routes相关的
    console.log('处理程序列表:');
    handlers.slice(0, 10).forEach((handler, index) => {
      const path = handler.info.path;
      const method = handler.info.method;
      console.log(`处理程序 #${index+1} - ${method} ${path}`);
      
      const pathStr = typeof path === 'string' ? path : path.toString();
      if (pathStr.includes('routes')) {
        console.log(`🛣️  发现routes处理程序: ${method} ${pathStr}`);
      }
    });
    
    // 专门检查routes处理程序
    const routeHandlers = handlers.filter(h => {
      const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
      return pathStr.includes('routes');
    });
    console.log(`🔍 找到 ${routeHandlers.length} 个routes相关的处理程序:`);
    routeHandlers.forEach(handler => {
      const pathStr = typeof handler.info.path === 'string' ? handler.info.path : handler.info.path.toString();
      console.log(`  - ${handler.info.method} ${pathStr}`);
    });
    
    // 如果需要强制重启，使用强制重启功能
    if (forceRestart) {
      console.log('🔄 使用强制重启模式启动 MSW...');
      const success = await forceRestartMSW();
             if (success) {
         console.log('✅ MSW 强制重启成功');
         
         // 添加调试函数到window对象
         if (typeof window !== 'undefined') {
           window.forceMSWRestart = () => forceRestartMSW();
         }
         
         return true;
      } else {
        throw new Error('MSW 强制重启失败');
      }
    } else {
      // 正常启动模式
      try {
        if (worker) {
          await worker.stop();
          console.log('已停止先前的 worker');
        }
      } catch (e) {
        console.log('没有正在运行的 worker 需要停止');
      }
      
      const success = await startMSW(retries);
      
             if (success) {
         console.log('✅ MSW 启动成功');
         
         // 添加调试函数到window对象
         if (typeof window !== 'undefined') {
           window.forceMSWRestart = () => forceRestartMSW();
         }
         
         return true;
      } else {
        throw new Error('MSW 启动失败');
      }
    }
  } catch (error) {
    console.error('MSW 初始化失败:', error);
    
    // 如果失败且未超过重试次数，尝试重新初始化
    if (retries < MAX_RETRIES) {
      console.log(`重试初始化 MSW (${retries + 1}/${MAX_RETRIES})...`);
      
      // 最后一次重试时使用强制重启模式
      const shouldForceRestart = retries === MAX_RETRIES - 1;
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await initMSW(retries + 1, shouldForceRestart);
          resolve(result);
        }, 1000);
      });
    } else {
      console.error('MSW 初始化重试失败，已达到最大重试次数');
      return false;
    }
  }
}

// 导出强制重启功能供外部使用
export { forceRestartMSW }; 