import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Modal, 
  Form, 
  message, 
  Popconfirm,
  Row,
  Col,
  Typography,
  Tag,
  Dropdown,
  type MenuProps
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  MoreOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import { useTable } from '../hooks';
import type { TableColumn, StandardApiResponse } from '@/types/index';

const { Search } = Input;
const { Title } = Typography;

/**
 * 通用表格组件属性接口
 */
interface CommonTableProps<T> {
  // 基础属性
  title?: string;
  columns: TableColumn<T>[];
  service: {
    getList: (params?: Record<string, unknown>) => Promise<StandardApiResponse<T[]>>;
    create: (data: Partial<T>) => Promise<StandardApiResponse<T>>;
    update: (id: string | number, data: Partial<T>) => Promise<StandardApiResponse<T>>;
    delete: (id: string | number) => Promise<StandardApiResponse<void>>;
    batchDelete: (ids: (string | number)[]) => Promise<StandardApiResponse<void>>;
  };
  
  // 功能开关
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showBatchDelete?: boolean;
  showSearch?: boolean;
  showRefresh?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  
  // 自定义渲染
  renderCreateForm?: (props: {
    visible: boolean;
    onSubmit: (data: Partial<T>) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
  }) => React.ReactNode;
  
  renderEditForm?: (props: {
    visible: boolean;
    record: T;
    onSubmit: (data: Partial<T>) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
  }) => React.ReactNode;
  
  renderActions?: (record: T) => React.ReactNode;
  
  // 回调函数
  onCreateSuccess?: (record: T) => void;
  onUpdateSuccess?: (record: T) => void;
  onDeleteSuccess?: (id: string | number) => void;
  onBatchDeleteSuccess?: (ids: (string | number)[]) => void;
  
  // 其他属性
  pageSize?: number;
  searchPlaceholder?: string;
  createButtonText?: string;
  rowKey?: string | ((record: T) => string);
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  scroll?: { x?: number; y?: number };
  
  // 工具栏扩展
  extraActions?: React.ReactNode;
  
  // 批量操作
  batchActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[], selectedRowKeys: (string | number)[]) => void;
    disabled?: boolean;
    danger?: boolean;
  }>;
}

/**
 * 通用表格组件
 */
