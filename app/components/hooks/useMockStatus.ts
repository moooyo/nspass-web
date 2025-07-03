'use client';

import { useContext } from 'react';
import { MSWContext } from '../MSWProvider';

/**
 * 自定义钩子，用于获取和管理Mock状态
 * @returns {Object} { mockEnabled, setMockEnabled } - Mock状态和设置函数
 */
export const useMockStatus = () => {
  const context = useContext(MSWContext);
  
  if (!context) {
    throw new Error('useMockStatus must be used within MSWProvider');
  }
  
  const { enabled, toggle } = context;
  
  return {
    mockEnabled: enabled,
    setMockEnabled: toggle, // 使用toggle函数来切换状态
  };
}; 