import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, ActionsCell } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, RefreshCw, Download, Upload } from 'lucide-react'

// 表格操作配置
export interface TableAction<T = any> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  show?: (item: T) => boolean
}

// 表格工具栏配置
export interface TableToolbar {
  title?: string
  description?: string
  showAdd?: boolean
  addLabel?: string
  onAdd?: () => void
  showRefresh?: boolean
  onRefresh?: () => void
  showExport?: boolean
  onExport?: () => void
  showImport?: boolean
  onImport?: () => void
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }>
}

// 现代化数据表格配置
export interface ModernDataTableConfig<T = any> {
  data: T[]
  columns: ColumnDef<T, any>[]
  loading?: boolean
  searchKey?: string
  searchPlaceholder?: string
  toolbar?: TableToolbar
  actions?: {
    onView?: (item: T) => void
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
    extra?: TableAction<T>[]
  }
  pagination?: {
    pageSize?: number
    showPagination?: boolean
  }
  selection?: {
    enabled?: boolean
    onSelectionChange?: (selectedItems: T[]) => void
  }
  className?: string
}

// 现代化数据表格组件
export function ModernDataTable<T = any>({
  data,
  columns: baseColumns,
  loading = false,
  searchKey,
  searchPlaceholder,
  toolbar,
  actions,
  pagination = { pageSize: 10, showPagination: true },
  selection: _selection,
  className,
}: ModernDataTableConfig<T>) {
  // 如果有操作功能，添加操作列
  const columns = React.useMemo(() => {
    if (!actions || (!actions.onView && !actions.onEdit && !actions.onDelete && !actions.extra?.length)) {
      return baseColumns
    }

    const actionsColumn: ColumnDef<T, any> = {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <ActionsCell
          row={row}
          onView={actions.onView}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
          extraActions={actions.extra}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [...baseColumns, actionsColumn]
  }, [baseColumns, actions])

  return (
    <div className={cn('space-y-4', className)}>
      {/* 工具栏 */}
      {toolbar && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                {toolbar.title && (
                  <CardTitle className="text-xl">{toolbar.title}</CardTitle>
                )}
                {toolbar.description && (
                  <CardDescription className="mt-1">
                    {toolbar.description}
                  </CardDescription>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 自定义操作 */}
                {toolbar.customActions?.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                ))}
                
                {/* 导入 */}
                {toolbar.showImport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toolbar.onImport}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    导入
                  </Button>
                )}
                
                {/* 导出 */}
                {toolbar.showExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toolbar.onExport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                )}
                
                {/* 刷新 */}
                {toolbar.showRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toolbar.onRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
                    刷新
                  </Button>
                )}
                
                {/* 添加 */}
                {toolbar.showAdd && (
                  <Button
                    size="sm"
                    onClick={toolbar.onAdd}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {toolbar.addLabel || '添加'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* 数据表格 */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
            showSearch={!!searchKey}
            showColumnToggle={true}
            showPagination={pagination.showPagination}
            pageSize={pagination.pageSize}
            className="border-0"
          />
        </CardContent>
      </Card>
    </div>
  )
}

// 状态徽章组件
export function StatusBadge({ 
  status, 
  variant = 'default',
  className 
}: { 
  status: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string 
}) {
  const getVariant = (status: string) => {
    const lower = status.toLowerCase()
    if (lower.includes('active') || lower.includes('online') || lower.includes('success')) {
      return 'default'
    }
    if (lower.includes('inactive') || lower.includes('offline') || lower.includes('error') || lower.includes('failed')) {
      return 'destructive'
    }
    if (lower.includes('pending') || lower.includes('warning')) {
      return 'secondary'
    }
    return variant
  }

  return (
    <Badge variant={getVariant(status)} className={className}>
      {status}
    </Badge>
  )
}

// 快速创建列的辅助函数
export const createColumn = {
  // 文本列
  text: <T,>(
    accessor: keyof T,
    header: string,
    options?: {
      sortable?: boolean
      filterable?: boolean
      width?: number
      className?: string
    }
  ): ColumnDef<T, any> => ({
    accessorKey: accessor as string,
    header,
    enableSorting: options?.sortable ?? true,
    enableColumnFilter: options?.filterable ?? true,
    size: options?.width,
    cell: ({ getValue }) => (
      <span className={options?.className}>{getValue()}</span>
    ),
  }),

  // 状态列
  status: <T,>(
    accessor: keyof T,
    header: string,
    options?: {
      variant?: 'default' | 'secondary' | 'destructive' | 'outline'
      className?: string
    }
  ): ColumnDef<T, any> => ({
    accessorKey: accessor as string,
    header,
    cell: ({ getValue }) => (
      <StatusBadge 
        status={getValue()} 
        variant={options?.variant}
        className={options?.className}
      />
    ),
  }),

  // 日期列
  date: <T,>(
    accessor: keyof T,
    header: string,
    options?: {
      format?: (date: Date | string) => string
      className?: string
    }
  ): ColumnDef<T, any> => ({
    accessorKey: accessor as string,
    header,
    cell: ({ getValue }) => {
      const value = getValue()
      if (!value) return '-'
      
      if (options?.format) {
        return <span className={options.className}>{options.format(value)}</span>
      }
      
      const date = new Date(value)
      return (
        <span className={options?.className}>
          {date.toLocaleDateString('zh-CN')}
        </span>
      )
    },
  }),

  // 数字列
  number: <T,>(
    accessor: keyof T,
    header: string,
    options?: {
      format?: (num: number) => string
      className?: string
    }
  ): ColumnDef<T, any> => ({
    accessorKey: accessor as string,
    header,
    cell: ({ getValue }) => {
      const value = getValue()
      if (value === null || value === undefined) return '-'
      
      if (options?.format) {
        return <span className={options.className}>{options.format(value)}</span>
      }
      
      return <span className={options?.className}>{value.toLocaleString()}</span>
    },
  }),

  // 布尔值列
  boolean: <T,>(
    accessor: keyof T,
    header: string,
    options?: {
      trueLabel?: string
      falseLabel?: string
      className?: string
    }
  ): ColumnDef<T, any> => ({
    accessorKey: accessor as string,
    header,
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <StatusBadge 
          status={value ? (options?.trueLabel || '是') : (options?.falseLabel || '否')}
          variant={value ? 'default' : 'secondary'}
          className={options?.className}
        />
      )
    },
  }),
}