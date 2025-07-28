'use client';

// 最大重试次数
import { handlers } from './mocks/handlers';
import { createLogger } from './utils/logger';

const logger = createLogger('MSW');
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
export async function initMSW(forceRestart = false, retries = 0): Promise<boolean> {
  // 在生产环境或MSW被明确禁用时，直接返回false
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_MSW !== 'true') {
    logger.debug('MSW is disabled in production mode or explicitly disabled');
    return false;
  }

  logger.debug('🔍 initMSW函数开始执行...')
  logger.debug(`手动初始化 MSW 中${forceRestart ? '（强制重启模式）' : ''}...`)
  logger.debug(`当前重试次数: ${retries}/${MAX_RETRIES}`)
  
  if (typeof window === 'undefined') {
    logger.debug('在服务器环境中，跳过 MSW 初始化')
    return false;
  }
  
  logger.debug('✅ 浏览器环境检查通过')
  
  try {
    // 动态导入 MSW 模块
    const { startMSW, worker, forceRestartMSW } = await import('@/mocks/browser');
    const { handlers } = await import('@/mocks/handlers');
    
    logger.debug(`Worker对象存在: ${worker ? '是' : '否'}`)
    
    // 先尝试重置处理程序
    logger.debug(`加载了 ${handlers.length} 个处理程序`)
    
    // 打印前10个处理程序的路径，特别关注routes相关的
    logger.debug('处理程序列表:')
    handlers.slice(0, 10).forEach((handler, index) => {
      const path = handler.info.path;
      const method = handler.info.method;
      logger.debug(`处理程序 #${index+1} - ${method} ${path}`)
      
      const pathStr = typeof path === 'string' ? path : path.toString();
      if (pathStr.includes('routes')) {
        logger.debug(`🛣️  发现routes处理程序: ${method} ${pathStr}`)
      }
    });
    
    // 专门检查routes处理程序
    const routeHandlers = handlers.filter(h => {
      const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
      return pathStr.includes('routes');
    });
    logger.debug(`🔍 找到 ${routeHandlers.length} 个routes相关的处理程序:`);
    routeHandlers.forEach((handler, index) => {
      const pathStr = typeof handler.info.path === 'string' ? handler.info.path : handler.info.path.toString();
      logger.debug(`  - ${handler.info.method} ${pathStr}`)
    });
    
    // 处理程序集合完成，开始启动MSW
    if (forceRestart || !worker?.listHandlers().length) {
      logger.info('🔄 使用强制重启模式启动 MSW...')
      try {
        await forceRestartMSW();
        logger.info('✅ MSW 强制重启成功')
        
        // 验证handler是否正确安装（移除不必要的200ms延迟）
        const installedHandlers = worker?.listHandlers() || [];
        if (installedHandlers.length === 0) {
          throw new Error('强制重启后仍未找到任何处理程序');
        }
        
        return true;
      } catch (error: any) {
        throw new Error(`强制重启MSW失败: ${error?.message || error}`);
      }
    } else {
      // 正常启动模式
      logger.info('🚀 正常启动模式...')
      
      // 检查是否有正在运行的worker
      if (worker?.listHandlers().length && worker.listHandlers().length > 0) {
        logger.debug('停止先前的worker...')
        worker.stop();
        logger.debug('已停止先前的 worker')
      } else {
        logger.debug('没有正在运行的 worker 需要停止')
      }
      
      logger.debug('调用startMSW函数...')
      // 修复：startMSW接受options对象，而不是retries数字
      const success = await startMSW({ 
        quiet: false,
        forceRestart: false 
      });
      
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
    console.error('❌ MSW 初始化失败:', error);
    
    // 如果失败且未超过重试次数，尝试重新初始化
    if (retries < MAX_RETRIES) {
      console.log(`🔄 重试初始化 MSW (${retries + 1}/${MAX_RETRIES})...`);
      
      // 最后一次重试时使用强制重启模式
      const shouldForceRestart = retries === MAX_RETRIES - 1;
      
      return new Promise((resolve) => {
        setTimeout(async () => {
          console.log(`⏰ 等待1秒后重试...`);
          const result = await initMSW(shouldForceRestart, retries + 1);
          resolve(result);
        }, 1000);
      });
    } else {
      console.error('❌ MSW 初始化重试失败，已达到最大重试次数');
      return false;
    }
  }
}

// 导出强制重启功能供外部使用
export function forceRestartMSW() {
  if (typeof window === 'undefined') {
    logger.warn('forceRestartMSW 只能在客户端执行')
    return Promise.resolve();
  }

  try {
    // 延迟导入以避免循环依赖
    import('@/mocks/browser').then(({ forceRestartMSW: restart }) => {
      restart();
    });
  } catch (error) {
    logger.error('导出 forceRestartMSW 失败:', error)
  }
} 