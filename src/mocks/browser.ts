import { setupWorker } from 'msw/browser';
import { handlers } from '@mock/handlers';

// 基础环境检查
console.log('🔍 MSW browser.ts模块开始加载...');
console.log(`浏览器环境: ${typeof window !== 'undefined'}`);
console.log(`ServiceWorker支持: ${typeof window !== 'undefined' && 'serviceWorker' in navigator}`);
console.log(`处理程序数量: ${handlers.length}`);

// 创建service worker，确保仅在浏览器环境中执行
// 检查window对象是否存在，确保只在客户端执行
export const worker = typeof window !== 'undefined' ? setupWorker(...handlers) : null;

console.log(`Worker创建结果: ${worker ? '成功' : '失败（可能在服务器端）'}`);

// worker的状态
let workerStarted = false;
let workerStarting = false;
let _lastStartTime = 0;

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
  
  // Vite 开发服务器特殊路径
  const vitePatterns = [
    '/@vite/',           // Vite HMR
    '/@fs/',             // Vite 文件系统
    '/@id/',             // Vite 模块 ID
    '/src/',             // 开发模式下的源文件路径
    '/node_modules/',    // 依赖模块
  ];
  
  // 静态文件目录
  const staticPatterns = [
    '/static/',          // 静态文件目录
    '/public/',          // 公共文件目录
    '/assets/',          // 资源目录
  ];
  
  // 字体路径
  const fontPatterns = [
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
  
  // 检查Vite和静态资源相关路径
  for (const pattern of [...vitePatterns, ...staticPatterns, ...fontPatterns]) {
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
  
  // 特殊处理：Vite构建产物和静态资源
  if (pathname.includes('/assets/') || pathname.includes('/chunks/') || pathname.includes('/static/')) {
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
    '/api/',              // API 接口
    '/v1/',               // 版本化API
    '/v2/',               // 版本化API
    '/graphql',           // GraphQL
    '/trpc/',             // tRPC
  ];
  
  return apiPatterns.some(pattern => pathname.startsWith(pattern));
}

// 启动MSW的函数 - 增强版本，包含强制重置
export const startMSW = async (
  options: {
    quiet?: boolean;
    forceRestart?: boolean;
  } = {}
) => {
  if (typeof window === 'undefined') {
    console.warn('MSW: 服务器端环境，跳过初始化');
    return false;
  }

  if (!worker) {
    console.error('MSW: worker未初始化');
    return false;
  }

  if (workerStarting) {
    console.log('MSW: 已在启动中，等待完成...');
    return workerStarted;
  }

  if (workerStarted && !options.forceRestart) {
    console.log('MSW: 服务已启动，跳过重复启动');
    return true;
  }

  if (options.forceRestart && workerStarted) {
    console.log('MSW: 强制重启模式，先停止现有服务...');
    await worker.stop();
    workerStarted = false;
    _lastStartTime = 0;
    
    // 清理所有Service Workers
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('MSW: 强制清理Service Workers...');
      await clearAllServiceWorkers();
    }
  }

  try {
    workerStarting = true;
    console.log('MSW: 开始启动...');
    console.log(`MSW: 加载了 ${handlers.length} 个处理程序`);
    
    // 打印所有处理程序的路径，用于调试
    console.log('MSW: 所有处理程序列表:');
    handlers.forEach((handler, index) => {
      const pathStr = typeof handler.info.path === 'string' ? handler.info.path : handler.info.path.toString();
      console.log(`MSW: 处理程序 #${index+1} - ${handler.info.method} ${pathStr}`);
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
        
        console.log(`🔍 MSW: 检查请求 ${request.method} ${url.href}`);
        
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
          console.warn(`   Host: ${url.host}`);
          console.warn(`   Origin: ${url.origin}`);
          console.warn(`   请检查MSW handlers是否正确配置了此路由`);
          
          // 检查是否有匹配的handlers
          const exactMatches = handlers.filter(h => {
            const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
            const methodStr = typeof h.info.method === 'string' ? h.info.method : h.info.method.toString();
            const methodMatches = methodStr.toUpperCase() === request.method.toUpperCase();
            const pathMatches = pathStr === url.pathname;
            
            console.log(`  检查handler: ${methodStr} ${pathStr} - 方法匹配: ${methodMatches}, 路径匹配: ${pathMatches}`);
            
            return methodMatches && pathMatches;
          });
          
          const potentialMatches = handlers.filter(h => {
            const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
            return pathStr.includes(url.pathname.replace(/^\//, '')) || url.pathname.includes(pathStr.replace(/^\//, ''));
          });
          
          if (exactMatches.length > 0) {
            console.warn(`   🎯 找到完全匹配的handlers (但未触发):`);
            exactMatches.forEach(h => {
              const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
              const methodStr = typeof h.info.method === 'string' ? h.info.method : h.info.method.toString();
              console.warn(`     - ${methodStr} ${pathStr}`);
            });
          } else if (potentialMatches.length > 0) {
            console.warn(`   🔍 可能匹配的handlers:`);
            potentialMatches.forEach(h => {
              const pathStr = typeof h.info.path === 'string' ? h.info.path : h.info.path.toString();
              const methodStr = typeof h.info.method === 'string' ? h.info.method : h.info.method.toString();
              console.warn(`     - ${methodStr} ${pathStr}`);
            });
          } else {
            console.warn(`   ❌ 未找到任何匹配的handlers`);
          }
          
          print.warning();
        } else {
          // 对其他类型的请求进行调试输出（开发环境）
          if (import.meta.env.DEV) {
            console.debug(`🔍 MSW: 未知请求类型: ${request.method} ${url.href}`);
          }
        }
      }
    });
    
    console.log('🚀 MSW (Mock Service Worker) 已启动');
    console.log('✅ 已启用静态资源智能过滤');
    console.log('🎯 只拦截API请求，忽略所有静态资源');
    workerStarted = true;
    _lastStartTime = Date.now();
    return true;
  } catch (error) {
    console.error('MSW 启动失败:', error);
    return false;
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
    const success = await startMSW({ forceRestart: true });
    
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