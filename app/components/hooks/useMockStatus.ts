'use client';

import { useContext } from 'react';
import { MSWContext } from '../MSWProvider';

/**
 * 自定义钩子，用于获取和管理Mock状态
 * @returns {Object} { mockEnabled, setMockEnabled } - Mock状态和设置函数
 */
export const useMockStatus = () => {
  const { enabled, setEnabled } = useContext(MSWContext);
  
  return {
    mockEnabled: enabled,
    setMockEnabled: setEnabled,
  };
}; 