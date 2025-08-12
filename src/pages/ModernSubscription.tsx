import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Copy,
  Edit2,
  Trash2,
  ExternalLink,
  TrendingUp,
  Activity,
  Globe,
  BarChart3,
  Filter
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingPage } from '@/components/ui/loading'
import { useToast } from '@/hooks/use-toast'
import { useMockStore } from '@/stores/mock'

interface SubscriptionData {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'expired'
  requests: number
  lastAccess: string
  userAgent: string
  expiresAt?: string
  description?: string
}

const mockSubscriptions: SubscriptionData[] = [
  {
    id: '1',
    name: 'iOS订阅',
    type: 'Surge',
    status: 'active',
    requests: 1234,
    lastAccess: '2024-01-15T10:30:00Z',
    userAgent: 'Surge iOS/4.11.1',
    expiresAt: '2024-12-31T23:59:59Z',
    description: 'iOS设备专用订阅配置'
  },
  {
    id: '2',
    name: 'Android订阅',
    type: 'Clash',
    status: 'active',
    requests: 856,
    lastAccess: '2024-01-15T09:15:00Z',
    userAgent: 'Clash for Android/2.5.12',
    description: 'Android设备订阅配置'
  },
  {
    id: '3',
    name: '电脑订阅',
    type: 'V2Ray',
    status: 'inactive',
    requests: 234,
    lastAccess: '2024-01-10T14:20:00Z',
    userAgent: 'v2rayN/6.23',
    expiresAt: '2024-06-30T23:59:59Z',
    description: 'Windows电脑使用配置'
  }
]

const subscriptionTypeColors = {
  'Surge': 'blue',
  'Clash': 'red', 
  'V2Ray': 'purple',
  'Shadowsocks': 'green',
  'Quantumult X': 'orange'
}

const statusColors = {
  'active': 'default',
  'inactive': 'secondary',
  'expired': 'destructive'
}

const statusLabels = {
  'active': '活跃',
  'inactive': '不活跃', 
  'expired': '已过期'
}

export default function ModernSubscription() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { enabled: mockEnabled } = useMockStore()

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setLoading(true)
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800))
      setSubscriptions(mockSubscriptions)
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCopyUrl = (subscription: SubscriptionData) => {
    const url = `https://api.nspass.xforward.de/subscription/${subscription.id}`
    navigator.clipboard.writeText(url)
    toast({
      title: "复制成功",
      description: "订阅地址已复制到剪贴板",
    })
  }

  const handleEdit = (subscription: SubscriptionData) => {
    toast({
      title: "编辑订阅", 
      description: `正在编辑订阅: ${subscription.name}`,
    })
  }

  const handleDelete = (subscription: SubscriptionData) => {
    toast({
      title: "删除订阅",
      description: `订阅 ${subscription.name} 已删除`,
      variant: "destructive"
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  if (loading) {
    return <LoadingPage message="正在加载订阅数据..." />
  }

  // 统计数据
  const totalRequests = subscriptions.reduce((sum, sub) => sum + sub.requests, 0)
  const activeCount = subscriptions.filter(sub => sub.status === 'active').length
  const totalCount = subscriptions.length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">订阅管理</h2>
          <p className="text-muted-foreground">
            管理和监控所有的订阅配置
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          创建订阅
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总订阅数</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              活跃订阅 {activeCount} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总请求数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 +234
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均请求</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalRequests / totalCount)}</div>
            <p className="text-xs text-muted-foreground">
              每个订阅
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((activeCount / totalCount) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              订阅活跃率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索订阅..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          筛选
        </Button>
      </div>

      {/* 订阅表格 */}
      <Card>
        <CardHeader>
          <CardTitle>订阅列表</CardTitle>
          <CardDescription>
            {mockEnabled && (
              <Badge variant="outline" className="mr-2">
                Mock模式
              </Badge>
            )}
            共 {filteredSubscriptions.length} 个订阅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订阅名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>请求次数</TableHead>
                <TableHead>最后访问</TableHead>
                <TableHead>客户端</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{subscription.name}</div>
                      {subscription.description && (
                        <div className="text-sm text-muted-foreground">
                          {subscription.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {subscription.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[subscription.status] as any}>
                      {statusLabels[subscription.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscription.requests.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(subscription.lastAccess)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="max-w-[150px] truncate" title={subscription.userAgent}>
                      {subscription.userAgent}
                    </div>
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
                        <DropdownMenuItem onClick={() => handleCopyUrl(subscription)}>
                          <Copy className="mr-2 h-4 w-4" />
                          复制链接
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/subscription/${subscription.id}`, '_blank')}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          新窗口打开
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(subscription)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}