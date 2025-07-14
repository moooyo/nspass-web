import { http, HttpResponse } from 'msw';
import type {
  RegisterRequest,
  LoginRequest
} from '@/types/generated/api/users/user_auth';
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
  http.post('/v1/auth/register', async ({ request }) => {
    const body = await request.json() as RegisterRequest;
    
    // 模拟验证
    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json({
        status: {
          success: false, 
          message: '用户名、邮箱和密码不能为空',
          errorCode: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    if (body.name === 'existinguser') {
      return HttpResponse.json({
        status: {
          success: false, 
          message: '用户名已存在',
          errorCode: 'USER_EXISTS'
        }
      }, { status: 409 });
    }

    return HttpResponse.json({
      status: {
        success: true, 
        message: '注册成功'
      },
      data: {
        id: 2, // 数字类型的id，与Proto定义一致
        name: body.name,
        email: body.email,
        role: 0 // 新注册用户默认为普通用户
      }
    });
  }),

  // 用户登录
  http.post('/v1/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest;
    
    // 验证输入
    if (!body.identifier || !body.password) {
      return HttpResponse.json({
        status: {
          success: false, 
          message: '登录标识符和密码不能为空',
          errorCode: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // 验证用户 - 使用identifier字段
    const user = authenticateUser(body.identifier, body.password);
    
    if (user) {
      // 更新最后登录时间
      user.lastLoginAt = new Date().toISOString();
      
      return HttpResponse.json({
        status: {
          success: true, 
          message: '登录成功'
        },
        data: {
          id: parseInt(user.id), // 转换为数字类型
          name: user.name,
          email: user.email,
          role: user.role === 'admin' ? 1 : 0, // 转换为数字类型，admin=1, user=0
          token: `mock-jwt-token-${user.id}`,
          expires: Math.floor(Date.now() / 1000) + 3600 // 当前时间 + 1小时
        }
      });
    }

    return HttpResponse.json({
      status: {
        success: false, 
        message: '用户名或密码错误',
        errorCode: 'INVALID_CREDENTIALS'
      }
    }, { status: 401 });
  })
]; 