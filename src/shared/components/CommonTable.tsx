/**
 * 通用表格组件
 * 基于Ant Design的ProTable封装，提供标准化的表格功能
 */

import React, { useCallback, useMemo } from 'react';
import { EditableProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Pagination, OperationResult, BatchOperationResult } from '../types/common';
import { TABLE_CONFIG, PAGINATION_CONFIG } from '../constants';

export interface CommonTableColumn<T> extends Omit<ProColumns<T>, 'editable'> {
  copyable?: boolean;
  editableCell?: boolean;
}

export interface CommonTableProps<T> {
  // 数据相关
  data: T[];
  loading?: boolean;
  pagination?: Pagination;
  
  // 列配置
  columns: CommonTableColumn<T>[];
  rowKey?: string | ((record: T) => string);
  
  // 操作相关
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => Promise<OperationResult>;
  onBatchDelete?: (selectedRows: T[]) => Promise<BatchOperationResult>;
  onReload?: () => void;
  onPageChange?: (page: number, pageSize?: number) => void;
  
  // 表格配置
  title?: string;
  showAdd?: boolean;
  showReload?: boolean;
  showBatchDelete?: boolean;
  showActions?: boolean;
  editable?: boolean;
  selectable?: boolean;
  
  // 样式配置
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  
  // 其他配置
  actionRef?: React.MutableRefObject<ActionType | undefined>;
}

export function CommonTable<T extends Record<string, unknown>>({
  data,
  loading = false,
  pagination,
  columns,
  rowKey = 'id',
  onAdd,
  onEdit,
  onDelete,
  onBatchDelete,
  onReload,
  onPageChange,
  title,
  showAdd = true,
  showReload = true,
  showBatchDelete = false,
  showActions = true,
  editable = false,
  selectable = false,
  size = TABLE_CONFIG.SIZE,
  bordered = TABLE_CONFIG.BORDER,
  actionRef,
}: CommonTableProps<T>) {
  
  // 处理分页变化
  const handlePaginationChange = useCallback((page: number, pageSize?: number) => {
    onPageChange?.(page, pageSize);
  }, [onPageChange]);

  // 处理删除
  const handleDelete = useCallback(async (record: T) => {
    if (!onDelete) return;
    
    const result = await onDelete(record);
    if (result.success) {
      message.success('删除成功');
      onReload?.();
    } else {
      message.error(result.message || '删除失败');
    }
  }, [onDelete, onReload]);

  // 处理批量删除
  const _handleBatchDelete = useCallback(async (selectedRows: T[]) => {
    if (!onBatchDelete || selectedRows.length === 0) return;
    
    const result = await onBatchDelete(selectedRows);
    if (result.success) {
      message.success(`成功删除 ${result.successCount} 项`);
      onReload?.();
    } else {
      message.error(`删除失败: ${result.failures?.[0]?.message || '未知错误'}`);
    }
  }, [onBatchDelete, onReload]);

  // 扩展列配置，添加操作列
  const enhancedColumns = useMemo(() => {
    const cols = [...columns];
    
    if (showActions && (onEdit || onDelete)) {
      cols.push({
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Space size="small">
            {onEdit && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              >
                编辑
              </Button>
            )}
            {onDelete && (
              <Popconfirm
                title="确定要删除这条记录吗？"
                onConfirm={() => handleDelete(record)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                >
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        ),
      } as CommonTableColumn<T>);
    }
    
    return cols;
  }, [columns, showActions, onEdit, onDelete, handleDelete]);

  // 工具栏配置
  const toolBarRender = useCallback(() => {
    const actions = [];
    
    if (showAdd && onAdd) {
      actions.push(
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          新增
        </Button>
      );
    }
    
    if (showReload && onReload) {
      actions.push(
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={onReload}
        >
          刷新
        </Button>
      );
    }
    
    return actions;
  }, [showAdd, onAdd, showReload, onReload]);

  // 分页配置
  const paginationConfig = useMemo(() => {
    if (!pagination) return false;
    
    return {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showSizeChanger: pagination.showSizeChanger ?? PAGINATION_CONFIG.SHOW_SIZE_CHANGER,
      showQuickJumper: pagination.showQuickJumper ?? PAGINATION_CONFIG.SHOW_QUICK_JUMPER,
      showTotal: pagination.showTotal 
        ? (total: number, range: [number, number]) => 
            `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`
        : undefined,
      pageSizeOptions: [...PAGINATION_CONFIG.PAGE_SIZE_OPTIONS],
      onChange: handlePaginationChange,
      onShowSizeChange: handlePaginationChange,
    };
  }, [pagination, handlePaginationChange]);

  // 行选择配置
  const rowSelection = useMemo(() => {
    if (!selectable && !showBatchDelete) return undefined;
    
    return {
      onChange: (_selectedRowKeys: React.Key[], _selectedRows: T[]) => {
        // 可以在这里处理选中行的变化
      },
      selections: showBatchDelete ? [
        {
          key: 'all',
          text: '全选所有',
          onSelect: () => {
            // 全选逻辑
          },
        },
        {
          key: 'invert',
          text: '反选当前页',
          onSelect: () => {
            // 反选逻辑
          },
        },
      ] : undefined,
    };
  }, [selectable, showBatchDelete]);

  return (
    <EditableProTable<T>
      actionRef={actionRef}
      columns={enhancedColumns}
      dataSource={data}
      loading={loading}
      pagination={paginationConfig}
      rowKey={rowKey}
      rowSelection={rowSelection}
      size={size}
      bordered={bordered}
      scroll={{ x: 'max-content' }}
      search={false}
      dateFormatter="string"
      toolBarRender={toolBarRender}
      headerTitle={title}
      editable={editable ? {
        type: 'multiple',
        editableKeys: [],
        onSave: async (key, record) => {
          // 编辑保存逻辑
          console.log('保存记录:', key, record);
        },
      } : undefined}
      options={{
        reload: false, // 禁用内置刷新按钮，使用自定义的
        density: true,
        fullScreen: true,
        setting: true,
      }}
      cardBordered
      form={{
        syncToUrl: false,
      }}
    />
  );
}

export default CommonTable;