export function CommonTable<T extends Record<string, unknown> & { [key: string]: string | number | unknown }>(props: CommonTableProps<T>) {
  const {
    title = '数据列表',
    columns,
    service,
    showCreate = true,
    showEdit = true,
    showDelete = true,
    showBatchDelete = true,
    showSearch = true,
    showRefresh = true,
    showExport = false,
    showImport = false,
    renderCreateForm,
    renderEditForm,
    renderActions,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    onBatchDeleteSuccess,
    pageSize = 10,
    searchPlaceholder = '搜索...',
    createButtonText = '新建',
    rowKey = 'id',
    size = 'middle',
    bordered = true,
    scroll,
    extraActions,
    batchActions = []
  } = props;

  const {
    data,
    loading,
    pagination,
    reload,
    create,
    update,
    delete: deleteItem,
    batchDelete
  } = useTable(service as Parameters<typeof useTable>[0], { initialPageSize: pageSize });

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // 处理搜索
  const handleSearch = (_value: string) => {
    // 这里可以添加搜索逻辑
    reload();
  };

  // 处理创建
  const handleCreate = async (data: Partial<T>) => {
    setCreateLoading(true);
    try {
      const result = await create(data);
      if (result.success) {
        setCreateModalVisible(false);
        onCreateSuccess?.(result.data as T);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // 处理编辑
  const handleEdit = (record: T) => {
    setEditingRecord(record);
    setEditModalVisible(true);
  };

  const handleUpdate = async (data: Partial<T>) => {
    if (!editingRecord) return;
    
    setEditLoading(true);
    try {
      const result = await update(editingRecord[rowKey as string] as string | number, data);
      if (result.success) {
        setEditModalVisible(false);
        setEditingRecord(null);
        onUpdateSuccess?.(result.data as T);
      }
    } finally {
      setEditLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async (record: T) => {
    const result = await deleteItem(record[rowKey as string] as string | number);
    if (result.success) {
      onDeleteSuccess?.(record[rowKey as string] as string | number);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的项');
      return;
    }

    const result = await batchDelete(selectedRowKeys);
    if (result.success) {
      setSelectedRowKeys([]);
      setSelectedRows([]);
      onBatchDeleteSuccess?.(selectedRowKeys);
    }
  };

  // 表格行选择配置已内联到 Table 组件中

  // 构建表格列（包含操作列）
  const tableColumns = [
    ...columns,
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: T) => (
        <Space size="small">
          {renderActions ? renderActions(record) : (
            <>
              {showEdit && (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  size="small"
                >
                  编辑
                </Button>
              )}
              {showDelete && (
                <Popconfirm
                  title="确定删除吗？"
                  onConfirm={() => handleDelete(record)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    删除
                  </Button>
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      )
    }
  ];

  // 批量操作菜单
  const batchMenuItems: MenuProps['items'] = [
    ...(showBatchDelete ? [{
      key: 'batchDelete',
      label: '批量删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '确定删除选中的项吗？',
          content: `将删除 ${selectedRowKeys.length} 个项目`,
          okText: '确定',
          cancelText: '取消',
          onOk: handleBatchDelete
        });
      }
    }] : []),
    ...batchActions.map(action => ({
      key: action.key,
      label: action.label,
      icon: action.icon,
      danger: action.danger,
      disabled: action.disabled,
      onClick: () => action.onClick(selectedRows, selectedRowKeys)
    }))
  ];

  return (
    <Card title={title} bordered={false}>
      {/* 工具栏 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            {showCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                {createButtonText}
              </Button>
            )}
            {selectedRowKeys.length > 0 && batchMenuItems.length > 0 && (
              <Dropdown menu={{ items: batchMenuItems }} trigger={['click']}>
                <Button icon={<MoreOutlined />}>
                  批量操作 ({selectedRowKeys.length})
                </Button>
              </Dropdown>
            )}
            {extraActions}
          </Space>
        </Col>
        <Col>
          <Space>
            {showSearch && (
              <Search
                placeholder={searchPlaceholder}
                allowClear
                onSearch={handleSearch}
                style={{ width: 200 }}
              />
            )}
            {showRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={() => reload()}
                loading={loading}
              />
            )}
            {showExport && (
              <Button icon={<ExportOutlined />}>
                导出
              </Button>
            )}
            {showImport && (
              <Button icon={<ImportOutlined />}>
                导入
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* 表格 */}
      <Table<T>
        dataSource={data as T[]}
        columns={tableColumns as any}
        rowKey={rowKey}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (_page, _pageSize) => reload(),
          onShowSizeChange: (_current, _size) => reload()
        }}
        rowSelection={showBatchDelete || batchActions.length > 0 ? {
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys as (string | number)[]);
            setSelectedRows(rows);
          }
        } : undefined}
        size={size}
        bordered={bordered}
        scroll={scroll}
      />

      {/* 创建表单弹窗 */}
      {renderCreateForm && renderCreateForm({
        visible: createModalVisible,
        onSubmit: handleCreate,
        onCancel: () => setCreateModalVisible(false),
        loading: createLoading
      })}

      {/* 编辑表单弹窗 */}
      {renderEditForm && editingRecord && renderEditForm({
        visible: editModalVisible,
        record: editingRecord,
        onSubmit: handleUpdate,
        onCancel: () => {
          setEditModalVisible(false);
          setEditingRecord(null);
        },
        loading: editLoading
      })}
    </Card>
  );
}

/**
 * 通用表单弹窗组件
 */
interface CommonFormModalProps<T = Record<string, unknown>> {
  title: string;
  visible: boolean;
  onSubmit: (values: T) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  width?: number;
  children: React.ReactNode;
  initialValues?: Partial<T>;
}

export function CommonFormModal<T = Record<string, unknown>>(props: CommonFormModalProps<T>) {
  const {
    title,
    visible,
    onSubmit,
    onCancel,
    loading = false,
    width = 600,
    children,
    initialValues
  } = props;

  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch {
      // 表单验证失败，不做处理
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={width}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        {children}
      </Form>
    </Modal>
  );
}

/**
 * 通用状态标签组件
 */
interface StatusTagProps {
  status: string;
  statusMap: Record<string, { color: string; text: string }>;
}

export function StatusTag({ status, statusMap }: StatusTagProps) {
  const config = statusMap[status] || { color: 'default', text: status };
  
  return (
    <Tag color={config.color}>
      {config.text}
    </Tag>
  );
}

/**
 * 通用操作按钮组件
 */
interface ActionButtonsProps {
  actions: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
    loading?: boolean;
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  }>;
  size?: 'small' | 'middle' | 'large';
  direction?: 'horizontal' | 'vertical';
}

export function ActionButtons(props: ActionButtonsProps) {
  const { actions, size = 'small', direction = 'horizontal' } = props;

  return (
    <Space direction={direction} size={size}>
      {actions.map(action => (
        <Button
          key={action.key}
          type={action.type || 'default'}
          size={size}
          icon={action.icon}
          onClick={action.onClick}
          disabled={action.disabled}
          danger={action.danger}
          loading={action.loading}
        >
          {action.label}
        </Button>
      ))}
    </Space>
  );
}

/**
 * 通用确认删除按钮
 */
interface DeleteButtonProps {
  onConfirm: () => void;
  title?: string;
  content?: string;
  buttonText?: string;
  buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
}

export function DeleteButton(props: DeleteButtonProps) {
  const {
    onConfirm,
    title = '确定删除吗？',
    content,
    buttonText = '删除',
    buttonType = 'link',
    size = 'small',
    disabled = false
  } = props;

  return (
    <Popconfirm
      title={title}
      description={content}
      onConfirm={onConfirm}
      okText="确定"
      cancelText="取消"
    >
      <Button
        type={buttonType}
        danger
        size={size}
        disabled={disabled}
        icon={<DeleteOutlined />}
      >
        {buttonText}
      </Button>
    </Popconfirm>
  );
}

/**
 * 通用空状态组件
 */
interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  image?: React.ReactNode;
}

export function EmptyState(props: EmptyStateProps) {
  const {
    title = '暂无数据',
    description = '当前没有任何数据',
    action,
    image
  } = props;

  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      {image}
      <Title level={4} style={{ marginTop: 16 }}>
        {title}
      </Title>
      <p style={{ color: '#999', marginBottom: 16 }}>
        {description}
      </p>
      {action}
    </div>
  );
}
