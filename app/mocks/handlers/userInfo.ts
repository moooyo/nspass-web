import { http, HttpResponse } from 'msw';

// Local type definitions for mock
interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
}

interface UpdateUserInfoRequest {
  username?: string;
  email?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface DeleteAccountRequest {
  password: string;
}

interface UploadAvatarData {
  avatar: string;
}

interface TrafficStats {
  uploadTraffic: number;
  downloadTraffic: number;
  totalTraffic: number;
  trafficLimit: number;
  resetDate: string;
}

interface LoginHistoryItem {
  id: string;
  ip: string;
  userAgent: string;
  location: string;
  loginTime: string;
  success: boolean;
}

interface ActivityLogItem {
  id: string;
  action: string;
  description: string;
  ip: string;
  timestamp: string;
}

interface ToggleTwoFactorAuthRequest {
  enabled: boolean;
  password: string;
}

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

const mockLoginHistory: LoginHistoryItem[] = [
  {
    id: '1',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: '北京, 中国',
    loginTime: '2024-01-07T10:00:00Z',
    success: true
  },
  {
    id: '2',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    location: '上海, 中国',
    loginTime: '2024-01-06T15:30:00Z',
    success: true
  },
  {
    id: '3',
    ip: '10.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: '广州, 中国',
    loginTime: '2024-01-06T08:20:00Z',
    success: false
  }
];

const mockActivityLogs: ActivityLogItem[] = [
  {
    id: '1',
    action: 'LOGIN',
    description: '用户登录',
    ip: '192.168.1.100',
    timestamp: '2024-01-07T10:00:00Z'
  },
  {
    id: '2',
    action: 'UPDATE_PROFILE',
    description: '更新用户资料',
    ip: '192.168.1.100',
    timestamp: '2024-01-07T09:45:00Z'
  },
  {
    id: '3',
    action: 'CREATE_RULE',
    description: '创建转发规则',
    ip: '192.168.1.100',
    timestamp: '2024-01-07T09:30:00Z'
  }
];

export const userInfoHandlers = [
  // 获取当前用户信息
  http.get('/api/v1/user/profile', () => {
    return HttpResponse.json({
      result: { success: true, message: '获取用户信息成功' },
      data: mockUserProfile
    });
  }),

  // 更新用户信息
  http.put('/api/v1/user/profile', async ({ request }) => {
    const body = await request.json() as UpdateUserInfoRequest;
    
    // 更新用户信息
    Object.assign(mockUserProfile, body);

    return HttpResponse.json({
      result: { success: true, message: '用户信息更新成功' },
      data: mockUserProfile
    });
  }),

  // 修改密码
  http.post('/api/v1/user/password', async ({ request }) => {
    const body = await request.json() as ChangePasswordRequest;

    // 模拟密码验证
    if (body.currentPassword !== 'oldpassword') {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '当前密码错误',
          errorCode: 'INVALID_PASSWORD'
        }
      }, { status: 400 });
    }

    return HttpResponse.json({
      result: { success: true, message: '密码修改成功' }
    });
  }),

  // 删除账户
  http.post('/api/v1/user/account/delete', async ({ request }) => {
    const body = await request.json() as DeleteAccountRequest;

    // 模拟密码验证
    if (body.password !== 'password123') {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '密码错误',
          errorCode: 'INVALID_PASSWORD'
        }
      }, { status: 400 });
    }

    return HttpResponse.json({
      result: { success: true, message: '账户删除成功' }
    });
  }),

  // 上传头像
  http.post('/api/v1/user/avatar', async ({ request }) => {
    const body = await request.json() as UploadAvatarData;

    if (!body.avatar) {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '头像数据不能为空',
          errorCode: 'INVALID_INPUT'
        }
      }, { status: 400 });
    }

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    mockUserProfile.avatar = avatarUrl;

    return HttpResponse.json({
      result: { success: true, message: '头像上传成功' },
      data: { avatarUrl }
    });
  }),

  // 获取流量统计
  http.get('/api/v1/user/traffic', () => {
    return HttpResponse.json({
      result: { success: true, message: '获取流量统计成功' },
      data: mockTrafficStats
    });
  }),

  // 重置流量
  http.post('/api/v1/user/traffic/reset', () => {
    mockTrafficStats.uploadTraffic = 0;
    mockTrafficStats.downloadTraffic = 0;
    mockTrafficStats.totalTraffic = 0;
    mockTrafficStats.resetDate = new Date().toISOString();

    return HttpResponse.json({
      result: { success: true, message: '流量重置成功' }
    });
  }),

  // 获取登录历史
  http.get('/api/v1/user/login-history', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedHistory = mockLoginHistory.slice(start, end);

    return HttpResponse.json({
      result: { success: true, message: '获取登录历史成功' },
      data: paginatedHistory,
      pagination: {
        total: mockLoginHistory.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockLoginHistory.length / pageSize)
      }
    });
  }),

  // 获取活动日志
  http.get('/api/v1/user/activity', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedLogs = mockActivityLogs.slice(start, end);

    return HttpResponse.json({
      result: { success: true, message: '获取活动日志成功' },
      data: paginatedLogs,
      pagination: {
        total: mockActivityLogs.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockActivityLogs.length / pageSize)
      }
    });
  }),

  // 二步验证开关
  http.post('/api/v1/user/2fa/toggle', async ({ request }) => {
    const body = await request.json() as ToggleTwoFactorAuthRequest;

    // 模拟密码验证
    if (body.password !== 'password123') {
      return HttpResponse.json({
        result: { 
          success: false, 
          message: '密码错误',
          errorCode: 'INVALID_PASSWORD'
        }
      }, { status: 400 });
    }

    const responseData: any = {
      enabled: body.enabled
    };

    // 如果启用二步验证，返回二维码
    if (body.enabled) {
      responseData.qrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    return HttpResponse.json({
      result: { success: true, message: `二步验证已${body.enabled ? '启用' : '禁用'}` },
      data: responseData
    });
  })
]; 