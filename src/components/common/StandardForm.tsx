/**
 * 标准化表单组件
 * 统一项目中的表单样式和行为，减少重复代码
 */

import React, { memo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Switch, 
  InputNumber, 
  DatePicker, 
  TimePicker,
  Checkbox,
  Radio,
  Upload,
  Button,
  Space,
  Row,
  Col,
  type FormProps,
  type FormInstance
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export type FormFieldType = 
  | 'input' 
  | 'textarea' 
  | 'password'
  | 'number' 
  | 'select' 
  | 'multiSelect'
  | 'switch' 
  | 'checkbox'
  | 'radio'
  | 'date' 
  | 'dateRange'
  | 'time'
  | 'upload'
  | 'custom';

export interface FormFieldOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tooltip?: string;
  
  // 验证规则
  rules?: any[];
  
  // 字段特定配置
  options?: FormFieldOption[]; // for select, radio, checkbox
  min?: number; // for number, textarea
  max?: number; // for number, textarea
  step?: number; // for number
  rows?: number; // for textarea
  multiple?: boolean; // for select, upload
  accept?: string; // for upload
  maxCount?: number; // for upload
  
  // 布局配置
  span?: number; // 栅格占位格数
  offset?: number; // 栅格左侧的间隔格数
  
  // 自定义渲染
  render?: (field: FormField, form: FormInstance) => React.ReactNode;
  
  // 依赖字段（当依赖字段变化时，重新渲染此字段）
  dependencies?: string[];
  
  // 显示条件
  visible?: (values: any) => boolean;
}

export interface StandardFormProps extends Omit<FormProps, 'onFinish'> {
  fields: FormField[];
  loading?: boolean;
  
  // 表单操作
  onSubmit?: (values: any) => void | Promise<void>;
  onCancel?: () => void;
  onReset?: () => void;
  
  // 按钮配置
  submitText?: string;
  cancelText?: string;
  resetText?: string;
  showCancel?: boolean;
  showReset?: boolean;
  
  // 布局配置
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: any;
  wrapperCol?: any;
  gutter?: number;
}

export interface StandardFormRef {
  form: FormInstance;
  submit: () => void;
  reset: () => void;
  getFieldsValue: () => any;
  setFieldsValue: (values: any) => void;
  validateFields: () => Promise<any>;
}

const StandardForm = forwardRef<StandardFormRef, StandardFormProps>(({
  fields,
  loading = false,
  onSubmit,
  onCancel,
  onReset,
  submitText = '提交',
  cancelText = '取消',
  resetText = '重置',
  showCancel = true,
  showReset = false,
  layout = 'vertical',
  labelCol,
  wrapperCol,
  gutter = 16,
  ...formProps
}, ref) => {
  const [form] = Form.useForm();
  
  // 暴露表单实例和方法
  useImperativeHandle(ref, () => ({
    form,
    submit: () => form.submit(),
    reset: () => form.resetFields(),
    getFieldsValue: () => form.getFieldsValue(),
    setFieldsValue: (values) => form.setFieldsValue(values),
    validateFields: () => form.validateFields(),
  }), [form]);
  
  // 处理表单提交
  const handleFinish = useCallback(async (values: any) => {
    if (onSubmit) {
      await onSubmit(values);
    }
  }, [onSubmit]);
  
  // 处理重置
  const handleReset = useCallback(() => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  }, [form, onReset]);
  
  // 渲染表单字段
  const renderField = useCallback((field: FormField) => {
    const { 
      name, 
      label, 
      type, 
      required, 
      disabled, 
      placeholder, 
      tooltip,
      rules = [],
      options = [],
      min,
      max,
      step,
      rows,
      multiple,
      accept,
      maxCount,
      render,
      dependencies,
      visible
    } = field;
    
    // 构建验证规则
    const fieldRules = [...rules];
    if (required) {
      fieldRules.unshift({ required: true, message: `请输入${label}` });
    }
    
    // 自定义渲染
    if (render) {
      return (
        <Form.Item
          key={name}
          name={name}
          label={label}
          rules={fieldRules}
          tooltip={tooltip}
          dependencies={dependencies}
        >
          {render(field, form)}
        </Form.Item>
      );
    }
    
    // 根据类型渲染不同的表单控件
    let fieldComponent: React.ReactNode;
    
    switch (type) {
      case 'input':
        fieldComponent = (
          <Input
            placeholder={placeholder || `请输入${label}`}
            disabled={disabled}
          />
        );
        break;
        
      case 'textarea':
        fieldComponent = (
          <TextArea
            placeholder={placeholder || `请输入${label}`}
            disabled={disabled}
            rows={rows || 4}
            minLength={min}
            maxLength={max}
            showCount={max !== undefined}
          />
        );
        break;
        
      case 'password':
        fieldComponent = (
          <Input.Password
            placeholder={placeholder || `请输入${label}`}
            disabled={disabled}
          />
        );
        break;
        
      case 'number':
        fieldComponent = (
          <InputNumber
            placeholder={placeholder || `请输入${label}`}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            style={{ width: '100%' }}
          />
        );
        break;
        
      case 'select':
      case 'multiSelect':
        fieldComponent = (
          <Select
            placeholder={placeholder || `请选择${label}`}
            disabled={disabled}
            mode={type === 'multiSelect' ? 'multiple' : undefined}
            allowClear
          >
            {options.map(option => (
              <Option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </Option>
            ))}
          </Select>
        );
        break;
        
      case 'switch':
        fieldComponent = (
          <Switch disabled={disabled} />
        );
        break;
        
      case 'checkbox':
        fieldComponent = (
          <Checkbox.Group options={options} disabled={disabled} />
        );
        break;
        
      case 'radio':
        fieldComponent = (
          <Radio.Group disabled={disabled}>
            {options.map(option => (
              <Radio 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        );
        break;
        
      case 'date':
        fieldComponent = (
          <DatePicker
            placeholder={placeholder || `请选择${label}`}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        );
        break;
        
      case 'dateRange':
        fieldComponent = (
          <RangePicker
            placeholder={[`开始${label}`, `结束${label}`]}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        );
        break;
        
      case 'time':
        fieldComponent = (
          <TimePicker
            placeholder={placeholder || `请选择${label}`}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        );
        break;
        
      case 'upload':
        fieldComponent = (
          <Upload
            accept={accept}
            multiple={multiple}
            maxCount={maxCount}
            disabled={disabled}
          >
            <Button icon={<UploadOutlined />} disabled={disabled}>
              {placeholder || `上传${label}`}
            </Button>
          </Upload>
        );
        break;
        
      default:
        fieldComponent = (
          <Input
            placeholder={placeholder || `请输入${label}`}
            disabled={disabled}
          />
        );
    }
    
    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={fieldRules}
        tooltip={tooltip}
        dependencies={dependencies}
        hidden={visible ? !visible(form.getFieldsValue()) : false}
      >
        {fieldComponent}
      </Form.Item>
    );
  }, [form]);
  
  return (
    <Form
      form={form}
      layout={layout}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      onFinish={handleFinish}
      {...formProps}
    >
      <Row gutter={gutter}>
        {fields.map(field => (
          <Col 
            key={field.name}
            span={field.span || (layout === 'inline' ? undefined : 24)}
            offset={field.offset}
          >
            {renderField(field)}
          </Col>
        ))}
      </Row>
      
      <Form.Item>
        <Space>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            {submitText}
          </Button>
          
          {showCancel && onCancel && (
            <Button onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          
          {showReset && (
            <Button onClick={handleReset}>
              {resetText}
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
});

StandardForm.displayName = 'StandardForm';

export default memo(StandardForm);
