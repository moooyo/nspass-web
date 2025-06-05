import { http, HttpResponse } from 'msw';

// 仪表盘相关的 API handlers

export const dashboardHandlers = [
  // 获取系统概览
  http.get('https://api.example.com/dashboard/overview', () => {
    return HttpResponse.json({
      success: true,
      data: {
        userCount: 2547,
        serverCount: 128,
        ruleCount: 356,
        monthlyTraffic: 1024,
      }
    });
  }),

  // 获取流量趋势
  http.get('https://api.example.com/dashboard/traffic-trend', () => {
    return HttpResponse.json({
      success: true,
      data: Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        traffic: Math.floor(Math.random() * 50) + 10,
      }))
    });
  }),

  // 获取用户流量占比
  http.get('https://api.example.com/dashboard/user-traffic', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { user: '张三', value: 38, traffic: 380 },
        { user: '李四', value: 25, traffic: 250 },
        { user: '王五', value: 15, traffic: 150 },
        { user: '赵六', value: 12, traffic: 120 },
        { user: '其他用户', value: 10, traffic: 100 },
      ]
    });
  }),
]; 