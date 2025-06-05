import { http, HttpResponse } from 'msw';
import { hashPassword } from '@/utils/passwordUtils';
import type { UserInfoUpdateData, PasswordChangeData } from '../types';
import { mockUserInfo } from '../data/userInfo';

// 用户信息相关的 API handlers

export const userInfoHandlers = [
  // 获取当前用户信息
  http.get('https://api.example.com/user/info', () => {
    return HttpResponse.json({
      success: true,
      data: mockUserInfo
    });
  }),

  // 更新当前用户信息
  http.put('https://api.example.com/user/info', async ({ request }) => {
    const updateData = await request.json() as UserInfoUpdateData;
    
    // 只更新允许的字段
    const allowedFields = ['name', 'email', 'avatar', 'phone', 'bio'] as const;
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key as typeof allowedFields[number])) {
        (mockUserInfo)[key as keyof UserInfoUpdateData] = updateData[key as keyof UserInfoUpdateData];
      }
    });
    
    return HttpResponse.json({
      success: true,
      message: "用户信息更新成功",
      data: mockUserInfo
    });
  }),

  // 修改密码
  http.post('/api/users/change-password', async ({ request }) => {
    try {
      const data = await request.json();
      const { oldPassword: _oldPassword, newPassword } = data as PasswordChangeData;
      const _hashedNewPassword = await hashPassword(newPassword);
      
      // 模拟密码验证和更新
      return HttpResponse.json({
        success: true,
        message: '密码修改成功',
        data: null
      });
    } catch {
      return HttpResponse.json(
        { success: false, message: '请求数据格式错误' },
        { status: 400 }
      );
    }
  }),

  // 获取流量统计
  http.get('https://api.example.com/user/info/traffic-stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalUsed: 750,
        totalLimit: 1000,
        dailyUsage: Array.from({ length: 30 }, (_, i) => ({
          date: `2024-01-${i + 1}`,
          upload: Math.floor(Math.random() * 10) + 5,
          download: Math.floor(Math.random() * 20) + 10,
        })),
        monthlyUsage: Array.from({ length: 12 }, (_, i) => ({
          month: `2024-${i + 1}`,
          upload: Math.floor(Math.random() * 100) + 50,
          download: Math.floor(Math.random() * 200) + 100,
        })),
      }
    });
  }),
]; 