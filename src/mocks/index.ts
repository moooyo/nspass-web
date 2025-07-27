// 导出一个初始化函数，而不是在导入时执行
export async function initMockServiceWorker() {
  // 检查是否在生产环境或MSW被禁用
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_MSW !== 'true') {
    console.log('MSW: 在生产环境下被禁用，跳过初始化');
    return;
  }

  // 根据环境使用不同的MSW配置
  if (typeof window === 'undefined') {
    // 服务器端环境
    if (import.meta.env.DEV) {
      // 动态导入服务器端 MSW
      const { server } = await import('./server');
      server.listen();
    }
  }
  // 客户端环境由MSWProvider处理
} 