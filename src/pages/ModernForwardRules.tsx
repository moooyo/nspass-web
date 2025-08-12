import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowRight,
  Play,
  Pause,
  Edit2,
  Trash2,
  Network,
  Activity,
  Timer,
  Target,
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

interface ForwardRule {
  id: string
  name: string
  sourceServer: string
  sourcePort: number
  targetServer: string
  targetPort: number
  protocol: 'tcp' | 'udp' | 'both'
  status: 'active' | 'inactive' | 'error'
  priority: number
  connections: number
  traffic: number
  latency: number
  createdAt: string
  lastActive: string
  description?: string
}

const mockForwardRules: ForwardRule[] = [
  {
    id: '1',
    name: 'HTTP代理转发',
    sourceServer: 'SH-01',
    sourcePort: 8080,
    targetServer: 'HK-02',
    targetPort: 3128,
    protocol: 'tcp',
    status: 'active',
    priority: 1,
    connections: 67,
    traffic: 8.5 * 1024 * 1024 * 1024, // 8.5GB
    latency: 45,
    createdAt: '2024-01-10T08:00:00Z',
    lastActive: '2024-01-15T10:30:00Z',
    description: '上海到香港的HTTP代理转发'
  },
  {
    id: '2',
    name: 'HTTPS流量转发',
    sourceServer: 'BJ-01',
    sourcePort: 443,
    targetServer: 'US-West',
    targetPort: 443,
    protocol: 'tcp',
    status: 'active',
    priority: 2,
    connections: 123,
    traffic: 15.2 * 1024 * 1024 * 1024, // 15.2GB
    latency: 156,
    createdAt: '2024-01-08T14:30:00Z',
    lastActive: '2024-01-15T10:25:00Z',
    description: '北京到美国西部的HTTPS流量转发'
  },
  {
    id: '3',
    name: 'DNS查询转发',
    sourceServer: 'GZ-01',
    sourcePort: 53,
    targetServer: 'SG-01',
    targetPort: 53,
    protocol: 'udp',
    status: 'active',
    priority: 3,
    connections: 234,
    traffic: 1.2 * 1024 * 1024 * 1024, // 1.2GB
    latency: 89,
    createdAt: '2024-01-05T16:20:00Z',
    lastActive: '2024-01-15T10:20:00Z',
    description: '广州到新加坡的DNS查询转发'
  },
  {
    id: '4',
    name: '测试端口转发',
    sourceServer: 'SZ-01',
    sourcePort: 9999,
    targetServer: 'HK-Test',
    targetPort: 22,
    protocol: 'tcp',
    status: 'inactive',
    priority: 5,
    connections: 0,
    traffic: 0.1 * 1024 * 1024 * 1024, // 0.1GB
    latency: 25,
    createdAt: '2024-01-12T10:00:00Z',
    lastActive: '2024-01-13T08:15:00Z',
    description: '深圳到香港测试服务器的SSH转发'
  }
]

const protocolColors = {
  'tcp': 'blue',
  'udp': 'green',
  'both': 'purple'
}

const statusColors = {
  'active': 'default',
  'inactive': 'secondary',
  'error': 'destructive'
}

const statusLabels = {
  'active': '启用',
  'inactive': '禁用',
  'error': '错误'
}

export default function ModernForwardRules() {
  const [rules, setRules] = useState<ForwardRule[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { enabled: mockEnabled } = useMockStore()

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setRules(mockForwardRules)
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.sourceServer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.targetServer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnable = (rule: ForwardRule) => {
    toast({
      title: "启用规则",
      description: `正在启用转发规则 ${rule.name}...`,
    })
  }

  const handleDisable = (rule: ForwardRule) => {
    toast({
      title: "禁用规则",
      description: `正在禁用转发规则 ${rule.name}...`,
    })
  }

  const handleEdit = (rule: ForwardRule) => {
    toast({
      title: "编辑规则",
      description: `正在编辑转发规则 ${rule.name}...`,
    })
  }

  const handleDelete = (rule: ForwardRule) => {
    toast({
      title: "删除规则",
      description: `转发规则 ${rule.name} 已删除`,
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
    if (latency > 200) return 'text-red-500'
    if (latency > 100) return 'text-yellow-500'
    return 'text-green-500'
  }

  if (loading) {
    return <LoadingPage message="正在加载转发规则..." />
  }

  // 统计数据
  const totalTraffic = rules.reduce((sum, rule) => sum + rule.traffic, 0)
  const activeCount = rules.filter(rule => rule.status === 'active').length
  const totalConnections = rules.reduce((sum, rule) => sum + rule.connections, 0)
  const avgLatency = rules.filter(r => r.status === 'active')
    .reduce((sum, rule) => sum + rule.latency, 0) / activeCount || 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">转发规则</h2>
          <p className="text-muted-foreground">
            管理和监控所有的端口转发规则
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          创建规则
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总规则数</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              启用 {activeCount} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总流量</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTraffic(totalTraffic)}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 +1.5GB
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
              活跃规则平均值
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索转发规则..."
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

      {/* 转发规则表格 */}
      <Card>
        <CardHeader>
          <CardTitle>转发规则列表</CardTitle>
          <CardDescription>
            {mockEnabled && (
              <Badge variant="outline" className="mr-2">
                Mock模式
              </Badge>
            )}
            共 {filteredRules.length} 个转发规则
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>规则名称</TableHead>
                <TableHead>转发路径</TableHead>
                <TableHead>协议</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>延迟</TableHead>
                <TableHead>连接数</TableHead>
                <TableHead>流量</TableHead>
                <TableHead>最后活跃</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{rule.name}</div>
                      {rule.description && (
                        <div className="text-sm text-muted-foreground">
                          {rule.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-muted rounded">
                        {rule.sourceServer}:{rule.sourcePort}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="px-2 py-1 bg-muted rounded">
                        {rule.targetServer}:{rule.targetPort}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ color: protocolColors[rule.protocol] as any }}>
                      {rule.protocol.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[rule.status] as any}>
                      {statusLabels[rule.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getLatencyColor(rule.latency)}>
                      {rule.latency}ms
                    </span>
                  </TableCell>
                  <TableCell>{rule.connections}</TableCell>
                  <TableCell>{formatTraffic(rule.traffic)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(rule.lastActive)}
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
                        {rule.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleDisable(rule)}>
                            <Pause className="mr-2 h-4 w-4" />
                            禁用
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleEnable(rule)}>
                            <Play className="mr-2 h-4 w-4" />
                            启用
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEdit(rule)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(rule)}
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