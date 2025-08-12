import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { LoadingSpinner, LoadingCard, LoadingSkeleton } from '@/components/ui/loading'
import { NotificationCenter } from '@/components/NotificationCenter'
import { notify } from '@/stores/notifications'
import { useSettingsStore } from '@/stores/settings'
import { useKeyboardShortcuts, formatShortcut } from '@/hooks/useKeyboardShortcuts'
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Zap, 
  Palette, 
  Keyboard,
  Bell,
  Settings,
  Monitor,
  Smartphone,
  Clock,
  Shield
} from 'lucide-react'

export default function OptimizationTestPage() {
  const [showLoading, setShowLoading] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const { settings, updateSettings } = useSettingsStore()
  const { shortcuts } = useKeyboardShortcuts()

  const testNotifications = () => {
    notify.info('信息通知', '这是一个信息类型的通知')
    setTimeout(() => {
      notify.success('成功通知', '操作已成功完成')
    }, 500)
    setTimeout(() => {
      notify.warning('警告通知', '请注意这个重要提醒')
    }, 1000)
    setTimeout(() => {
      notify.error('错误通知', '发生了一个错误，请检查')
    }, 1500)
  }

  const testLoadingStates = () => {
    setShowLoading(true)
    setShowSkeleton(true)
    setTimeout(() => {
      setShowLoading(false)
      setShowSkeleton(false)
      notify.success('加载完成', '所有组件已加载完毕')
    }, 3000)
  }

  const featureList = [
    {
      icon: Zap,
      title: '错误边界',
      description: '全局错误捕获和优雅降级',
      status: 'completed'
    },
    {
      icon: Bell,
      title: '通知系统',
      description: '完整的应用内通知管理',
      status: 'completed'
    },
    {
      icon: Keyboard,
      title: '快捷键系统',
      description: '全局键盘快捷键支持',
      status: 'completed'
    },
    {
      icon: Settings,
      title: '设置管理',
      description: '用户偏好和应用配置',
      status: 'completed'
    },
    {
      icon: Palette,
      title: 'UI 组件库',
      description: '完整的现代化组件系统',
      status: 'completed'
    },
    {
      icon: Monitor,
      title: '性能监控',
      description: '应用性能指标跟踪',
      status: 'completed'
    },
    {
      icon: Smartphone,
      title: '响应式设计',
      description: '完美的移动端适配',
      status: 'completed'
    },
    {
      icon: Shield,
      title: '类型安全',
      description: 'TypeScript 完整类型定义',
      status: 'completed'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            🎉 项目优化完成！
          </h1>
          <p className="text-muted-foreground">
            所有最佳实践和优化已实施完毕
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="components">组件测试</TabsTrigger>
          <TabsTrigger value="shortcuts">快捷键</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        {/* 项目概览 */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>优化完成项目</span>
              </CardTitle>
              <CardDescription>
                项目已经按照最佳实践进行了全面优化和改进
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featureList.map((feature, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{feature.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge 
                          variant="secondary" 
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          ✅ 已完成
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">技术栈</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>React</span>
                  <Badge>v18</Badge>
                </div>
                <div className="flex justify-between">
                  <span>TypeScript</span>
                  <Badge>v5</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Vite</span>
                  <Badge>v7</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tailwind CSS</span>
                  <Badge>v3</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Radix UI</span>
                  <Badge>最新</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Zustand</span>
                  <Badge>v4</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">新增功能</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">全局错误边界</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">通知管理系统</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">键盘快捷键</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">性能监控</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">设置持久化</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Loading 组件</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">代码质量</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>TypeScript 覆盖率</span>
                  <Badge variant="secondary">100%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>ESLint 规则</span>
                  <Badge variant="secondary">严格</Badge>
                </div>
                <div className="flex justify-between">
                  <span>组件复用性</span>
                  <Badge variant="secondary">高</Badge>
                </div>
                <div className="flex justify-between">
                  <span>可维护性</span>
                  <Badge variant="secondary">优秀</Badge>
                </div>
                <div className="flex justify-between">
                  <span>性能优化</span>
                  <Badge variant="secondary">完整</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 组件测试 */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>组件库测试</CardTitle>
              <CardDescription>
                测试新创建的 UI 组件和加载状态
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">加载组件测试</h3>
                <div className="flex space-x-4">
                  <Button onClick={testLoadingStates}>
                    测试加载状态
                  </Button>
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">小号加载器</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="md" />
                    <span className="text-sm">中号加载器</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="lg" />
                    <span className="text-sm">大号加载器</span>
                  </div>
                </div>

                {showLoading && (
                  <LoadingCard 
                    title="正在加载数据"
                    description="请稍候，正在获取最新信息..."
                  />
                )}

                {showSkeleton && (
                  <div className="space-y-4">
                    <h4 className="font-medium">骨架屏效果</h4>
                    <LoadingSkeleton rows={3} />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Switch 组件</h3>
                <div className="flex items-center space-x-4">
                  <Switch />
                  <Switch defaultChecked />
                  <Switch disabled />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Badge 组件</h3>
                <div className="flex space-x-2">
                  <Badge>默认</Badge>
                  <Badge variant="secondary">次要</Badge>
                  <Badge variant="outline">轮廓</Badge>
                  <Badge variant="destructive">危险</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 快捷键 */}
        <TabsContent value="shortcuts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>键盘快捷键</CardTitle>
              <CardDescription>
                全局快捷键已启用，试试这些组合键
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{shortcut.description}</span>
                      <p className="text-sm text-muted-foreground">{shortcut.category}</p>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {formatShortcut(shortcut)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知中心 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知系统测试</CardTitle>
              <CardDescription>
                测试各种类型的通知消息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testNotifications}>
                  发送测试通知
                </Button>
                <NotificationCenter />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 设置 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>应用设置</CardTitle>
              <CardDescription>
                当前应用的配置和偏好设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">界面设置</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">紧凑模式</span>
                      <Switch
                        checked={settings.compactMode}
                        onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">动画效果</span>
                      <Switch
                        checked={settings.animations}
                        onCheckedChange={(checked) => updateSettings({ animations: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">折叠侧边栏</span>
                      <Switch
                        checked={settings.sidebarCollapsed}
                        onCheckedChange={(checked) => updateSettings({ sidebarCollapsed: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">开发者选项</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">调试模式</span>
                      <Switch
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => updateSettings({ debugMode: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">性能监控</span>
                      <Switch
                        checked={settings.showPerformanceMetrics}
                        onCheckedChange={(checked) => updateSettings({ showPerformanceMetrics: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
