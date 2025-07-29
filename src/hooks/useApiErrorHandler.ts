'use client';

import { message } from 'antd';
import { useCallback } from 'react';
import type { StandardApiResponse } from '@/shared/types/common';

/**
 * 统一的 API 错误处理 Hook
 * 
 * 用于处理 HTTP API 请求的成功和失败响应，提供统一的错误提示逻辑
 */
export const useApiErrorHandler = () => {
  /**
   * 处理 API 响应
   * @param response API 响应对象
   * @param operation 操作名称，如 '创建出口'、'获取用户信息' 等
   * @param options 处理选项
   */
  const handleApiResponse = useCallback(<T>(
    response: StandardApiResponse<T>,
    operation: string,
    options: {
      /** 是否显示成功提示，默认 true */
      showSuccess?: boolean;
      /** 是否显示错误提示，默认 true */
      showError?: boolean;
      /** 自定义成功消息 */
      customSuccessMessage?: string;
      /** 自定义错误消息 */
      customErrorMessage?: string;
      /** 成功时的回调函数 */
      onSuccess?: (data: T | undefined) => void;
      /** 失败时的回调函数 */
      onError?: (error: string) => void;
    } = {}
  ) => {
    const {
      showSuccess = true,
      showError = true,
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError
    } = options;

    if (response.success) {
      const successMessage = customSuccessMessage || response.message || `${operation}成功！`;
      
      if (showSuccess) {
        message.success(successMessage);
      }
      
      console.log(`✓ ${operation}成功`, response.data);
      onSuccess?.(response.data);
    } else {
      const errorMessage = customErrorMessage || response.message || `${operation}失败`;
      
      if (showError) {
        message.error(errorMessage);
      }
      
      console.error(`✗ ${operation}失败:`, {
        message: response.message,
        data: response.data,
        response
      });
      
      onError?.(errorMessage);
    }

    return response;
  }, []);

  /**
   * 处理异步 API 操作
   * @param asyncOperation 异步操作 Promise
   * @param operation 操作名称
   * @param options 处理选项
   */
  const handleAsyncOperation = useCallback(async <T>(
    asyncOperation: Promise<StandardApiResponse<T>>,
    operation: string,
    options: {
      /** 是否显示成功提示，默认 true */
      showSuccess?: boolean;
      /** 是否显示错误提示，默认 true */
      showError?: boolean;
      /** 自定义成功消息 */
      customSuccessMessage?: string;
      /** 自定义错误消息 */
      customErrorMessage?: string;
      /** 成功时的回调函数 */
      onSuccess?: (data: T | undefined) => void;
      /** 失败时的回调函数 */
      onError?: (error: string) => void;
    } = {}
  ): Promise<StandardApiResponse<T>> => {
    const {
      showError = true,
      customErrorMessage,
      onError
    } = options;

    try {
      const response = await asyncOperation;
      return handleApiResponse(response, operation, options);
    } catch (error) {
      console.error(`✗ ${operation}异常:`, error);
      
      const errorMessage = customErrorMessage || 
        (error instanceof Error ? error.message : `${operation}时发生错误，请稍后重试`);
      
      if (showError) {
        message.error(errorMessage);
      }

      onError?.(errorMessage);

      return {
        success: false,
        message: errorMessage
      };
    }
  }, [handleApiResponse]);

  /**
   * 数据获取操作（通常不显示成功提示）
   */
  const handleDataFetch = useCallback(<T>(
    response: StandardApiResponse<T>,
    operation: string,
    options: {
      /** 是否显示错误提示，默认 true */
      showError?: boolean;
      /** 自定义错误消息 */
      customErrorMessage?: string;
      /** 成功时的回调函数 */
      onSuccess?: (data: T | undefined) => void;
      /** 失败时的回调函数 */
      onError?: (error: string) => void;
    } = {}
  ) => {
    return handleApiResponse(response, operation, {
      ...options,
      showSuccess: false // 数据获取操作默认不显示成功提示
    });
  }, [handleApiResponse]);

  /**
   * 用户操作（通常显示成功和失败提示）
   */
  const handleUserAction = useCallback(<T>(
    response: StandardApiResponse<T>,
    operation: string,
    options: {
      /** 是否显示成功提示，默认 true */
      showSuccess?: boolean;
      /** 是否显示错误提示，默认 true */
      showError?: boolean;
      /** 自定义成功消息 */
      customSuccessMessage?: string;
      /** 自定义错误消息 */
      customErrorMessage?: string;
      /** 成功时的回调函数 */
      onSuccess?: (data: T | undefined) => void;
      /** 失败时的回调函数 */
      onError?: (error: string) => void;
    } = {}
  ) => {
    return handleApiResponse(response, operation, {
      showSuccess: true, // 用户操作默认显示成功提示
      showError: true,   // 用户操作默认显示错误提示
      ...options
    });
  }, [handleApiResponse]);

  return {
    handleApiResponse,
    handleAsyncOperation,
    handleDataFetch,
    handleUserAction
  };
};
