import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Settings,
  Play,
  Pause,
  Trash2,
  Globe,
  Shield,
  Zap,
  Activity,
  Filter,
  AlertTriangle
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

interface EgressConfig {
  id: string
  name: string
  type: 'shadowsocks' | 'trojan' | 'snell' | 'vmess' | 'vless'
  server: string
  port: number
  status: 'running' | 'stopped' | 'error'
  protocol: string
  encryption?: string
  traffic: number
  connections: number
  lastActive: string
  description?: string
}

const mockEgressConfigs: EgressConfig[] = [
  {
    id: '1',
    name: 'US-West-SS',
    type: 'shadowsocks',
    server: 'us-west.example.com',
    port: 8388,
    status: 'running',
    protocol: 'shadowsocks',
    encryption: 'aes-256-gcm',
    traffic: 15.6 * 1024 * 1024 * 1024, // 15.6GB
    connections: 23,
    lastActive: '2024-01-15T10:30:00Z',
    description: '美国西部 Shadowsocks 代理服务器'
  },
  {
    id: '2', 
    name: 'EU-Central-Trojan',
    type: 'trojan',
    server: 'eu-central.example.com',
    port: 443,
    status: 'running',
    protocol: 'trojan',
    traffic: 8.2 * 1024 * 1024 * 1024, // 8.2GB
    connections: 15,
    lastActive: '2024-01-15T09:45:00Z',
    description: '欧洲中部 Trojan 代理服务器'
  },
  {
    id: '3',
    name: 'Asia-SG-Snell',
    type: 'snell',
    server: 'sg.example.com',
    port: 6160,
    status: 'stopped',
    protocol: 'snell v4',
    encryption: 'chacha20-poly1305',
    traffic: 2.1 * 1024 * 1024 * 1024, // 2.1GB
    connections: 0,
    lastActive: '2024-01-14T15:20:00Z',
    description: '新加坡 Snell 代理服务器'
  },
  {
    id: '4',
    name: 'HK-VMess',
    type: 'vmess',
    server: 'hk.example.com', 
    port: 10086,
    status: 'error',
    protocol: 'vmess',
    encryption: 'auto',
    traffic: 1.3 * 1024 * 1024 * 1024, // 1.3GB
    connections: 0,
    lastActive: '2024-01-13T08:15:00Z',
    description: '香港 VMess 代理服务器 - 连接异常'
  }
]

const typeColors = {
  'shadowsocks': 'blue',
  'trojan': 'purple',
  'snell': 'green',
  'vmess': 'orange',
  'vless': 'red'
}

const statusColors = {
  'running': 'default',
  'stopped': 'secondary',
  'error': 'destructive'
}

const statusLabels = {
  'running': '运行中',
  'stopped': '已停止',
  'error': '错误'
}

export default function ModernEgress() {
  const [egressConfigs, setEgressConfigs] = useState<EgressConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { enabled: mockEnabled } = useMockStore()

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 600))
      setEgressConfigs(mockEgressConfigs)
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredConfigs = egressConfigs.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStart = (config: EgressConfig) => {
    toast({
      title: "启动代理",
      description: `正在启动 ${config.name}...`,
    })
  }

  const handleStop = (config: EgressConfig) => {
    toast({
      title: "停止代理", 
      description: `正在停止 ${config.name}...`,
    })
  }

  const handleConfigure = (config: EgressConfig) => {
    toast({
      title: "配置代理",
      description: `正在配置 ${config.name}...`,
    })
  }

  const handleDelete = (config: EgressConfig) => {
    toast({
      title: "删除代理",
      description: `代理 ${config.name} 已删除`,
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

  if (loading) {
    return <LoadingPage message="正在加载出口配置..." />
  }

  // 统计数据
  const totalTraffic = egressConfigs.reduce((sum, config) => sum + config.traffic, 0)
  const runningCount = egressConfigs.filter(config => config.status === 'running').length
  const totalConnections = egressConfigs.reduce((sum, config) => sum + config.connections, 0)
  const errorCount = egressConfigs.filter(config => config.status === 'error').length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">出口配置</h2>
          <p className="text-muted-foreground">
            管理和监控所有的代理出口服务器
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加出口
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总出口数</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{egressConfigs.length}</div>
            <p className="text-xs text-muted-foreground">
              运行中 {runningCount} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总流量</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTraffic(totalTraffic)}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 +2.1GB
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
            <CardTitle className="text-sm font-medium">异常状态</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCount}</div>
            <p className="text-xs text-muted-foreground">
              {errorCount > 0 ? '需要处理' : '运行正常'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索出口配置..."
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

      {/* 出口配置表格 */}
      <Card>
        <CardHeader>
          <CardTitle>出口列表</CardTitle>
          <CardDescription>
            {mockEnabled && (
              <Badge variant="outline" className="mr-2">
                Mock模式
              </Badge>
            )}
            共 {filteredConfigs.length} 个出口配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>服务器</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>流量</TableHead>
                <TableHead>连接数</TableHead>
                <TableHead>最后活跃</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{config.name}</div>
                      {config.description && (
                        <div className="text-sm text-muted-foreground">
                          {config.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {config.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{config.server}</div>
                      <div className="text-muted-foreground">:{config.port}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[config.status] as any}>
                      {statusLabels[config.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatTraffic(config.traffic)}</TableCell>
                  <TableCell>{config.connections}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(config.lastActive)}
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
                        {config.status === 'running' ? (
                          <DropdownMenuItem onClick={() => handleStop(config)}>
                            <Pause className="mr-2 h-4 w-4" />
                            停止
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStart(config)}>
                            <Play className="mr-2 h-4 w-4" />
                            启动
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleConfigure(config)}>
                          <Settings className="mr-2 h-4 w-4" />
                          配置
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(config)}
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