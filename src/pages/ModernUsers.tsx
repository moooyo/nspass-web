import React, { useState, useMemo } from 'react'
import { 
  Users, Search, Plus, Edit, Trash2, Eye, EyeOff, 
  Shield, UserCheck, Mail, Calendar, Filter, Download,
  MoreHorizontal, Settings, UserPlus
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-08-12T10:30:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    permissions: ['user_management', 'server_management', 'admin']
  },
  {
    id: '2', 
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    role: 'user',
    status: 'active',
    lastLogin: '2024-08-12T08:15:00Z',
    createdAt: '2024-02-20T14:30:00Z',
    permissions: ['basic_access']
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    role: 'moderator',
    status: 'inactive',
    lastLogin: '2024-08-10T16:45:00Z',
    createdAt: '2024-03-10T11:00:00Z',
    permissions: ['user_management', 'content_moderation']
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    role: 'user',
    status: 'suspended',
    lastLogin: '2024-08-08T12:20:00Z',
    createdAt: '2024-04-05T10:15:00Z',
    permissions: ['basic_access']
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qianqi',
    role: 'user',
    status: 'active',
    lastLogin: '2024-08-12T07:30:00Z',
    createdAt: '2024-05-12T15:45:00Z',
    permissions: ['basic_access']
  }
]

export default function ModernUsers() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [searchQuery, selectedRole, selectedStatus])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'user': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "创建失败",
        description: "请填写所有必填字段",
      })
      return
    }

    // Here you would call your API to create the user
    toast({
      title: "用户创建成功",
      description: `用户 ${newUser.name} 已成功创建`,
    })

    setNewUser({ name: '', email: '', password: '', role: 'user' })
    setIsCreateDialogOpen(false)
  }

  const userStats = [
    {
      title: "总用户数",
      value: mockUsers.length.toString(),
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "活跃用户",
      value: mockUsers.filter(u => u.status === 'active').length.toString(),
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "管理员",
      value: mockUsers.filter(u => u.role === 'admin').length.toString(),
      icon: Shield,
      color: "text-purple-600"
    },
    {
      title: "今日登录",
      value: "3",
      icon: Calendar,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center">
            <Users className="w-8 h-8 mr-2" />
            用户管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理系统用户，分配角色和权限，查看用户活动状态。
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出用户
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                添加用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新用户</DialogTitle>
                <DialogDescription>
                  填写用户信息以创建新账户
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">用户名</Label>
                  <Input
                    id="name"
                    placeholder="请输入用户名"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">
                    创建用户
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            查看和管理所有系统用户
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名或邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    角色: {selectedRole === 'all' ? '全部' : selectedRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedRole('all')}>
                    全部角色
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedRole('admin')}>
                    管理员
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedRole('moderator')}>
                    版主
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedRole('user')}>
                    普通用户
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    状态: {selectedStatus === 'all' ? '全部' : selectedStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                    全部状态
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('active')}>
                    活跃
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('inactive')}>
                    不活跃
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedStatus('suspended')}>
                    已暂停
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role === 'admin' ? '管理员' : 
                         user.role === 'moderator' ? '版主' : '用户'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status === 'active' ? '活跃' :
                         user.status === 'inactive' ? '不活跃' : '暂停'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑用户
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            权限设置
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除用户
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">未找到用户</h3>
              <p className="text-muted-foreground">
                没有找到匹配的用户，请尝试调整搜索条件。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
