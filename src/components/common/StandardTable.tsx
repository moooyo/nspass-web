/**
 * 标准化表格组件
 * 统一项目中的表格样式和行为，减少重复代码
 */

import React, { memo, useMemo, useCallback } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Popconfirm,
  Typography,
  Row,
  Col,
  Tooltip,
  type TableProps,
  type TableColumnType
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Title } = Typography;

export interface StandardTableColumn<T = any> extends Omit<TableColumnType<T>, 'render'> {
  render?: (value: any, record: T, index: number) => React.ReactNode;
  searchable?: boolean;
  sortable?: boolean;
}

export interface StandardTableProps<T = any> extends Omit<TableProps<T>, 'columns'> {
  // 基础配置
  title?: string;
  columns: StandardTableColumn<T>[];
  data: T[];
  
  // 加载状态
  loading?: boolean;
  
  // 分页配置
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange?: (page: number, pageSize: number) => void;
  };
  
  // 搜索配置
  searchConfig?: {
    placeholder?: string;
    onSearch?: (value: string) => void;
    allowClear?: boolean;
  };
  
  // 操作按钮配置
  actions?: {
    create?: {
      text?: string;
      onClick: () => void;
      disabled?: boolean;
    };
    refresh?: {
      onClick: () => void;
      disabled?: boolean;
    };
    batchDelete?: {
      onClick: (selectedRowKeys: React.Key[]) => void;
      disabled?: boolean;
    };
    custom?: Array<{
      key: string;
      text: string;
      icon?: React.ReactNode;
      onClick: () => void;
      disabled?: boolean;
      type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    }>;
  };
  
  // 行操作配置
  rowActions?: {
    edit?: {
      onClick: (record: T) => void;
      disabled?: (record: T) => boolean;
    };
    delete?: {
      onClick: (record: T) => void;
      disabled?: (record: T) => boolean;
      confirmTitle?: string;
    };
    custom?: Array<{
      key: string;
      text: string;
      icon?: React.ReactNode;
      onClick: (record: T) => void;
      disabled?: (record: T) => boolean;
      type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    }>;
  };
  
  // 选择配置
  selection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string };
  };
  
  // 样式配置
  cardProps?: {
    title?: string;
    extra?: React.ReactNode;
    bodyStyle?: React.CSSProperties;
  };
}

const StandardTable = <T extends Record<string, any> = any>({
  title,
  columns,
  data,
  loading = false,
  pagination,
  searchConfig,
  actions,
  rowActions,
  selection,
  cardProps,
  ...tableProps
}: StandardTableProps<T>) => {
  
  // 处理行操作列
  const enhancedColumns = useMemo(() => {
    const cols = [...columns];
    
    // 如果有行操作，添加操作列
    if (rowActions && (rowActions.edit || rowActions.delete || rowActions.custom)) {
      cols.push({
        title: '操作',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, record: T) => (
          <Space size="small">
            {rowActions.edit && (
              <Tooltip title="编辑">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  disabled={rowActions.edit.disabled?.(record)}
                  onClick={() => rowActions.edit!.onClick(record)}
                />
              </Tooltip>
            )}
            
            {rowActions.delete && (
              <Popconfirm
                title={rowActions.delete.confirmTitle || "确定要删除这条记录吗？"}
                onConfirm={() => rowActions.delete!.onClick(record)}
                okText="确定"
                cancelText="取消"
              >
                <Tooltip title="删除">
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={rowActions.delete.disabled?.(record)}
                  />
                </Tooltip>
              </Popconfirm>
            )}
            
            {rowActions.custom?.map((action) => (
              <Tooltip key={action.key} title={action.text}>
                <Button
                  type={action.type || 'link'}
                  size="small"
                  icon={action.icon}
                  disabled={action.disabled?.(record)}
                  onClick={() => action.onClick(record)}
                >
                  {action.text}
                </Button>
              </Tooltip>
            ))}
          </Space>
        ),
      });
    }
    
    return cols;
  }, [columns, rowActions]);
  
  // 处理选择配置
  const rowSelection = useMemo(() => {
    if (!selection) return undefined;
    
    return {
      type: selection.type || 'checkbox',
      selectedRowKeys: selection.selectedRowKeys,
      onChange: selection.onChange,
      getCheckboxProps: selection.getCheckboxProps,
    };
  }, [selection]);
  
  // 渲染工具栏
  const renderToolbar = useCallback(() => {
    if (!actions && !searchConfig) return null;
    
    return (
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            {actions?.create && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={actions.create.disabled}
                onClick={actions.create.onClick}
              >
                {actions.create.text || '新建'}
              </Button>
            )}
            
            {actions?.refresh && (
              <Button
                icon={<ReloadOutlined />}
                disabled={actions.refresh.disabled}
                onClick={actions.refresh.onClick}
              >
                刷新
              </Button>
            )}
            
            {actions?.batchDelete && selection?.selectedRowKeys && selection.selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定要删除选中的 ${selection.selectedRowKeys.length} 条记录吗？`}
                onConfirm={() => actions.batchDelete!.onClick(selection.selectedRowKeys!)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  danger
                  disabled={actions.batchDelete.disabled}
                >
                  批量删除
                </Button>
              </Popconfirm>
            )}
            
            {actions?.custom?.map((action) => (
              <Button
                key={action.key}
                type={action.type || 'default'}
                icon={action.icon}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.text}
              </Button>
            ))}
          </Space>
        </Col>
        
        <Col>
          {searchConfig && (
            <Search
              placeholder={searchConfig.placeholder || '请输入搜索关键词'}
              allowClear={searchConfig.allowClear !== false}
              onSearch={searchConfig.onSearch}
              style={{ width: 300 }}
              enterButton={<SearchOutlined />}
            />
          )}
        </Col>
      </Row>
    );
  }, [actions, searchConfig, selection]);
  
  const tableContent = (
    <>
      {renderToolbar()}
      <Table<T>
        columns={enhancedColumns}
        dataSource={data}
        loading={loading}
        pagination={pagination ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: pagination.showSizeChanger !== false,
          showQuickJumper: pagination.showQuickJumper !== false,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: pagination.onChange,
        } : false}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        {...tableProps}
      />
    </>
  );
  
  // 如果有卡片配置，包装在Card中
  if (cardProps || title) {
    return (
      <Card
        title={title || cardProps?.title}
        extra={cardProps?.extra}
        bodyStyle={cardProps?.bodyStyle}
      >
        {tableContent}
      </Card>
    );
  }
  
  return tableContent;
};

export default memo(StandardTable) as <T extends Record<string, any> = any>(
  props: StandardTableProps<T>
) => JSX.Element;
