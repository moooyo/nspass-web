import { http, HttpResponse } from 'msw';

// 仪表盘相关的 API handlers

export const dashboardHandlers = [
  // 获取系统概况
  http.get('/api/dashboard/overview', () => {
    return HttpResponse.json({
      success: true,
      data: {
        userCount: 453,
        activeUserCount: 325,
        serverCount: 18,
        onlineServerCount: 16,
        totalTraffic: 1024 * 1024 * 5, // 5 TB
        dailyTraffic: 1024 * 100, // 100 GB
        systemLoad: {
          cpu: 35,
          memory: 60,
          disk: 45
        }
      }
    });
  }),
  
  // 获取流量统计
  http.get('/api/dashboard/traffic', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalUpload: 1024 * 1024 * 2, // 2 TB
        totalDownload: 1024 * 1024 * 3, // 3 TB
        dailyStats: Array.from({ length: 30 }, (_, i) => ({
          date: `2024-01-${i + 1}`,
          upload: Math.floor(Math.random() * 1024 * 10) + 1024, // 1-11 GB
          download: Math.floor(Math.random() * 1024 * 20) + 2048, // 2-22 GB
        })),
        monthlyStats: Array.from({ length: 12 }, (_, i) => ({
          month: `2024-${i + 1}`,
          upload: Math.floor(Math.random() * 1024 * 100) + 10240, // 10-110 GB
          download: Math.floor(Math.random() * 1024 * 200) + 20480, // 20-220 GB
        }))
      }
    });
  })
]; 