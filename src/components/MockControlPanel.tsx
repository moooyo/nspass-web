import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMockStore } from '@/stores/mock'
import { useToast } from '@/hooks/use-toast'
import { Power, RefreshCw, Activity, BarChart3 } from 'lucide-react'

export function MockControlPanel() {
  const { enabled, interceptedRequests, toggleMock, resetRequests } = useMockStore()
  const { toast } = useToast()

  const handleToggleMock = () => {
    toggleMock()
    toast({
      title: enabled ? "Mock 已关闭" : "Mock 已开启",
      description: enabled 
        ? "现在将使用真实 API" 
        : "现在将使用模拟数据",
    })
  }

  const handleResetRequests = () => {
    resetRequests()
    toast({
      title: "统计已重置",
      description: "请求计数器已重置为 0",
    })
  }

  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mock 控制面板
          </CardTitle>
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? "开启" : "关闭"}
          </Badge>
        </div>
        <CardDescription>
          开发环境 API 模拟控制
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Mock 状态</span>
          <Button
            size="sm"
            variant={enabled ? "destructive" : "default"}
            onClick={handleToggleMock}
          >
            <Power className="h-4 w-4 mr-1" />
            {enabled ? "关闭" : "开启"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">拦截请求数</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {interceptedRequests}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetRequests}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {enabled && (
          <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">提示</p>
            <p className="text-yellow-700 dark:text-yellow-300">
              当前使用模拟数据，所有 API 请求都会被拦截并返回测试数据
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
