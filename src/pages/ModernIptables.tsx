import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Shield,
  Play,
  Pause,
  Edit2,
  Trash2,
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Copy
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

interface IptablesRule {
  id: string
  name: string
  chain: 'INPUT' | 'OUTPUT' | 'FORWARD' | 'PREROUTING' | 'POSTROUTING'
  table: 'filter' | 'nat' | 'mangle' | 'raw'
  protocol: 'tcp' | 'udp' | 'icmp' | 'all'
  source: string
  destination: string
  port: string
  action: 'ACCEPT' | 'DROP' | 'REJECT' | 'REDIRECT' | 'MASQUERADE'
  status: 'active' | 'inactive' | 'error'
  priority: number
  matches: number
  bytes: number
  createdAt: string
  lastMatch: string
  description?: string
}

const mockRules: IptablesRule[] = [
  {
    id: '1',
    name: 'SSH访问限制',
    chain: 'INPUT',
    table: 'filter',
    protocol: 'tcp',
    source: '192.168.1.0/24',
    destination: 'any',
    port: '22',
    action: 'ACCEPT',
    status: 'active',
    priority: 1,
    matches: 1547,
    bytes: 234567,
    createdAt: '2024-01-10T08:00:00Z',
    lastMatch: '2024-01-15T10:30:00Z',
    description: '允许内网SSH访问'
  },
  {
    id: '2',
    name: 'HTTP流量转发',
    chain: 'PREROUTING',
    table: 'nat',
    protocol: 'tcp',
    source: 'any',
    destination: '10.0.0.1',
    port: '80',
    action: 'REDIRECT',
    status: 'active',
    priority: 2,
    matches: 45623,
    bytes: 123456789,
    createdAt: '2024-01-08T14:30:00Z',
    lastMatch: '2024-01-15T10:25:00Z',
    description: 'HTTP流量重定向到代理端口'
  },
  {
    id: '3',
    name: '阻止外部访问',
    chain: 'INPUT',
    table: 'filter',
    protocol: 'all',
    source: '0.0.0.0/0',
    destination: 'any',
    port: '8080',
    action: 'DROP',
    status: 'active',
    priority: 3,
    matches: 892,
    bytes: 45672,
    createdAt: '2024-01-05T16:20:00Z',
    lastMatch: '2024-01-15T09:15:00Z',
    description: '阻止外部访问管理端口'
  },
  {
    id: '4',
    name: '测试规则',
    chain: 'OUTPUT',
    table: 'filter',
    protocol: 'udp',
    source: 'any',
    destination: '8.8.8.8',
    port: '53',
    action: 'ACCEPT',
    status: 'inactive',
    priority: 5,
    matches: 0,
    bytes: 0,
    createdAt: '2024-01-12T10:00:00Z',
    lastMatch: '',
    description: '测试DNS解析规则'
  }
]

const chainColors = {
  'INPUT': 'blue',
  'OUTPUT': 'green',
  'FORWARD': 'orange',
  'PREROUTING': 'purple',
  'POSTROUTING': 'pink'
}

const actionColors = {
  'ACCEPT': 'default',
  'DROP': 'destructive',
  'REJECT': 'destructive',
  'REDIRECT': 'secondary',
  'MASQUERADE': 'outline'
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

export default function ModernIptables() {
  const [rules, setRules] = useState<IptablesRule[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { enabled: mockEnabled } = useMockStore()

  useEffect(() => {
    // 模拟数据加载
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      setRules(mockRules)
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.chain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnable = (rule: IptablesRule) => {
    toast({
      title: "启用规则",
      description: `正在启用规则 ${rule.name}...`,
    })
  }

  const handleDisable = (rule: IptablesRule) => {
    toast({
      title: "禁用规则",
      description: `正在禁用规则 ${rule.name}...`,
    })
  }

  const handleEdit = (rule: IptablesRule) => {
    toast({
      title: "编辑规则",
      description: `正在编辑规则 ${rule.name}...`,
    })
  }

  const handleDelete = (rule: IptablesRule) => {
    toast({
      title: "删除规则",
      description: `规则 ${rule.name} 已删除`,
      variant: "destructive"
    })
  }

  const handleCopyRule = (rule: IptablesRule) => {
    const command = generateIptablesCommand(rule)
    navigator.clipboard.writeText(command)
    toast({
      title: "复制成功",
      description: "iptables命令已复制到剪贴板",
    })
  }

  const generateIptablesCommand = (rule: IptablesRule) => {
    let cmd = `iptables -t ${rule.table} -A ${rule.chain}`
    if (rule.protocol !== 'all') cmd += ` -p ${rule.protocol}`
    if (rule.source !== 'any') cmd += ` -s ${rule.source}`
    if (rule.destination !== 'any') cmd += ` -d ${rule.destination}`
    if (rule.port && rule.port !== 'any') cmd += ` --dport ${rule.port}`
    cmd += ` -j ${rule.action}`
    return cmd
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
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
    return <LoadingPage message="正在加载iptables规则..." />
  }

  // 统计数据
  const totalMatches = rules.reduce((sum, rule) => sum + rule.matches, 0)
  const activeCount = rules.filter(rule => rule.status === 'active').length
  const totalBytes = rules.reduce((sum, rule) => sum + rule.bytes, 0)
  const errorCount = rules.filter(rule => rule.status === 'error').length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">IPTables 管理</h2>
          <p className="text-muted-foreground">
            管理和监控防火墙规则配置
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加规则
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总规则数</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">总匹配数</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 +156
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">处理流量</CardTitle>
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalBytes)}</div>
            <p className="text-xs text-muted-foreground">
              总处理流量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">异常规则</CardTitle>
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
            placeholder="搜索规则..."
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

      {/* 规则表格 */}
      <Card>
        <CardHeader>
          <CardTitle>规则列表</CardTitle>
          <CardDescription>
            {mockEnabled && (
              <Badge variant="outline" className="mr-2">
                Mock模式
              </Badge>
            )}
            共 {filteredRules.length} 个iptables规则
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>规则名称</TableHead>
                <TableHead>链/表</TableHead>
                <TableHead>协议</TableHead>
                <TableHead>源地址</TableHead>
                <TableHead>目标/端口</TableHead>
                <TableHead>动作</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>匹配数</TableHead>
                <TableHead>最后匹配</TableHead>
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
                    <div className="space-y-1">
                      <Badge variant="outline" style={{ color: chainColors[rule.chain] as any }}>
                        {rule.chain}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {rule.table}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {rule.protocol.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {rule.source}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div>{rule.destination}</div>
                      {rule.port && rule.port !== 'any' && (
                        <div className="text-muted-foreground">:{rule.port}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionColors[rule.action] as any}>
                      {rule.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[rule.status] as any}>
                      {statusLabels[rule.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{rule.matches.toLocaleString()}</div>
                      <div className="text-muted-foreground">
                        {formatBytes(rule.bytes)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(rule.lastMatch)}
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
                        <DropdownMenuItem onClick={() => handleCopyRule(rule)}>
                          <Copy className="mr-2 h-4 w-4" />
                          复制命令
                        </DropdownMenuItem>
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