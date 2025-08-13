import { toast } from 'sonner'
import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react'

export interface MessageOptions {
  description?: string
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  closeButton?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// 现代化消息系统
export const message = {
  // 成功消息
  success: (title: string, options?: MessageOptions) => {
    return toast.success(title, {
      description: options?.description,
      duration: options?.duration || 4000,
      position: options?.position,
      closeButton: options?.closeButton,
      action: options?.action,
      icon: React.createElement(CheckCircle, { size: 16 }),
    })
  },

  // 错误消息
  error: (title: string, options?: MessageOptions) => {
    return toast.error(title, {
      description: options?.description,
      duration: options?.duration || 5000,
      position: options?.position,
      closeButton: options?.closeButton,
      action: options?.action,
      icon: React.createElement(XCircle, { size: 16 }),
    })
  },

  // 警告消息
  warning: (title: string, options?: MessageOptions) => {
    return toast.warning(title, {
      description: options?.description,
      duration: options?.duration || 4000,
      position: options?.position,
      closeButton: options?.closeButton,
      action: options?.action,
      icon: React.createElement(AlertCircle, { size: 16 }),
    })
  },

  // 信息消息
  info: (title: string, options?: MessageOptions) => {
    return toast.info(title, {
      description: options?.description,
      duration: options?.duration || 4000,
      position: options?.position,
      closeButton: options?.closeButton,
      action: options?.action,
      icon: React.createElement(Info, { size: 16 }),
    })
  },

  // 加载消息
  loading: (title: string, options?: Omit<MessageOptions, 'duration'>) => {
    return toast.loading(title, {
      description: options?.description,
      position: options?.position,
      closeButton: options?.closeButton,
      action: options?.action,
      icon: React.createElement(Loader2, { size: 16 }),
    })
  },

  // 自定义消息
  custom: (title: string, options?: MessageOptions & { icon?: React.ReactNode }) => {
    return toast(title, {
      description: options?.description,
      duration: options?.duration || 4000,
      position: options?.position,
      closeButton: options?.closeButton,
      action: options?.action,
      icon: options?.icon,
    })
  },

  // Promise 消息（用于异步操作）
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
      description?: string
      position?: MessageOptions['position']
    }
  ) => {
    return toast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      description: options.description,
      position: options.position,
    })
  },

  // 关闭所有消息
  dismiss: () => {
    toast.dismiss()
  },

  // 关闭特定消息
  dismissById: (id: string | number) => {
    toast.dismiss(id)
  },
}

// 便捷的 API 操作消息
export const apiMessage = {
  // 成功操作
  success: (operation: string, resource?: string) => {
    const title = resource ? `${resource}${operation}成功` : `${operation}成功`
    return message.success(title)
  },

  // 失败操作
  error: (operation: string, resource?: string, error?: any) => {
    const title = resource ? `${resource}${operation}失败` : `${operation}失败`
    const description = error?.message || error?.toString() || '请稍后重试'
    return message.error(title, { description })
  },

  // 网络错误
  networkError: () => {
    return message.error('网络错误', {
      description: '请检查网络连接后重试'
    })
  },

  // 权限错误
  permissionError: () => {
    return message.error('权限不足', {
      description: '您没有执行此操作的权限'
    })
  },

  // 验证错误
  validationError: (fields?: string[]) => {
    const description = fields?.length ? `请检查以下字段：${fields.join('、')}` : '请检查输入信息'
    return message.error('表单验证失败', { description })
  },

  // 操作确认
  confirm: (operation: string, onConfirm: () => void) => {
    return message.warning(`确定要${operation}吗？`, {
      description: '此操作不可撤销',
      action: {
        label: '确认',
        onClick: onConfirm
      }
    })
  },

  // 异步操作
  asyncOperation: <T,>(
    promise: Promise<T>,
    operation: string,
    resource?: string
  ) => {
    const loadingText = resource ? `正在${operation}${resource}...` : `正在${operation}...`
    const successText = resource ? `${resource}${operation}成功` : `${operation}成功`
    const errorText = resource ? `${resource}${operation}失败` : `${operation}失败`

    return message.promise(promise, {
      loading: loadingText,
      success: successText,
      error: (error: any) => `${errorText}: ${error?.message || '未知错误'}`
    })
  },
}

// 导出默认消息系统以保持向后兼容
export default message