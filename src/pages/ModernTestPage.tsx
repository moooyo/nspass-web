import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Palette, Layout, Users, Zap, CheckCircle } from 'lucide-react'

export default function ModernTestPage() {
  const features = [
    {
      title: "现代化UI组件",
      description: "基于 Radix UI + Tailwind CSS 的现代化组件库",
      icon: Layout,
      status: "completed",
      details: ["Shadcn/ui 组件", "响应式设计", "深色模式支持", "动画效果"]
    },
    {
      title: "完整认证系统",
      description: "支持多种登录方式的完整认证解决方案",
      icon: Users,
      status: "completed", 
      details: ["邮箱密码登录", "Passkey 认证", "OAuth2 登录", "权限管理"]
    },
    {
      title: "现代化主题系统",
      description: "支持浅色/深色模式切换和系统跟随",
      icon: Palette,
      status: "completed",
      details: ["自动主题切换", "CSS 变量系统", "平滑过渡动画", "系统偏好跟随"]
    },
    {
      title: "Mock 数据系统",
      description: "开发环境下的完整 API 模拟系统",
      icon: Zap,
      status: "completed",
      details: ["MSW 集成", "实时切换", "真实数据模拟", "请求拦截"]
    }
  ]

  const uiComponents = [
    { name: "Button", type: "按钮", demo: true },
    { name: "Card", type: "卡片", demo: true },
    { name: "Input", type: "输入框", demo: true },
    { name: "Badge", type: "徽章", demo: true },
    { name: "Avatar", type: "头像", demo: true },
    { name: "Dropdown", type: "下拉菜单", demo: true },
    { name: "Table", type: "表格", demo: true },
    { name: "Progress", type: "进度条", demo: true }
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">NSPass 现代化 UI</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          完全重新设计的现代化管理界面，采用最新的设计理念和技术栈
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            已完成
          </Badge>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3 h-3 mr-1" />
            现代化
          </Badge>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="card-hover">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.details.map((detail, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UI Components Demo */}
      <Card>
        <CardHeader>
          <CardTitle>UI 组件库</CardTitle>
          <CardDescription>
            现代化的 UI 组件，基于 Radix UI 和 Tailwind CSS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uiComponents.map((component, index) => (
              <div key={index} className="p-4 border rounded-lg text-center space-y-2">
                <div className="font-medium">{component.name}</div>
                <div className="text-sm text-muted-foreground">{component.type}</div>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已实现
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速体验</CardTitle>
          <CardDescription>
            立即体验现代化界面的各项功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex-col space-y-2" onClick={() => window.location.href = '/dashboard'}>
              <Layout className="w-6 h-6" />
              <span>仪表盘</span>
            </Button>
            <Button className="h-16 flex-col space-y-2" onClick={() => window.location.href = '/users'}>
              <Users className="w-6 h-6" />
              <span>用户管理</span>
            </Button>
            <Button className="h-16 flex-col space-y-2" onClick={() => window.location.href = '/login'}>
              <Sparkles className="w-6 h-6" />
              <span>登录页面</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>技术栈</CardTitle>
          <CardDescription>
            采用最新的前端技术栈构建
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">⚛️</div>
              <div className="font-medium">React 19</div>
              <div className="text-sm text-muted-foreground">UI 框架</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎨</div>
              <div className="font-medium">Tailwind CSS</div>
              <div className="text-sm text-muted-foreground">样式系统</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🧩</div>
              <div className="font-medium">Radix UI</div>
              <div className="text-sm text-muted-foreground">组件库</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📱</div>
              <div className="font-medium">响应式</div>
              <div className="text-sm text-muted-foreground">适配设计</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
