/**
 * 测试全局HTTP客户端的baseURL配置
 */
import { globalHttpClient } from '@/shared/services/EnhancedBaseService';

// 测试函数
export function testGlobalClient() {
  console.log('🔍 测试全局HTTP客户端配置:');
  console.log('当前 baseURL:', globalHttpClient.getCurrentBaseURL());
  
  // 测试更新baseURL
  console.log('🔄 测试更新baseURL到Mock模式...');
  globalHttpClient.updateBaseURL('http://localhost:3000');
  console.log('更新后 baseURL:', globalHttpClient.getCurrentBaseURL());
  
  // 测试更新baseURL到后端模式
  console.log('🔄 测试更新baseURL到后端模式...');
  globalHttpClient.updateBaseURL('https://nspass.elwood.dev');
  console.log('更新后 baseURL:', globalHttpClient.getCurrentBaseURL());
}

// 在浏览器控制台中可以调用 window.testGlobalClient()
if (typeof window !== 'undefined') {
  (window as any).testGlobalClient = testGlobalClient;
}
