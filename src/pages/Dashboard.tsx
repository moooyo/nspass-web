import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Server, Activity, Settings } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    {
      title: '总用户数',
      value: '1,234',
      description: '+12% 比上月',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: '在线服务器',
      value: '8/10',
      description: '2 台离线',
      icon: Server,
      color: 'text-green-600',
    },
    {
      title: '今日流量',
      value: '2.4TB',
      description: '+5% 比昨日',
      icon: Activity,
      color: 'text-orange-600',
    },
    {
      title: '活跃规则',
      value: '156',
      description: '运行正常',
      icon: Settings,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">
          欢迎来到 NSPass 管理平台
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用的管理操作
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button>添加用户</Button>
          <Button variant="outline">配置服务器</Button>
          <Button variant="outline">创建规则</Button>
          <Button variant="outline">查看日志</Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>
            系统最近的活动记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '2 分钟前', action: '用户 admin 登录系统', type: 'info' },
              { time: '5 分钟前', action: '服务器 US-01 状态异常', type: 'warning' },
              { time: '10 分钟前', action: '创建新的转发规则', type: 'success' },
              { time: '15 分钟前', action: '用户 test@example.com 注册', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
