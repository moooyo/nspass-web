import { http, HttpResponse } from 'msw';
import type {
  RegisterRequest,
  LoginRequest,
  UserProfile
} from '@/types/generated/api/users/user_management';

// 模拟用户数据
const mockUser: UserProfile = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-07T10:00:00Z'
};

// 认证相关的 API handlers

export const authHandlers = [
  // 用户注册
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = await request.json() as RegisterRequest;
    
    // 模拟验证
    if (!body.username || !body.email || !body.password) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '用户名、邮箱和密码不能为空',
          errorCode: 'INVALID_INPUT'
        }
      }, { status: 400 });
    }

    if (body.username === 'existinguser') {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '用户名已存在',
          errorCode: 'USERNAME_EXISTS'
        }
      }, { status: 409 });
    }

    return HttpResponse.json({
      base: { success: true, message: '注册成功' },
      data: {
        userId: '2',
        username: body.username,
        email: body.email
      }
    });
  }),

  // 用户登录
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest;
    
    // 模拟验证
    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json({
        base: { success: true, message: '登录成功' },
        data: {
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          user: mockUser
        }
      });
    }

    return HttpResponse.json({
      base: { 
        success: false, 
        message: '用户名或密码错误',
        errorCode: 'INVALID_CREDENTIALS'
      }
    }, { status: 401 });
  })
]; 