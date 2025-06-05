import { http, HttpResponse } from 'msw';
import type { LoginRequestData } from '../types';

// 认证相关的 API handlers

export const authHandlers = [
  // 模拟登录接口
  http.post('https://api.example.com/auth/login', async ({ request }) => {
    const credentials = await request.json() as LoginRequestData;
    
    // 模拟登录验证
    if (credentials.username === 'admin' && credentials.password === '123456') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin'
          }
        }
      });
    }
    
    return HttpResponse.json(
      { success: false, message: "用户名或密码错误" },
      { status: 401 }
    );
  }),
]; 