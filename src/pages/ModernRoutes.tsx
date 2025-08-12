import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Route,
  Play,
  Pause,
  Edit2,
  Trash2,
  ArrowRight,
  MapPin,
  Timer,
  Activity,
  Filter,
  Share2
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

interface RouteConfig {
  id: string
  name: string
  path: string[]
  egress: string
  status: 'active' | 'inactive' | 'error'
  priority: number
  traffic: number
  latency: number
  connections: number
  createdAt: string
  lastActive: string
  description?: string
}

const mockRoutes: RouteConfig[] = [
  {
    id: '1',
    name: '美国线路A',
    path: ['SH-01', 'HK-02', 'US-West'],
    egress: 'US-West-SS',
    status: 'active',
    priority: 1,
    traffic: 12.5 * 1024 * 1024 * 1024, // 12.5GB
    latency: 156,
    connections: 45,
    createdAt: '2024-01-10T08:00:00Z',
    lastActive: '2024-01-15T10:30:00Z',
    description: '经香港中转的美国线路，延迟较低'
  },
  {
    id: '2',
    name: '欧洲直连',
    path: ['BJ-01', 'EU-Central'],
    egress: 'EU-Central-Trojan',
    status: 'active',
    priority: 2,
    traffic: 8.3 * 1024 * 1024 * 1024, // 8.3GB
    latency: 203,
    connections: 28,
    createdAt: '2024-01-08T14:30:00Z',
    lastActive: '2024-01-15T09:45:00Z',
    description: '北京到欧洲的直连线路'
  },
  {
    id: '3',
    name: '新加坡中转',
    path: ['GZ-01', 'SG-01', 'SG-02'],
    egress: 'Asia-SG-Snell',
    status: 'inactive',
    priority: 3,
    traffic: 3.2 * 1024 * 1024 * 1024, // 3.2GB
    latency: 89,
    connections: 0,
    createdAt: '2024-01-05T16:20:00Z',
    lastActive: '2024-01-14T15:20:00Z',
    description: '广州经新加坡的亚洲线路'
  },
  {
    id: '4',
    name: '香港测试线路',
    path: ['SZ-01', 'HK-Test'],
    egress: 'HK-VMess',
    status: 'error',
    priority: 5,
    traffic: 0.5 * 1024 * 1024 * 1024, // 0.5GB
    latency: 999,
    connections: 0,
    createdAt: '2024-01-12T10:00:00Z',
    lastActive: '2024-01-13T08:15:00Z',
    description: '测试线路 - 当前不可用'
  }
]

const statusColors = {
  'active': 'default',
  'inactive': 'secondary', 
  'error': 'destructive'
}

const statusLabels = {
  'active': '活跃',
  'inactive': '不活跃',
  'error': '错误'
}

export default function ModernRoutes() {
  const [routes, setRoutes] = useState<RouteConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { enabled: mockEnabled } = useMockStore()

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 700))
      setRoutes(mockRoutes)
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.egress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.path.some(node => node.toLowerCase().includes(searchTerm.toLowerCase())) ||
    route.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleActivate = (route: RouteConfig) => {
    toast({
      title: "激活路由",
      description: `正在激活路由 ${route.name}...`,
    })
  }

  const handleDeactivate = (route: RouteConfig) => {
    toast({
      title: "停用路由",
      description: `正在停用路由 ${route.name}...`,
    })
  }

  const handleEdit = (route: RouteConfig) => {
    toast({
      title: "编辑路由",
      description: `正在编辑路由 ${route.name}...`,
    })
  }

  const handleDelete = (route: RouteConfig) => {
    toast({
      title: "删除路由",
      description: `路由 ${route.name} 已删除`,
      variant: "destructive"
    })
  }

  const formatTraffic = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  const getLatencyColor = (latency: number) => {
    if (latency > 500) return 'text-red-500'
    if (latency > 200) return 'text-yellow-500'
    return 'text-green-500'
  }

  if (loading) {
    return <LoadingPage message="正在加载路由配置..." />
  }

  // 统计数据
  const totalTraffic = routes.reduce((sum, route) => sum + route.traffic, 0)
  const activeCount = routes.filter(route => route.status === 'active').length
  const totalConnections = routes.reduce((sum, route) => sum + route.connections, 0)
  const avgLatency = routes.filter(r => r.status === 'active')
    .reduce((sum, route) => sum + route.latency, 0) / activeCount || 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">路由管理</h2>
          <p className="text-muted-foreground">
            管理和监控所有的网络路由配置
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          创建路由
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总路由数</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">
              活跃 {activeCount} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总流量</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTraffic(totalTraffic)}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 +1.8GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃连接</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              实时连接数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均延迟</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getLatencyColor(avgLatency)}`}>
              {Math.round(avgLatency)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              活跃路由平均值
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索路由..."
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

      {/* 路由表格 */}
      <Card>
        <CardHeader>
          <CardTitle>路由列表</CardTitle>
          <CardDescription>
            {mockEnabled && (
              <Badge variant="outline" className="mr-2">
                Mock模式
              </Badge>
            )}
            共 {filteredRoutes.length} 个路由配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>路由名称</TableHead>
                <TableHead>转发路径</TableHead>
                <TableHead>出口</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>延迟</TableHead>
                <TableHead>流量</TableHead>
                <TableHead>连接数</TableHead>
                <TableHead>最后活跃</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{route.name}</div>
                      {route.description && (
                        <div className="text-sm text-muted-foreground">
                          {route.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      {route.path.map((node, index) => (
                        <React.Fragment key={index}>
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            {node}
                          </span>
                          {index < route.path.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {route.egress}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[route.status] as any}>
                      {statusLabels[route.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getLatencyColor(route.latency)}>
                      {route.latency}ms
                    </span>
                  </TableCell>
                  <TableCell>{formatTraffic(route.traffic)}</TableCell>
                  <TableCell>{route.connections}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(route.lastActive)}
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
                        {route.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleDeactivate(route)}>
                            <Pause className="mr-2 h-4 w-4" />
                            停用
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleActivate(route)}>
                            <Play className="mr-2 h-4 w-4" />
                            激活
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEdit(route)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(route)}
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