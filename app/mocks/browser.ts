import { setupWorker } from 'msw/browser';
import { handlers } from '@mock/handlers';

// 创建service worker，确保仅在浏览器环境中执行
// 检查window对象是否存在，确保只在客户端执行
export const worker = typeof window !== 'undefined' ? setupWorker(...handlers) : null;

// 最大重试次数
const MAX_RETRIES = 3;

// worker的状态
let workerStarted = false;
let workerStarting = false;

// 强制清理所有Service Worker的函数
async function clearAllServiceWorkers(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    console.log('🧹 开始清理所有Service Worker...');
    
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`发现 ${registrations.length} 个Service Worker注册`);
    
    for (const registration of registrations) {
      console.log(`注销Service Worker: ${registration.scope}`);
      await registration.unregister();
    }
    
    // 等待所有Service Worker完全停止
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ 所有Service Worker已清理');
  } catch (error) {
    console.error('清理Service Worker时出错:', error);
  }
}

// 静态资源检测函数 - 更加完善的过滤逻辑
function isStaticResource(url: URL): boolean {
  const pathname = url.pathname;
  
  // Next.js 静态资源路径
  const nextjsPatterns = [
    '/_next/',           // Next.js 构建产物
    '/_nextjs_original-stack-frames', // Next.js 错误堆栈
    '/static/',          // 静态文件目录
    '/public/',          // 公共文件目录
  ];
  
  // Next.js 字体路径
  const fontPatterns = [
    '/_nextjs_font/',    // Next.js 字体优化
    '/fonts/',           // 字体目录
  ];
  
  // 文件扩展名
  const staticExtensions = [
    '.js', '.mjs', '.jsx', '.ts', '.tsx',  // JavaScript/TypeScript
    '.css', '.scss', '.sass', '.less',     // 样式文件
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp', // 图像
    '.woff', '.woff2', '.ttf', '.eot', '.otf',  // 字体
    '.mp3', '.mp4', '.avi', '.mov', '.webm',    // 媒体
    '.pdf', '.doc', '.docx', '.txt',           // 文档
    '.zip', '.rar', '.7z', '.tar', '.gz',      // 压缩包
    '.json', '.xml', '.yaml', '.yml',          // 数据文件
    '.map',                                    // Source map
    '.html', '.htm',                           // HTML文件
  ];
  
  // 检查Next.js相关路径
  for (const pattern of [...nextjsPatterns, ...fontPatterns]) {
    if (pathname.startsWith(pattern)) {
      return true;
    }
  }
  
  // 检查文件扩展名
  for (const ext of staticExtensions) {
    if (pathname.endsWith(ext)) {
      return true;
    }
  }
  
  // 特殊处理：Next.js chunks（无扩展名的情况）
  if (pathname.includes('/chunks/') || pathname.includes('/static/')) {
    return true;
  }
  
  // 检查是否为根目录下的静态文件（如 favicon.ico, robots.txt）
  const rootStaticFiles = [
    '/favicon.ico', '/robots.txt', '/sitemap.xml', 
    '/manifest.json', '/sw.js', '/workbox-*.js'
  ];
  
  for (const file of rootStaticFiles) {
    if (pathname === file || pathname.includes(file)) {
      return true;
    }
  }
  
  return false;
}

// API请求检测函数
function isAPIRequest(url: URL): boolean {
  const pathname = url.pathname;
  
  // API路径模式
  const apiPatterns = [
    '/api/',              // Next.js API routes
    '/v1/',               // 版本化API
    '/v2/',               // 版本化API
    '/graphql',           // GraphQL
    '/trpc/',             // tRPC
  ];
  
  return apiPatterns.some(pattern => pathname.startsWith(pattern));
}

