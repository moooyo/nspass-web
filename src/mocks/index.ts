// 导出一个初始化函数，而不是在导入时执行
export async function initMockServiceWorker() {
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