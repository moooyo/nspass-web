import { http, HttpResponse } from 'msw';
import type {
  RegisterRequest,
  LoginRequest,
  UserProfile
} from '@/types/generated/api/users/user_management';
import { mockLoginUsers, type MockUser } from '@/mocks/data/users';

// 登录验证函数
const authenticateUser = (identifier: string, password: string): MockUser | null => {
  // 根据用户名或邮箱查找用户
  const user = mockLoginUsers.find(u => 
    (u.username === identifier || u.email === identifier) && 
    u.password === password &&
    u.status === 'active'
  );
  return user || null;
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
    
    // 验证输入
    if (!body.username || !body.password) {
      return HttpResponse.json({
        base: { 
          success: false, 
          message: '用户名和密码不能为空',
          errorCode: 'INVALID_INPUT'
        }
      }, { status: 400 });
    }

    // 验证用户
    const user = authenticateUser(body.username, body.password);
    
    if (user) {
      // 更新最后登录时间
      user.lastLoginAt = new Date().toISOString();
      
      return HttpResponse.json({
        base: { success: true, message: '登录成功' },
        data: {
          token: `mock-jwt-token-${user.id}`,
          refreshToken: `mock-refresh-token-${user.id}`,
          expiresIn: 3600,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          }
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