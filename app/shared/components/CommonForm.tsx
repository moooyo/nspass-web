/**
 * 通用表单组件
 * 基于Ant Design的ModalForm封装，提供标准化的表单功能
 */

import React, { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea, ProFormDigit, ProFormCheckbox } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import type { Rule } from 'antd/es/form';
import { FORM_CONFIG, MODAL_CONFIG } from '../constants';
import type { Option } from '../types/common';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'textarea' | 'select' | 'number' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Option[];
  rules?: Rule[];
  dependencies?: string[];
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
}

export interface CommonFormProps {
  title: string;
  visible: boolean;
  loading?: boolean;
  width?: number;
  fields: FormField[];
  initialValues?: Record<string, unknown>;
  onFinish: (values: Record<string, unknown>) => Promise<boolean>;
  onCancel: () => void;
  form?: FormInstance;
  modalProps?: Record<string, unknown>;
  formProps?: Record<string, unknown>;
}

export function CommonForm({
  title,
  visible,
  loading = false,
  width = MODAL_CONFIG.DEFAULT_WIDTH,
  fields,
  initialValues,
  onFinish,
  onCancel,
  form,
  modalProps = {},
  formProps = {},
}: CommonFormProps) {
  const [formInstance] = Form.useForm(form);

  // 当表单可见且有初始值时，设置表单值
  useEffect(() => {
    if (visible && initialValues) {
      formInstance.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, formInstance]);

  // 渲染表单字段
  const renderField = (field: FormField) => {
    if (field.hidden) return null;

    const commonProps = {
      name: field.name,
      label: field.label,
      rules: field.rules || (field.required ? [{ required: true, message: `请输入${field.label}` }] : []),
      placeholder: field.placeholder || `请输入${field.label}`,
      disabled: field.disabled,
      tooltip: field.tooltip,
      dependencies: field.dependencies,
    };

    switch (field.type) {
      case 'text':
        return <ProFormText key={field.name} {...commonProps} />;
      
      case 'password':
        return <ProFormText.Password key={field.name} {...commonProps} />;
      
      case 'email':
        return (
          <ProFormText
            key={field.name}
            {...commonProps}
            rules={[
              ...(commonProps.rules || []),
              { type: 'email' as const, message: '请输入有效的邮箱地址' },
            ]}
          />
        );
      
      case 'textarea':
        return <ProFormTextArea key={field.name} {...commonProps} />;
      
      case 'select':
        return (
          <ProFormSelect
            key={field.name}
            {...commonProps}
            options={field.options}
            showSearch
            placeholder={field.placeholder || `请选择${field.label}`}
          />
        );
      
      case 'number':
        return <ProFormDigit key={field.name} {...commonProps} />;
      
      case 'checkbox':
        return (
          <ProFormCheckbox
            key={field.name}
            name={field.name}
            disabled={field.disabled}
          >
            {field.label}
          </ProFormCheckbox>
        );
      
      default:
        return <ProFormText key={field.name} {...commonProps} />;
    }
  };

  return (
    <ModalForm
      title={title}
      open={visible}
      form={formInstance}
      width={width}
      layout={FORM_CONFIG.LAYOUT}
      labelCol={FORM_CONFIG.LABEL_COL}
      wrapperCol={FORM_CONFIG.WRAPPER_COL}
      modalProps={{
        maskClosable: MODAL_CONFIG.MASK_CLOSABLE,
        keyboard: MODAL_CONFIG.KEYBOARD,
        centered: MODAL_CONFIG.CENTERED,
        destroyOnClose: true,
        ...modalProps,
        onCancel,
      }}
      submitter={{
        resetButtonProps: {
          style: { display: 'none' },
        },
        submitButtonProps: {
          loading,
        },
      }}
      onFinish={async (values) => {
        const success = await onFinish(values);
        if (success) {
          formInstance.resetFields();
        }
        return success;
      }}
      {...formProps}
    >
      {fields.map(renderField)}
    </ModalForm>
  );
}

export default CommonForm;
