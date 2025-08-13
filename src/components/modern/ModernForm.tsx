import React from 'react'
import { useForm, Control, FieldPath, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// 表单字段类型定义
export interface ModernFormFieldBase {
  name: string
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export interface ModernFormFieldText extends ModernFormFieldBase {
  type: 'text' | 'email' | 'password' | 'url' | 'tel'
}

export interface ModernFormFieldNumber extends ModernFormFieldBase {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export interface ModernFormFieldTextarea extends ModernFormFieldBase {
  type: 'textarea'
  rows?: number
}

export interface ModernFormFieldSelect extends ModernFormFieldBase {
  type: 'select'
  options: Array<{ label: string; value: string | number }>
}

export interface ModernFormFieldSwitch extends ModernFormFieldBase {
  type: 'switch'
}

export type ModernFormField = 
  | ModernFormFieldText 
  | ModernFormFieldNumber 
  | ModernFormFieldTextarea 
  | ModernFormFieldSelect 
  | ModernFormFieldSwitch

// 表单配置
export interface ModernFormConfig {
  title: string
  description?: string
  fields: ModernFormField[]
  schema: z.ZodSchema<any>
  defaultValues?: Record<string, any>
  submitButtonText?: string
  cancelButtonText?: string
  showCancel?: boolean
  layout?: 'vertical' | 'horizontal'
  columns?: 1 | 2 | 3
}

// 表单属性
export interface ModernFormProps {
  config: ModernFormConfig
  onSubmit: (data: any) => Promise<void> | void
  onCancel?: () => void
  loading?: boolean
  className?: string
}

// 模态框表单属性
export interface ModernFormModalProps extends ModernFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  width?: string
}

// 表单字段渲染器
function FormFieldRenderer({
  field,
  control,
}: {
  field: ModernFormField
  control: Control<any>
}) {
  return (
    <FormField
      control={control}
      name={field.name as any}
      render={({ field: formField }) => (
        <FormItem className={field.className}>
          <FormLabel className={cn(field.required && 'required')}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {field.type === 'text' || field.type === 'email' || field.type === 'password' || 
             field.type === 'url' || field.type === 'tel' ? (
              <Input
                type={field.type}
                placeholder={field.placeholder}
                disabled={field.disabled}
                {...formField}
              />
            ) : field.type === 'number' ? (
              <Input
                type="number"
                placeholder={field.placeholder}
                disabled={field.disabled}
                min={field.min}
                max={field.max}
                step={field.step}
                {...formField}
                onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : '')}
              />
            ) : field.type === 'textarea' ? (
              <Textarea
                placeholder={field.placeholder}
                disabled={field.disabled}
                rows={field.rows}
                {...formField}
              />
            ) : field.type === 'select' ? (
              <Select
                value={formField.value?.toString()}
                onValueChange={formField.onChange}
                disabled={field.disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'switch' ? (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={field.disabled}
                />
                <Label htmlFor={field.name} className="text-sm text-muted-foreground">
                  {field.placeholder}
                </Label>
              </div>
            ) : null}
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 主表单组件
export function ModernForm({
  config,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: ModernFormProps) {
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues,
  })

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const isHorizontal = config.layout === 'horizontal'
  const columns = config.columns || 1

  return (
    <div className={cn('space-y-6', className)}>
      {/* 表单标题和描述 */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{config.title}</h2>
        {config.description && (
          <p className="text-muted-foreground">{config.description}</p>
        )}
      </div>

      {/* 表单内容 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div 
            className={cn(
              'space-y-4',
              columns > 1 && `grid gap-4 grid-cols-1 md:grid-cols-${columns}`,
              isHorizontal && 'space-y-2'
            )}
          >
            {config.fields.map((field) => (
              <FormFieldRenderer
                key={field.name}
                field={field}
                control={form.control}
              />
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {config.showCancel !== false && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {config.cancelButtonText || '取消'}
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config.submitButtonText || '提交'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

// 模态框表单组件
export function ModernFormModal({
  open,
  onOpenChange,
  width = '500px',
  config,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: ModernFormModalProps) {
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues,
  })

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
    onOpenChange(false)
  }

  const columns = config.columns || 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl', className)} style={{ width }}>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div 
              className={cn(
                'space-y-4',
                columns > 1 && `grid gap-4 grid-cols-1 md:grid-cols-${columns}`
              )}
            >
              {config.fields.map((field) => (
                <FormFieldRenderer
                  key={field.name}
                  field={field}
                  control={form.control}
                />
              ))}
            </div>

            <DialogFooter>
              {config.showCancel !== false && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {config.cancelButtonText || '取消'}
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {config.submitButtonText || '提交'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// 快速创建表单字段的辅助函数
export const createFormField = {
  text: (name: string, label: string, options?: Partial<ModernFormFieldText>): ModernFormFieldText => ({
    type: 'text',
    name,
    label,
    ...options,
  }),
  
  email: (name: string, label: string, options?: Partial<ModernFormFieldText>): ModernFormFieldText => ({
    type: 'email',
    name,
    label,
    ...options,
  }),
  
  password: (name: string, label: string, options?: Partial<ModernFormFieldText>): ModernFormFieldText => ({
    type: 'password',
    name,
    label,
    ...options,
  }),
  
  number: (name: string, label: string, options?: Partial<ModernFormFieldNumber>): ModernFormFieldNumber => ({
    type: 'number',
    name,
    label,
    ...options,
  }),
  
  textarea: (name: string, label: string, options?: Partial<ModernFormFieldTextarea>): ModernFormFieldTextarea => ({
    type: 'textarea',
    name,
    label,
    rows: 3,
    ...options,
  }),
  
  select: (name: string, label: string, options: Array<{ label: string; value: string | number }>, fieldOptions?: Partial<ModernFormFieldSelect>): ModernFormFieldSelect => ({
    type: 'select',
    name,
    label,
    options,
    ...fieldOptions,
  }),
  
  switch: (name: string, label: string, options?: Partial<ModernFormFieldSwitch>): ModernFormFieldSwitch => ({
    type: 'switch',
    name,
    label,
    ...options,
  }),
}