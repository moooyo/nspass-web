// 用户管理相关模拟数据

export const mockUsers = [
  {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    role: "admin",
    status: "active",
    createTime: "2023-01-15T08:30:00Z"
  },
  {
    id: 2,
    name: "李四", 
    email: "lisi@example.com",
    role: "user",
    status: "active",
    createTime: "2023-02-20T10:15:00Z"
  },
  {
    id: 3,
    name: "王五",
    email: "wangwu@example.com", 
    role: "user",
    status: "inactive",
    createTime: "2023-03-10T14:45:00Z"
  },
  {
    id: 4,
    name: "赵六",
    email: "zhaoliu@example.com",
    role: "user", 
    status: "active",
    createTime: "2023-04-05T16:20:00Z"
  },
  {
    id: 5,
    name: "钱七",
    email: "qianqi@example.com",
    role: "admin",
    status: "inactive", 
    createTime: "2023-05-12T09:45:00Z"
  }
];

// 登录测试用户数据
export interface MockUser {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  avatar: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt?: string;
}

export const mockLoginUsers: MockUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@nspass.com',
    password: 'admin123',
    name: '管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-07T10:00:00Z'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@nspass.com',
    password: 'user123',
    name: '测试用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-06T15:30:00Z'
  },
  {
    id: '3',
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123',
    name: '演示账号',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    username: 'john',
    email: 'john.doe@gmail.com',
    password: 'john123',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    username: 'alice',
    email: 'alice.smith@outlook.com',
    password: 'alice123',
    name: 'Alice Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z'
  }
]; 