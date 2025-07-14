/** * 统一的 Hooks 导出 * 重新导出 shared/hooks 以保持兼容性，避免代码重复 */// 重新导出 shared hooks，避免代码重复export {  useApi,  usePagination,  useTable,  useFormState,  useLocalStorage,  useDebounce,  useThrottle,  useAsyncEffect,  useMount,  useUnmount,  useUpdateEffect,  useInterval,  useTimeout,  useWindowSize,  useMountedState,  usePrevious,  useForceUpdate,  useCounter,  useToggle} from '@/shared/hooks';// 重新导出类型export type {  UseApiHookResult,  UseTableHookResult,  FormState,  OperationResult,  BatchOperationResult} from '@/shared/types/common';
// 保留原有的特定hooks
export { useApiOnce, useComponentInit } from './useApiOnce';
export { useAuth } from './useAuth';
export { useMockStatus } from './useMockStatus';
export { useTheme } from './useTheme';
