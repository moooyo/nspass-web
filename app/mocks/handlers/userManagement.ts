import { http, HttpResponse } from 'msw';
import type {
  UserProfile,
  UpdateUserInfoRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  UploadAvatarData,
  TrafficStats,
  LoginHistoryItem,
  ActivityLogItem,
  ToggleTwoFactorAuthRequest
} from '@/types/generated/api/users/user_management';

// 模拟用户数据
const mockUserProfile: UserProfile = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-07T10:00:00Z'
};

const mockTrafficStats: TrafficStats = {
  uploadTraffic: 1250.8,
  downloadTraffic: 2467.3,
  totalTraffic: 3718.1,
  trafficLimit: 10240,
  resetDate: '2024-02-01T00:00:00Z'
};

export const userManagementHandlers = [
  // 获取当前用户信息
  http.get('/v1/user/profile', () => {
    return HttpResponse.json({
      result: { success: true, message: '获取用户信息成功' },
      data: mockUserProfile
    });
  }),

  // 更新用户信息
  http.put('/v1/user/profile', async ({ request }) => {
    const body = await request.json() as UpdateUserInfoRequest;
    Object.assign(mockUserProfile, body);

    return HttpResponse.json({
      result: { success: true, message: '用户信息更新成功' },
      data: mockUserProfile
    });
  }),

  // 获取流量统计
  http.get('/v1/user/traffic', () => {
    return HttpResponse.json({
      result: { success: true, message: '获取流量统计成功' },
      data: mockTrafficStats
    });
  })
]; 