import React from 'react'
import { 
  Users, Server, Activity, TrendingUp, AlertTriangle, 
  Shield, Database, Globe, ArrowUpRight, ArrowDownRight,
  Clock, Zap, Eye, Settings
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/auth'
import { useMockStore } from '@/stores/mock'

export default function ModernDashboard() {
  const { user } = useAuthStore()
  const { enabled: mockEnabled } = useMockStore()

  // Mock data for dashboard
  const stats = [
    {
      title: "总用户数",
      value: "1,234",
      change: "+12%",
      changeType: "increase" as const,
      icon: Users,
      description: "比上月增长",
      color: "text-blue-600"
    },
    {
      title: "在线服务器",
      value: "8/10",
      change: "2台离线",
      changeType: "warning" as const,
      icon: Server,
      description: "服务器状态",
      color: "text-green-600"
    },
    {
      title: "今日流量",
      value: "2.4TB",
      change: "+5%",
      changeType: "increase" as const,
      icon: Activity,
      description: "比昨日增长",
      color: "text-purple-600"
    },
    {
      title: "活跃规则",
      value: "156",
      change: "运行正常",
      changeType: "stable" as const,
      icon: Shield,
      description: "转发规则数量",
      color: "text-orange-600"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "用户登录",
      user: "张三",
      time: "2分钟前",
      status: "success"
    },
    {
      id: 2,
      type: "规则更新",
      user: "李四",
      time: "5分钟前", 
      status: "info"
    },
    {
      id: 3,
      type: "服务器告警",
      user: "系统",
      time: "10分钟前",
      status: "warning"
    },
    {
      id: 4,
      type: "用户注册",
      user: "王五",
      time: "15分钟前",
      status: "success"
    }
  ]

  const serverStatus = [
    { name: "上海-01", status: "online", load: 45, users: 234 },
    { name: "上海-02", status: "online", load: 67, users: 189 },
    { name: "北京-01", status: "online", load: 23, users: 145 },
    { name: "深圳-01", status: "offline", load: 0, users: 0 },
    { name: "广州-01", status: "online", load: 78, users: 298 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-600'
      case 'warning': return 'bg-yellow-100 text-yellow-600'
      case 'info': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            欢迎回来，{user?.name || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            这是您的 NSPass 管理仪表盘，实时查看系统状态和数据统计。
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {mockEnabled && (
            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              <Zap className="w-3 h-3 mr-1" />
              演示模式
            </Badge>
          )}
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            <Activity className="w-3 h-3 mr-1" />
            系统正常
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {stat.changeType === 'increase' && (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                )}
                {stat.changeType === 'warning' && (
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                )}
                <span>{stat.change}</span>
                <span>·</span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              服务器状态
            </CardTitle>
            <CardDescription>
              实时监控所有服务器的运行状态和负载情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serverStatus.map((server, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)}`}></div>
                    <div>
                      <p className="font-medium">{server.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {server.status === 'online' ? `${server.users} 用户在线` : '离线'}
                      </p>
                    </div>
                  </div>
                  
                  {server.status === 'online' && (
                    <div className="flex items-center space-x-4">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>负载</span>
                          <span>{server.load}%</span>
                        </div>
                        <Progress value={server.load} className="h-2" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        查看
                      </Button>
                    </div>
                  )}
                  
                  {server.status === 'offline' && (
                    <Badge variant="destructive">离线</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              最近活动
            </CardTitle>
            <CardDescription>
              系统最新的操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityIcon(activity.status)}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用的管理功能快捷入口
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span className="text-xs">用户管理</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Server className="w-6 h-6" />
              <span className="text-xs">服务器</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Shield className="w-6 h-6" />
              <span className="text-xs">安全规则</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Database className="w-6 h-6" />
              <span className="text-xs">数据库</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Globe className="w-6 h-6" />
              <span className="text-xs">网络配置</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="w-6 h-6" />
              <span className="text-xs">系统设置</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
