/**
 * 通用搜索组件
 * 提供标准化的搜索和过滤功能
 */

import React, { useState, useCallback } from 'react';
import { QueryFilter, ProFormText, ProFormSelect, ProFormDateRangePicker } from '@ant-design/pro-components';
import { Button, Space, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Option, SearchFilter, QueryParams } from '../types/common';
import { useDebounce } from '../hooks';

export interface SearchField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'dateRange';
  placeholder?: string;
  options?: Option[];
  allowClear?: boolean;
  showSearch?: boolean;
}

export interface CommonSearchProps {
  fields: SearchField[];
  onSearch: (params: QueryParams) => void;
  onReset?: () => void;
  loading?: boolean;
  defaultValues?: Record<string, unknown>;
  collapsed?: boolean;
  showReset?: boolean;
  debounceDelay?: number;
}

export function CommonSearch({
  fields,
  onSearch,
  onReset,
  loading = false,
  defaultValues = {},
  collapsed = true,
  showReset = true,
  debounceDelay = 300,
}: CommonSearchProps) {
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>(defaultValues);
  
  // 使用防抖处理搜索
  const debouncedSearchValues = useDebounce(searchValues, debounceDelay);

  // 处理搜索值变化
  const handleValuesChange = useCallback((changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    setSearchValues(allValues);
  }, []);

  // 执行搜索
  React.useEffect(() => {
    const filters: SearchFilter[] = [];
    
    Object.entries(debouncedSearchValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // 根据字段类型构建不同的过滤器
        const field = fields.find(f => f.name === key);
        if (field) {
          if (field.type === 'dateRange' && Array.isArray(value) && value.length === 2) {
            // 日期范围过滤
            filters.push({
              field: key,
              operator: 'gte',
              value: value[0],
            });
            filters.push({
              field: key,
              operator: 'lte',
              value: value[1],
            });
          } else if (field.type === 'text') {
            // 文本模糊搜索
            filters.push({
              field: key,
              operator: 'like',
              value,
            });
          } else {
            // 精确匹配
            filters.push({
              field: key,
              operator: 'eq',
              value,
            });
          }
        }
      }
    });

    onSearch({
      search: typeof debouncedSearchValues.search === 'string' ? debouncedSearchValues.search : undefined,
      filters,
    });
  }, [debouncedSearchValues, fields, onSearch]);

  // 重置搜索
  const handleReset = useCallback(() => {
    setSearchValues(defaultValues);
    onReset?.();
  }, [defaultValues, onReset]);

  // 渲染搜索字段
  const renderField = (field: SearchField) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      placeholder: field.placeholder || `请输入${field.label}`,
      allowClear: field.allowClear ?? true,
    };

    switch (field.type) {
      case 'text':
        return (
          <ProFormText
            key={field.name}
            {...commonProps}
          />
        );
      
      case 'select':
        return (
          <ProFormSelect
            key={field.name}
            {...commonProps}
            options={field.options}
            showSearch={field.showSearch ?? true}
            placeholder={field.placeholder || `请选择${field.label}`}
          />
        );
      
      case 'dateRange':
        return (
          <ProFormDateRangePicker
            key={field.name}
            name={field.name}
            label={field.label}
            placeholder={['开始日期', '结束日期']}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <QueryFilter
        collapsed={collapsed}
        defaultCollapsed={collapsed}
        onValuesChange={handleValuesChange}
        onReset={handleReset}
        submitter={{
          searchConfig: {
            submitText: '搜索',
          },
          render: (props) => (
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={loading}
                onClick={() => props.form?.submit()}
              >
                搜索
              </Button>
              {showReset && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    props.form?.resetFields();
                    handleReset();
                  }}
                >
                  重置
                </Button>
              )}
            </Space>
          ),
        }}
        span={6}
        labelWidth="auto"
      >
        {fields.map(renderField)}
      </QueryFilter>
    </Card>
  );
}

export default CommonSearch;
