'use client';

import { startMSW, worker } from '@mock/browser';
import { handlers } from '@mock/handlers';

// 最大重试次数
const MAX_RETRIES = 3;

// 添加调试函数到window对象
declare global {
  interface Window {
    debugRouteAPI: () => Promise<void>;
    testRouteAPI: () => Promise<void>;
  }
}

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
    
    try {
      if (worker) {
        await worker.stop();
        console.log('已停止先前的 worker');
      }
    } catch (e) {
      console.log('没有正在运行的 worker 需要停止');
    }
    
    console.log('启动 MSW...');
    const result = await startMSW();
    const success = Boolean(result);
    console.log(`MSW 启动结果: ${success ? '成功' : '失败'}`);
    
    // 添加调试函数到window对象
    if (success && typeof window !== 'undefined') {
      window.debugRouteAPI = async () => {
        console.log('🧪 测试routes API...');
        try {
          const response = await fetch('/api/routes', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log('✅ API响应状态:', response.status);
          const data = await response.json();
          console.log('✅ API响应数据:', data);
        } catch (error) {
          console.error('❌ API调用失败:', error);
        }
      };
      
      window.testRouteAPI = async () => {
        console.log('🧪 测试routes API (带参数)...');
        try {
          const response = await fetch('/api/routes?type=custom', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log('✅ API响应状态:', response.status);
          const data = await response.json();
          console.log('✅ API响应数据:', data);
          return data;
        } catch (error) {
          console.error('❌ API调用失败:', error);
          return null;
        }
      };
      
      console.log('🛠️  调试函数已添加到window对象:');
      console.log('  - window.debugRouteAPI() - 测试基本routes API');
      console.log('  - window.testRouteAPI() - 测试带参数的routes API');
    }
    
    return success;
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