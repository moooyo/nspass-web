import { http, HttpResponse } from 'msw';

// 简化类型定义，只保留实际需要的
interface TrafficStats {
  uploadTraffic: number;
  downloadTraffic: number;
  totalTraffic: number;
  trafficLimit: number;
  resetDate: string;
}

// 模拟流量统计数据
const mockTrafficStats: TrafficStats = {
  uploadTraffic: 1250.8,
  downloadTraffic: 2467.3,
  totalTraffic: 3718.1,
  trafficLimit: 10240,
  resetDate: '2024-02-01T00:00:00Z'
};

export const userManagementHandlers = [
  // 获取流量统计 - 不与userInfo路由冲突
  http.get('/v1/user/traffic', () => {
    return HttpResponse.json({
      result: { success: true, message: '获取流量统计成功' },
      data: mockTrafficStats
    });
  })
  
  // 注意：删除了与 userInfo handlers 重复的 /v1/user/profile 路由
  // 现在 /v1/users/me 由 userInfoHandlers 专门处理
]; 