import { createContext } from 'react';

// MSW相关类型
export interface MSWContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

// 创建Mock状态的Context
export const MSWContext = createContext<MSWContextType>({
  enabled: true,
  setEnabled: () => {}
}); 