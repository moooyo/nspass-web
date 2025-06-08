import { http, HttpResponse } from 'msw';
import { hashPassword } from '@/utils/passwordUtils';

// 认证相关的 API handlers

export const authHandlers = [
  // 用户登录
  http.post('/api/auth/login', async ({ request }) => {
    try {
      const data = await request.json();
      const { username, password } = data as { username: string; password: string };
      
      // 简单的登录验证
      if (username === 'admin' && password) {
        const hashedPassword = await hashPassword(password);
        
        return HttpResponse.json({
          success: true,
          message: '登录成功',
          data: {
            token: `mock-token-${hashedPassword.slice(0, 8)}`,
            user: {
              id: 1,
              username: 'admin',
              role: 'admin',
              lastLogin: new Date().toISOString()
            }
          }
        });
      } else {
        return HttpResponse.json(
          { success: false, message: '用户名或密码错误' },
          { status: 401 }
        );
      }
    } catch {
      return HttpResponse.json(
        { success: false, message: '请求数据格式错误' },
        { status: 400 }
      );
    }
  }),
]; 