// 启动MSW的函数 - 增强版本，包含强制重置
export const startMSW = async (retryCount = 0, forceReset = false) => {
  if (typeof window === 'undefined') {
    console.log('MSW: 不在浏览器环境中，无法启动');
    return false;
  }

  if (!worker) {
    console.error('MSW: worker未初始化，可能是在服务器端运行');
    return false;
  }

  // 如果需要强制重置，先清理所有Service Worker
  if (forceReset) {
    console.log('🔄 强制重置模式：清理所有Service Worker...');
    await clearAllServiceWorkers();
    workerStarted = false;
    workerStarting = false;
  }

  // 如果worker已经启动，就不需要再次启动
  if (workerStarted && !forceReset) {
    console.log('MSW: 已经在运行中，重置处理程序...');
    console.log(`MSW: 当前处理程序数量: ${handlers.length}`);
    try {
      await worker.resetHandlers(...handlers);
      console.log('MSW: 处理程序重置完成');
    } catch (error) {
      console.error('MSW: 重置处理程序失败:', error);
    }
    return true;
  }

  // 如果正在启动，等待完成
  if (workerStarting) {
    console.log('MSW: 正在启动中，等待完成...');
    let attempts = 0;
    const maxWaitAttempts = 30; // 最多等待3秒
    while (workerStarting && attempts < maxWaitAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    return workerStarted;
  }

  try {
    workerStarting = true;
    console.log('MSW: 开始启动...');
    console.log(`MSW: 加载了 ${handlers.length} 个处理程序`);
    
    // 打印前10个处理程序的路径，用于调试
    console.log('MSW: 处理程序列表(前10个):');
    handlers.slice(0, 10).forEach((handler, index) => {
      console.log(`MSW: 处理程序 #${index+1} - ${handler.info.method} ${handler.info.path}`);
    });
    
    // 特别检查auth相关的处理程序
    const authHandlers = handlers.filter(h => {
      const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
      return pathStr.includes('auth') || pathStr.includes('login');
    });
    console.log(`🔐 找到 ${authHandlers.length} 个认证相关的处理程序:`);
    authHandlers.forEach(handler => {
      const pathStr = typeof handler.info.path === 'string' ? handler.info.path : handler.info.path.toString();
      console.log(`  - ${handler.info.method} ${pathStr}`);
    });
    
    await worker.start({
      onUnhandledRequest(request, print) {
        const url = new URL(request.url);
        
        // 首先检查是否为静态资源
        if (isStaticResource(url)) {
          // 完全静默处理静态资源，不输出任何日志
          return;
        }
        
        // 检查是否为API请求
        if (isAPIRequest(url)) {
          // 对未处理的API请求显示详细警告
          console.warn(`🚨 MSW: 未处理的API请求:`);
          console.warn(`   方法: ${request.method}`);
          console.warn(`   URL: ${url.href}`);
          console.warn(`   路径: ${url.pathname}`);
          console.warn(`   查询参数: ${url.search}`);
          console.warn(`   请检查MSW handlers是否正确配置了此路由`);
          
          // 检查是否有匹配的handlers
          const potentialMatches = handlers.filter(h => {
            const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
            return pathStr.includes(url.pathname.replace(/^\//, '')) || url.pathname.includes(pathStr.replace(/^\//, ''));
          });
          
          if (potentialMatches.length > 0) {
            console.warn(`   可能匹配的handlers:`);
            potentialMatches.forEach(h => {
              const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
              console.warn(`     - ${h.info.method} ${pathStr}`);
            });
          } else {
            console.warn(`   未找到任何可能匹配的handlers`);
          }
          
          print.warning();
        } else {
          // 对其他类型的请求进行调试输出（开发环境）
          if (process.env.NODE_ENV === 'development') {
            console.debug(`🔍 MSW: 未知请求类型: ${request.method} ${url.href}`);
          }
        }
      },
      serviceWorker: {
        url: '/mockServiceWorker.js',
        // 添加更多配置选项来优化Service Worker行为
        options: {
          scope: '/'
        }
      },
      // 添加安静模式选项
      quiet: false, // 可以设置为true来减少日志输出
    });
    
    console.log('🚀 MSW (Mock Service Worker) 已启动');
    console.log('✅ 已启用静态资源智能过滤');
    console.log('🎯 只拦截API请求，忽略所有静态资源');
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
          const result = await startMSW(retryCount + 1, retryCount === MAX_RETRIES - 1);
          resolve(result);
        }, 1000);
      });
    } else {
      console.error('MSW 重试启动失败，已达到最大重试次数');
      return false;
    }
  } finally {
    workerStarting = false;
  }
};

// 停止MSW
export const stopMSW = async () => {
  if (typeof window === 'undefined' || !worker) {
    console.log('MSW: 不在浏览器环境中，或worker未初始化');
    return false;
  }

  if (!workerStarted) {
    console.log('MSW 未在运行');
    return true;
  }
  
  try {
    await worker.stop();
    console.log('⏹️ MSW 已停止');
    workerStarted = false;
    return true;
  } catch (error) {
    console.error('停止 MSW 失败:', error);
    return false;
  }
};

// 强制重启MSW的函数
export const forceRestartMSW = async () => {
  console.log('🔄 强制重启 MSW...');
  
  try {
    // 停止当前的MSW
    await stopMSW();
    
    // 清理所有Service Worker
    await clearAllServiceWorkers();
    
    // 重新启动MSW
    const success = await startMSW(0, true);
    
    if (success) {
      console.log('✅ MSW 强制重启成功');
    } else {
      console.error('❌ MSW 强制重启失败');
    }
    
    return success;
  } catch (error) {
    console.error('强制重启 MSW 时出错:', error);
    return false;
  }
}; 